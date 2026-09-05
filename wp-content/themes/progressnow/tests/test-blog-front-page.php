<?php
/**
 * Home "From the blog" teasers (inc/blog.php): progressnow_blog_front_page_context()
 * always sets blog_featured (nullable) + blog_rows (array) with a raw `cat`
 * slug, so Twig owns the empty state instead of falling back to lorem.
 *
 * WorDBless WP_Query SQL returns nothing, so seeded scenarios supply posts via
 * the `posts_pre_query` seam (same approach the performance suite uses).
 */

use WorDBless\BaseTestCase;

class TestBlogFrontPage extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();
	}

	public function tear_down() {
		parent::tear_down();
	}

	private function make_post() {
		return wp_insert_post(
			array(
				'post_title'  => 'Teaser post',
				'post_status' => 'publish',
				'post_type'   => 'post',
			)
		);
	}

	private function supply_posts( array $posts ) {
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) use ( $posts ) {
				return 'post' === $query->get( 'post_type' ) ? $posts : $pre;
			},
			10,
			2
		);
	}

	/** Empty DB: both keys are set (null / []), so no lorem fixture leaks. */
	public function test_empty_db_sets_null_featured_and_empty_rows() {
		$context = progressnow_blog_front_page_context( array() );

		$this->assertArrayHasKey( 'blog_featured', $context );
		$this->assertArrayHasKey( 'blog_rows', $context );
		$this->assertNull( $context['blog_featured'] );
		$this->assertSame( array(), $context['blog_rows'] );
	}

	/** Seeded: featured + rows carry the raw `cat` slug; the old cat_class is gone. */
	public function test_seeded_emits_raw_cat_slug() {
		$posts = array_map( 'get_post', array( $this->make_post(), $this->make_post(), $this->make_post() ) );
		$this->supply_posts( $posts );

		$context = progressnow_blog_front_page_context( array() );

		$this->assertNotNull( $context['blog_featured'] );
		$this->assertSame( 'chapter', $context['blog_featured']['cat'] );
		$this->assertSame( 'Chapter-Wide', $context['blog_featured']['cat_label'] );
		$this->assertArrayNotHasKey( 'cat_class', $context['blog_featured'] );

		$this->assertCount( 2, $context['blog_rows'] );
		$this->assertSame( 'chapter', $context['blog_rows'][0]['cat'] );
		$this->assertArrayNotHasKey( 'cat_class', $context['blog_rows'][0] );
	}
}
