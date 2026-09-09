<?php
/**
 * Authoring least privilege (inc/roles.php, openspec
 * security-authoring-least-privilege): `unfiltered_html` is denied for every
 * role at runtime and stripped from stored roles, so an Administrator's
 * post save runs through wp_kses_post like everyone else's — executable
 * markup is dropped, rich formatting and block-comment JSON survive.
 *
 * Unlike the serializer suites (which insert unslashed fixtures with the
 * kses save filters removed), these tests run the real save path: a logged-in
 * Administrator, `kses_init()` deciding the filters, and slashed input the way
 * wp-admin / REST hand it to wp_insert_post().
 */

use WorDBless\BaseTestCase;

class TestRoles extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';
		// functions.php require_onces inc/roles.php, so its file-scope
		// add_filter calls only ran for the first test; re-attach.
		progressnow_roles_register();

		do_action( 'after_setup_theme' );

		// WorDBless clears options between tests; the roles table is an
		// option. Repopulate core's default roles (which DO grant
		// unfiltered_html to administrator + editor) so `init` has
		// something to strip.
		if ( ! get_role( 'administrator' ) ) {
			require_once ABSPATH . 'wp-admin/includes/schema.php';
			populate_roles();
		}

		do_action( 'init' );

		// WorDBless captures the *slashed* `wp_insert_post_data` payload
		// (priority 10) while core unslashes it one line later; unslash
		// first so what we read back is what MySQL would hold.
		add_filter( 'wp_insert_post_data', 'wp_unslash', 9 );

		parent::set_up();
	}

	public function tear_down() {
		wp_set_current_user( 0 );
		kses_remove_filters();
		parent::tear_down();
	}

	/** Log in as a freshly created Administrator; kses_init() re-evaluates on set_current_user. */
	private function login_as_admin() {
		$id = wp_insert_user(
			array(
				'user_login' => 'maintainer-' . wp_rand( 1000, 9999 ),
				'user_pass'  => 'not-a-real-password',
				'user_email' => 'maintainer-' . wp_rand( 1000, 9999 ) . '@example.org',
				'role'       => 'administrator',
			)
		);
		$this->assertIsInt( $id, 'wp_insert_user should succeed under WorDBless' );
		wp_set_current_user( $id );
		kses_init();

		return $id;
	}

	/** Insert a post the way wp-admin does: slashed input, current user's save filters on. */
	private function save_as_current_user( $content, $args = array() ) {
		$id = wp_insert_post(
			wp_slash(
				wp_parse_args(
					$args,
					array(
						'post_type'    => 'post',
						'post_status'  => 'publish',
						'post_title'   => 'Least privilege',
						'post_content' => $content,
					)
				)
			)
		);
		$this->assertIsInt( $id );

		return get_post( $id )->post_content;
	}

	/* ---------------------------------------------------------------------
	 * 1. Capability is gone everywhere
	 * ------------------------------------------------------------------ */

	public function test_no_stored_role_grants_unfiltered_html() {
		$this->assertSame( array(), progressnow_roles_with_unfiltered_html() );
		foreach ( wp_roles()->role_objects as $slug => $role ) {
			$this->assertFalse( $role->has_cap( 'unfiltered_html' ), "role {$slug} still lists unfiltered_html" );
		}
	}

	public function test_administrator_does_not_resolve_unfiltered_html() {
		$id = $this->login_as_admin();

		$this->assertTrue( current_user_can( 'manage_options' ), 'sanity: the user is a real Administrator' );
		$this->assertFalse( current_user_can( 'unfiltered_html' ) );
		$this->assertFalse( user_can( $id, 'unfiltered_html' ) );
		$this->assertTrue( has_filter( 'content_save_pre', 'wp_filter_post_kses' ) !== false, 'kses_init() must install the post save filter for an Administrator' );
	}

	public function test_regrant_by_role_editor_is_denied_and_undone() {
		$id = $this->login_as_admin();

		get_role( 'administrator' )->add_cap( 'unfiltered_html' );
		$this->assertSame( array( 'administrator' ), progressnow_roles_with_unfiltered_html(), 'sanity: the stored role now carries it' );

		// Runtime answer is still "no" even while the stored role grants it.
		$this->assertFalse( user_can( $id, 'unfiltered_html' ) );

		// The next request's init strips it from storage again.
		do_action( 'init' );
		$this->assertSame( array(), progressnow_roles_with_unfiltered_html() );
	}

	/* ---------------------------------------------------------------------
	 * 2. Administrator saves go through kses
	 * ------------------------------------------------------------------ */

	public function test_administrator_script_and_iframe_are_stripped_on_save() {
		$this->login_as_admin();

		$stored = $this->save_as_current_user(
			'<p>Hello</p><script>alert(1)</script><iframe src="https://evil.example/"></iframe>'
			. '<p onclick="alert(2)">x</p><a href="javascript:alert(3)">y</a><embed src="x.swf"><svg onload="alert(4)"></svg>'
		);

		$this->assertStringContainsString( '<p>Hello</p>', $stored );
		foreach ( array( '<script', '<iframe', '<embed', '<svg', 'onclick', 'onload', 'javascript:' ) as $bad ) {
			$this->assertStringNotContainsStringIgnoringCase( $bad, $stored, "{$bad} survived an Administrator save" );
		}
		$this->assertSame( array(), progressnow_audit_stored_markup( array( get_post( wp_insert_post( wp_slash( array( 'post_title' => 'x', 'post_content' => $stored, 'post_status' => 'publish' ) ) ) ) ) ) );
	}

	public function test_administrator_excerpt_is_kses_filtered_too() {
		$this->login_as_admin();

		$id = wp_insert_post( wp_slash( array( 'post_title' => 'x', 'post_status' => 'publish', 'post_content' => '<p>a</p>', 'post_excerpt' => 'Sum <script>alert(1)</script> mary' ) ) );
		$this->assertStringNotContainsString( '<script', get_post( $id )->post_excerpt );
		$this->assertStringContainsString( 'mary', get_post( $id )->post_excerpt );
	}

	public function test_rich_content_is_preserved_through_kses() {
		$this->login_as_admin();

		$rich = '<h2>Heading</h2><p>Body with <a href="https://example.org/" rel="noopener" target="_blank">a link</a>, <strong>bold</strong> and <em>em</em>.</p>'
			. '<ul><li>one</li><li>two</li></ul><ol><li>first</li></ol>'
			. '<figure class="wp-block-image"><img src="https://example.org/a.png" alt="An image" width="10" height="10" /></figure>'
			. '<blockquote><p>Quote</p><cite>Someone</cite></blockquote>';

		$stored = $this->save_as_current_user( $rich );

		foreach ( array( '<h2>Heading</h2>', 'href="https://example.org/"', 'target="_blank"', '<strong>bold</strong>', '<em>em</em>', '<ul><li>one</li>', '<ol><li>first</li></ol>', 'src="https://example.org/a.png"', 'alt="An image"', '<blockquote>', '<cite>Someone</cite>' ) as $keep ) {
			$this->assertStringContainsString( $keep, $stored, "{$keep} was lost through the kses save" );
		}
	}

	public function test_block_comment_json_survives_kses_save() {
		$this->login_as_admin();

		// What the editor serializes: `<`, `>`, `&`, `"` and `--` inside attrs
		// come out as \uXXXX escapes (serialize_block_attributes), so kses's
		// comment handling leaves the JSON intact.
		$attrs  = serialize_block_attributes(
			array(
				'name' => 'progressnow/video',
				'data' => array(
					'url'   => 'https://youtu.be/abc?a=1&b=2',
					'title' => 'Tom & Jerry <3 "quotes" -- dashes',
				),
				'mode' => 'preview',
			)
		);
		$stored = $this->save_as_current_user(
			'<!-- wp:paragraph {"align":"left","className":"lede"} --><p class="lede has-text-align-left">Hi</p><!-- /wp:paragraph -->'
			. "<!-- wp:progressnow/video {$attrs} /-->"
		);

		$blocks = array_values( array_filter( parse_blocks( $stored ), fn( $b ) => ! empty( $b['blockName'] ) ) );
		$this->assertCount( 2, $blocks );
		$this->assertSame( 'core/paragraph', $blocks[0]['blockName'] );
		$this->assertSame( array( 'align' => 'left', 'className' => 'lede' ), $blocks[0]['attrs'] );
		$this->assertSame( 'progressnow/video', $blocks[1]['blockName'] );
		// kses normalizes `&`/`<` inside attr strings (core filter_block_content);
		// the serializers decode again (see test_kses_normalized_attrs_…).
		$this->assertSame( 'https://youtu.be/abc?a=1&amp;b=2', $blocks[1]['attrs']['data']['url'] );
		$this->assertSame( 'https://youtu.be/abc?a=1&b=2', progressnow_safe_url( $blocks[1]['attrs']['data']['url'] ) );
		$this->assertSame( 'Tom & Jerry <3 "quotes" -- dashes', progressnow_blog_kses_plain( $blocks[1]['attrs']['data']['title'] ) );
	}

	/* ---------------------------------------------------------------------
	 * 3. The v-html prose allow-list stays strict
	 * ------------------------------------------------------------------ */

	public function test_blog_prose_allowlist_drops_embeds_and_handlers() {
		$out = progressnow_blog_kses_prose(
			'<p>ok <a href="https://x.example/" onclick="alert(1)">link</a></p><iframe src="https://x.example/"></iframe>'
			. '<script>1</script><style>p{}</style><svg onload="alert(1)"></svg><a href="javascript:alert(1)">bad</a><img src="x.png" alt="">'
		);

		$this->assertStringContainsString( '<p>ok <a href="https://x.example/">link</a></p>', $out );
		foreach ( array( '<iframe', '<script', '<style', '<svg', 'onclick', 'onload', 'javascript:', '<img' ) as $bad ) {
			$this->assertStringNotContainsStringIgnoringCase( $bad, $out );
		}
	}

	public function test_kses_normalized_attrs_reach_islands_as_plain_text() {
		// Core's filter_block_content runs wp_kses over every string attr on
		// a kses'd save, so `&` is stored as `&amp;`; the plain-text and URL
		// serializers must hand the islands the literal characters.
		$this->assertSame( 'Tom & Jerry <3', progressnow_blog_kses_plain( 'Tom &amp; Jerry &lt;3' ) );
		$this->assertSame( 'https://youtu.be/abc?a=1&b=2', progressnow_safe_url( 'https://youtu.be/abc?a=1&amp;b=2' ) );
		$this->assertSame( '', progressnow_safe_url( '&#106;avascript:alert(1)' ), 'entity-obfuscated scheme is decoded, then rejected' );
	}

	public function test_twig_autoescape_is_esc_html_semantics() {
		// Stored, kses-normalized text renders as typed (one encoding, not
		// two); markup is still escaped; entity-encoded markup stays inert.
		$render = static fn( $v ) => Timber\Timber::compile_string( '{{ v }}', array( 'v' => $v ) );

		$this->assertSame( 'Arts &amp; Culture', $render( 'Arts &amp; Culture' ) );
		$this->assertSame( 'Arts &amp; Culture', $render( 'Arts & Culture' ) );
		$this->assertSame( 'Tom &#038; Jerry', $render( 'Tom &#038; Jerry' ), 'wptexturize output' );
		$this->assertSame( '&lt;script&gt;alert(1)&lt;/script&gt;', $render( '<script>alert(1)</script>' ) );
		$this->assertSame( '&lt;script&gt;', $render( '&lt;script&gt;' ) );
		$this->assertSame( '&quot;x&quot; &#039;y&#039;', $render( '"x" \'y\'' ) );
		$this->assertSame( '&amp;foo;', $render( '&foo;' ), 'invalid entity is disarmed' );

		// The built-in strategies are untouched for explicit use.
		$this->assertSame( 'a&amp;amp;b', Timber\Timber::compile_string( "{{ v|e('html') }}", array( 'v' => 'a&amp;b' ) ) );
		$this->assertSame( 'a&amp;amp;b', Timber\Timber::compile_string( "{{ v|e('esc_html')|e('html') }}", array( 'v' => 'a&b' ) ) );
	}

	public function test_plain_text_reads_decode_kses_normalized_storage() {
		$this->assertSame( 'Arts & Culture <3', progressnow_plain_text( ' Arts &amp; Culture &lt;3 ' ) );
		$this->assertSame( '42', progressnow_plain_text( 42 ) );
		$this->assertSame( '', progressnow_plain_text( array( 'no' ) ) );

		$id = wp_insert_post( array( 'post_title' => 'p', 'post_status' => 'publish', 'post_type' => 'page' ) );
		update_post_meta( $id, 'about_intro', 'Arts &amp; Culture' );
		update_post_meta( $id, 'about_html', '<p>Arts &amp; Culture</p><script>x</script>' );
		$this->assertSame( 'Arts & Culture', progressnow_pages_text( $id, 'about_intro', 'default' ) );
		$this->assertSame( '<p>Arts &amp; Culture</p>x', progressnow_pages_text( $id, 'about_html', 'default', true ), 'HTML fields keep entities' );
	}

	/* ---------------------------------------------------------------------
	 * 4. Audits
	 * ------------------------------------------------------------------ */

	public function test_audit_users_reports_roles_and_no_unfiltered_html() {
		$id   = $this->login_as_admin();
		$rows = progressnow_audit_users( array( get_userdata( $id ) ) );

		$this->assertCount( 1, $rows );
		$this->assertSame( $id, $rows[0]['id'] );
		$this->assertSame( 'administrator', $rows[0]['roles'] );
		$this->assertSame( 'no', $rows[0]['unfilteredHtml'] );
	}

	public function test_audit_stored_markup_finds_legacy_executable_content() {
		// Content persisted before kses became unconditional: bypass the
		// save filters to seed it.
		kses_remove_filters();
		$legacy = wp_insert_post(
			array(
				'post_title'   => 'legacy',
				'post_status'  => 'publish',
				'post_content' => '<p>a</p><script>alert(1)</script>'
					. '<!-- wp:progressnow/video {"name":"progressnow/video","data":{"url":"https://x.example/","title":"<iframe src=x>"}} /-->',
				'post_excerpt' => '<p onmouseover="x()">e</p>',
			)
		);
		$clean  = wp_insert_post( array( 'post_title' => 'clean', 'post_status' => 'publish', 'post_content' => '<p>a &lt;script&gt; b</p><a href="https://x.example/">x</a>' ) );

		$findings = progressnow_audit_stored_markup( array( get_post( $legacy ), get_post( $clean ) ) );
		$seen     = array_map( fn( $f ) => "{$f['where']}|{$f['id']}|{$f['field']}|{$f['token']}", $findings );

		$this->assertContains( "post|{$legacy}|post_content|<script>", $seen );
		$this->assertContains( "post|{$legacy}|post_excerpt|onmouseover=", $seen );
		$this->assertContains( "block:progressnow/video|{$legacy}|attrs.data.title|<iframe>", $seen );
		foreach ( $seen as $line ) {
			$this->assertStringStartsNotWith( "post|{$clean}|", $line, 'clean content must not be flagged' );
		}
	}

	public function test_markup_token_detector() {
		$this->assertSame( '', progressnow_audit_markup_token( '<p>plain <strong>rich</strong> &lt;script&gt;</p>' ) );
		$this->assertSame( '', progressnow_audit_markup_token( array( 'not', 'a', 'string' ) ) );
		$this->assertSame( '<script>', progressnow_audit_markup_token( 'x <SCRIPT src=a></script>' ) );
		$this->assertSame( '<iframe>', progressnow_audit_markup_token( '< iframe src=x>' ) );
		$this->assertSame( 'onerror=', progressnow_audit_markup_token( '<img src=x onerror=alert(1)>' ) );
		$this->assertSame( 'javascript:', progressnow_audit_markup_token( '<a href = "javascript:alert(1)">' ) );
		$this->assertSame( '', progressnow_audit_markup_token( 'a sentence mentioning javascript: as text' ) );
	}
}
