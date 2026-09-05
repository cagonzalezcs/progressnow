<?php
/**
 * Blog sanitization (inc/blog.php): the prose kses allowlist and the
 * plain-text strip on captions/quotes/attributions/callout fields, applied
 * at serialize time in progressnow_blog_map_blocks() (post_content blocks).
 */

use WorDBless\BaseTestCase;

class TestBlogSanitization extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		// The capability-less test user routes inserts through the kses save
		// filters, which backslash-escape block comment JSON. Real editors
		// have unfiltered_html; serialize-time kses is what's under test.
		kses_remove_filters();

		parent::set_up();
	}

	public function tear_down() {
		parent::tear_down();
	}

	private function make_post( $content ) {
		return wp_insert_post(
			array(
				'post_type'    => 'post',
				'post_status'  => 'publish',
				'post_title'   => 'Sanitization post',
				'post_content' => $content,
			)
		);
	}

	/** Allowlisted prose tags survive; scripts, handlers, and iframes do not. */
	public function test_kses_prose_keeps_allowlist_drops_scripts() {
		$html = progressnow_blog_kses_prose(
			'<p>Hello <strong>world</strong> '
			. '<a href="https://example.org" onclick="steal()">link</a></p>'
			. '<h2>Heading</h2><script>evil()</script><iframe src="x"></iframe>'
		);

		$this->assertStringContainsString( '<p>', $html );
		$this->assertStringContainsString( '<strong>', $html );
		$this->assertStringContainsString( '<h2>', $html );
		$this->assertStringContainsString( 'href="https://example.org"', $html );

		$this->assertStringNotContainsString( '<script', $html );
		$this->assertStringNotContainsString( 'onclick', $html );
		$this->assertStringNotContainsString( '<iframe', $html );
	}

	/** Plain pass strips every tag (and the contents of script blocks) + trims. */
	public function test_kses_plain_strips_all_tags() {
		$this->assertSame(
			'Just text',
			progressnow_blog_kses_plain( '  <b>Just</b> <script>x()</script>text ' )
		);
	}

	/** onerror payloads and javascript: hrefs are neutralized end to end. */
	public function test_map_blocks_strips_onerror_and_javascript_urls() {
		$post_id = $this->make_post(
			"<!-- wp:paragraph -->\n<p>ok <img src=\"x\" onerror=\"alert(1)\">"
			. "<a href=\"javascript:alert(2)\">bad</a></p>\n<!-- /wp:paragraph -->"
		);

		$blocks = progressnow_blog_map_blocks( $post_id );

		$this->assertStringNotContainsString( 'onerror', $blocks[0]['html'] );
		$this->assertStringNotContainsString( '<img', $blocks[0]['html'] );
		$this->assertStringNotContainsString( 'javascript:', $blocks[0]['html'] );
		$this->assertStringContainsString( '<p>ok ', $blocks[0]['html'] );
	}

	/** map_blocks sanitizes the prose block and strips the pull-quote fields. */
	public function test_map_blocks_sanitizes_prose_and_quote() {
		$post_id = $this->make_post(
			"<!-- wp:paragraph -->\n<p>ok</p><script>bad()</script>\n<!-- /wp:paragraph -->\n\n"
			. "<!-- wp:pullquote -->\n<figure class=\"wp-block-pullquote\"><blockquote>"
			. '<p><em>Quote</em><script>x()</script></p><cite><b>Name</b></cite>'
			. "</blockquote></figure>\n<!-- /wp:pullquote -->"
		);

		$blocks = progressnow_blog_map_blocks( $post_id );

		$this->assertSame( 'prose', $blocks[0]['type'] );
		$this->assertStringContainsString( '<p>', $blocks[0]['html'] );
		$this->assertStringNotContainsString( '<script', $blocks[0]['html'] );

		$this->assertSame( 'pull_quote', $blocks[1]['type'] );
		$this->assertSame( 'Quote', $blocks[1]['quote'] );
		$this->assertSame( 'Name', $blocks[1]['attribution'] );
	}

	/** Classic (non-block) content still serializes as sanitized prose. */
	public function test_map_blocks_classic_content_is_prose() {
		$post_id = $this->make_post( '<p>Plain classic content.</p><script>evil()</script>' );

		$blocks = progressnow_blog_map_blocks( $post_id );

		$this->assertCount( 1, $blocks );
		$this->assertSame( 'prose', $blocks[0]['type'] );
		$this->assertStringContainsString( 'Plain classic content.', $blocks[0]['html'] );
		$this->assertStringNotContainsString( '<script', $blocks[0]['html'] );
	}
}
