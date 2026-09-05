<?php
/**
 * Gutenberg serialization (inc/blog.php): progressnow_blog_blocks_from_content()
 * maps post_content blocks onto the PostBlock island contracts, and
 * progressnow_blog_map_blocks() dispatches on has_blocks().
 *
 * Fixture markup mirrors what the editor saves; ACF block attrs use the
 * flat `data` layout ACF writes into the block comment.
 */

use WorDBless\BaseTestCase;

class TestBlogBlockSerialization extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		// The capability-less test user routes inserts through the kses save
		// filters, which backslash-escape the block comment JSON and break
		// parse_blocks. Real editors have unfiltered_html; drop the filters.
		kses_remove_filters();

		parent::set_up();
	}

	public function tear_down() {
		parent::tear_down();
	}

	private function make_block_post( $content ) {
		return wp_insert_post(
			array(
				'post_type'    => 'post',
				'post_status'  => 'publish',
				'post_title'   => 'Block post',
				'post_content' => $content,
			)
		);
	}

	private function blocks_for( $content ) {
		return progressnow_blog_blocks_from_content( get_post( $this->make_block_post( $content ) ) );
	}

	/** Consecutive prose-class blocks coalesce into ONE sanitized prose entry. */
	public function test_prose_coalescing() {
		$blocks = $this->blocks_for(
			"<!-- wp:paragraph -->\n<p>First graf.</p>\n<!-- /wp:paragraph -->\n\n"
			. "<!-- wp:heading -->\n<h2 class=\"wp-block-heading\">Heading</h2>\n<!-- /wp:heading -->\n\n"
			. "<!-- wp:list -->\n<ul class=\"wp-block-list\"><!-- wp:list-item -->\n<li>Item one</li>\n<!-- /wp:list-item --></ul>\n<!-- /wp:list -->\n\n"
			. "<!-- wp:paragraph -->\n<p>Last graf.</p>\n<!-- /wp:paragraph -->"
		);

		$this->assertCount( 1, $blocks );
		$this->assertSame( 'prose', $blocks[0]['type'] );
		$this->assertStringContainsString( '<p>First graf.</p>', $blocks[0]['html'] );
		$this->assertStringContainsString( 'Heading</h2>', $blocks[0]['html'] );
		$this->assertStringContainsString( '<li>Item one</li>', $blocks[0]['html'] );
		$this->assertStringContainsString( '<p>Last graf.</p>', $blocks[0]['html'] );
		// kses strips the editor's class attributes (not on the allowlist).
		$this->assertStringNotContainsString( 'wp-block-heading', $blocks[0]['html'] );
	}

	/** Prose passes the kses allowlist — scripts and handlers are dropped. */
	public function test_prose_kses_applied() {
		$blocks = $this->blocks_for(
			"<!-- wp:paragraph -->\n<p>ok <a href=\"https://example.org\" onclick=\"steal()\">link</a></p>\n<!-- /wp:paragraph -->\n\n"
			. "<!-- wp:html -->\n<script>evil()</script>\n<!-- /wp:html -->"
		);

		$this->assertSame( 'prose', $blocks[0]['type'] );
		$this->assertStringContainsString( 'href="https://example.org"', $blocks[0]['html'] );
		$this->assertStringNotContainsString( 'onclick', $blocks[0]['html'] );
		foreach ( $blocks as $block ) {
			$this->assertStringNotContainsString( '<script', $block['html'] ?? '' );
		}
	}

	/** A non-prose block flushes the buffer — prose on both sides stays split. */
	public function test_prose_split_by_interleaved_block() {
		$blocks = $this->blocks_for(
			"<!-- wp:paragraph -->\n<p>Before.</p>\n<!-- /wp:paragraph -->\n\n"
			. "<!-- wp:pullquote -->\n<figure class=\"wp-block-pullquote\"><blockquote><p>Quoted words.</p><cite>Someone</cite></blockquote></figure>\n<!-- /wp:pullquote -->\n\n"
			. "<!-- wp:paragraph -->\n<p>After.</p>\n<!-- /wp:paragraph -->"
		);

		$this->assertCount( 3, $blocks );
		$this->assertSame( array( 'prose', 'pull_quote', 'prose' ), array_column( $blocks, 'type' ) );
		$this->assertSame( 'Quoted words.', $blocks[1]['quote'] );
		$this->assertSame( 'Someone', $blocks[1]['attribution'] );
	}

	/** core/image: wide/full alignment sets breakout; plain images don't. */
	public function test_image_breakout_from_align() {
		$blocks = $this->blocks_for(
			"<!-- wp:image {\"align\":\"full\"} -->\n<figure class=\"wp-block-image alignfull\"><img src=\"https://example.org/a.jpg\" alt=\"Wide photo\"/><figcaption>Big one.</figcaption></figure>\n<!-- /wp:image -->\n\n"
			. "<!-- wp:image -->\n<figure class=\"wp-block-image\"><img src=\"https://example.org/b.jpg\" alt=\"Plain photo\"/></figure>\n<!-- /wp:image -->"
		);

		$this->assertSame( 'image', $blocks[0]['type'] );
		$this->assertTrue( $blocks[0]['breakout'] );
		$this->assertSame( 'https://example.org/a.jpg', $blocks[0]['image']['src'] );
		$this->assertSame( 'Wide photo', $blocks[0]['image']['alt'] );
		$this->assertSame( 'Big one.', $blocks[0]['image']['caption'] );

		$this->assertSame( 'image', $blocks[1]['type'] );
		$this->assertArrayNotHasKey( 'breakout', $blocks[1] );
	}

	/** core/gallery: is-style-grid → grid layout, default → essay. */
	public function test_gallery_layout_from_block_style() {
		$inner = "<!-- wp:image -->\n<figure class=\"wp-block-image\"><img src=\"https://example.org/g.jpg\" alt=\"Gallery photo\"/></figure>\n<!-- /wp:image -->";

		$blocks = $this->blocks_for(
			"<!-- wp:gallery {\"className\":\"is-style-grid\"} -->\n<figure class=\"wp-block-gallery is-style-grid\">{$inner}</figure>\n<!-- /wp:gallery -->\n\n"
			. "<!-- wp:gallery -->\n<figure class=\"wp-block-gallery\">{$inner}</figure>\n<!-- /wp:gallery -->"
		);

		$this->assertSame( 'gallery', $blocks[0]['type'] );
		$this->assertSame( 'grid', $blocks[0]['layout'] );
		$this->assertSame( 'essay', $blocks[1]['layout'] );
		$this->assertSame( 'Gallery photo', $blocks[0]['images'][0]['alt'] );
	}

	/** progressnow/event-embed: published event serializes; draft → event: null. */
	public function test_event_embed_nullable() {
		$published = wp_insert_post(
			array(
				'post_type'   => 'event',
				'post_status' => 'publish',
				'post_title'  => 'Brake Light Clinic',
			)
		);
		$draft     = wp_insert_post(
			array(
				'post_type'   => 'event',
				'post_status' => 'draft',
				'post_title'  => 'Cancelled Thing',
			)
		);

		$blocks = $this->blocks_for(
			"<!-- wp:progressnow/event-embed {\"name\":\"progressnow/event-embed\",\"data\":{\"event\":{$published}},\"mode\":\"preview\"} /-->\n\n"
			. "<!-- wp:progressnow/event-embed {\"name\":\"progressnow/event-embed\",\"data\":{\"event\":{$draft}},\"mode\":\"preview\"} /-->"
		);

		$this->assertCount( 2, $blocks );
		$this->assertSame( 'event_embed', $blocks[0]['type'] );
		$this->assertIsArray( $blocks[0]['event'] );
		$this->assertSame( 'Brake Light Clinic', $blocks[0]['event']['title'] );

		$this->assertSame( 'event_embed', $blocks[1]['type'] );
		$this->assertNull( $blocks[1]['event'] );
	}

	/** Custom block fields come out of the flat ACF data layout, sanitized. */
	public function test_action_callout_from_flat_data() {
		$data = wp_json_encode(
			array(
				'name' => 'progressnow/action-callout',
				'data' => array(
					'heading'         => 'Join <script>x()</script>us',
					'body'            => 'Do the thing.',
					'buttons'         => 2,
					'buttons_0_label' => 'Primary',
					'buttons_0_url'   => '/get-involved/',
					'buttons_0_style' => 'primary',
					'buttons_1_label' => 'Other',
					'buttons_1_url'   => 'javascript:alert(1)',
					'buttons_1_style' => 'outline',
				),
				'mode' => 'preview',
			)
		);

		$blocks = $this->blocks_for( "<!-- wp:progressnow/action-callout {$data} /-->" );

		$this->assertSame( 'action_callout', $blocks[0]['type'] );
		$this->assertSame( 'Join us', $blocks[0]['heading'] );
		$this->assertSame( 'Do the thing.', $blocks[0]['body'] );
		$this->assertCount( 2, $blocks[0]['buttons'] );
		$this->assertSame( 'outline', $blocks[0]['buttons'][1]['style'] );
		$this->assertStringNotContainsString( 'javascript:', $blocks[0]['buttons'][1]['url'] );
	}

	/** progressnow/person-quote maps every contract key from block data. */
	public function test_person_quote_contract() {
		$data = wp_json_encode(
			array(
				'name' => 'progressnow/person-quote',
				'data' => array(
					'photo'       => 0,
					'alt_text'    => 'Portrait',
					'quote'       => 'Quoted.',
					'translation' => 'Traducido.',
					'name'        => 'Person Name',
					'role'        => 'Organizer',
					'lang'        => 'es',
				),
				'mode' => 'preview',
			)
		);

		$blocks = $this->blocks_for( "<!-- wp:progressnow/person-quote {$data} /-->" );

		$this->assertSame(
			array(
				'type'        => 'person_quote',
				'photo'       => null,
				'alt'         => 'Portrait',
				'quote'       => 'Quoted.',
				'name'        => 'Person Name',
				'lang'        => 'es',
				'translation' => 'Traducido.',
				'role'        => 'Organizer',
			),
			$blocks[0]
		);
	}

	/** map_blocks serializes block posts and classic posts from post_content. */
	public function test_map_blocks_dispatch() {
		$block_post = $this->make_block_post( "<!-- wp:paragraph -->\n<p>From blocks.</p>\n<!-- /wp:paragraph -->" );

		$classic_post = wp_insert_post(
			array(
				'post_type'    => 'post',
				'post_status'  => 'publish',
				'post_title'   => 'Classic post',
				'post_content' => '<p>Plain classic content, no block comments.</p>',
			)
		);

		$from_blocks = progressnow_blog_map_blocks( $block_post );
		$this->assertStringContainsString( 'From blocks.', $from_blocks[0]['html'] );

		$from_classic = progressnow_blog_map_blocks( $classic_post );
		$this->assertSame( 'prose', $from_classic[0]['type'] );
		$this->assertStringContainsString( 'Plain classic content', $from_classic[0]['html'] );
	}
}
