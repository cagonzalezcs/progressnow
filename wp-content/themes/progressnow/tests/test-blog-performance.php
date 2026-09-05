<?php
/**
 * Content performance (inc/blog.php + inc/cache.php): precomputed read
 * minutes, the shared primed query builder, and the version-invalidated
 * transient helper.
 *
 * WorDBless posts/meta/options work; WP_Query SQL reads return nothing, so
 * list scenarios supply posts via the `posts_pre_query` seam (same approach
 * the category suite uses with `terms_pre_query`).
 */

use WorDBless\BaseTestCase;

class TestBlogPerformance extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test. The inc/*.php
		// files are require_once'd (no-ops after the first test), so the
		// hooks under test are re-added here.
		require dirname( __DIR__ ) . '/functions.php';

		add_action( 'save_post_post', 'progressnow_blog_store_read_minutes', 20 );
		add_action( 'save_post_post', 'progressnow_cache_bump_version' );
		add_action( 'save_post_event', 'progressnow_cache_bump_version' );
		add_action( 'deleted_post', 'progressnow_cache_bump_version' );
		add_action( 'edited_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );
		add_action( 'acf/save_post', 'progressnow_cache_bump_on_options_save' );

		do_action( 'after_setup_theme' );

		parent::set_up();
	}

	public function tear_down() {
		parent::tear_down();
	}

	private function make_post( $words = 400 ) {
		return wp_insert_post(
			array(
				'post_title'   => 'Perf post',
				'post_status'  => 'publish',
				'post_type'    => 'post',
				'post_content' => implode( ' ', array_fill( 0, $words, 'word' ) ),
			)
		);
	}

	/**
	 * Count meta reads for a key via the get_post_metadata seam.
	 *
	 * @return callable ref-free closure; call it to get the current count.
	 */
	private function count_meta_reads( $meta_key ) {
		$counter = (object) array( 'reads' => 0 );
		add_filter(
			'get_post_metadata',
			function ( $value, $object_id, $key ) use ( $counter, $meta_key ) {
				if ( $key === $meta_key ) {
					$counter->reads++;
				}
				return $value;
			},
			10,
			3
		);

		return static function () use ( $counter ) {
			return $counter->reads;
		};
	}

	/* ---------------------------------------------------------------------
	 * 4.1 read minutes: save-time meta, meta-first read, self-heal.
	 * ------------------------------------------------------------------ */

	public function test_save_post_stores_read_minutes_meta() {
		$post_id = $this->make_post( 400 ); // 400 words / 200 wpm = 2.

		$this->assertSame( 2, (int) get_post_meta( $post_id, '_progressnow_read_minutes', true ) );
		$this->assertSame( 2, progressnow_blog_read_minutes( $post_id ) );
	}

	public function test_read_minutes_reads_meta_without_loading_post_blocks() {
		$post_id = $this->make_post();
		update_post_meta( $post_id, '_progressnow_read_minutes', 7 );

		$blocks_reads = $this->count_meta_reads( 'post_blocks' );

		$this->assertSame( 7, progressnow_blog_read_minutes( $post_id ) );
		$this->assertSame( 0, $blocks_reads(), 'read minutes must not load the flexible field' );
	}

	public function test_read_minutes_computes_and_stores_when_meta_absent() {
		$post_id = $this->make_post( 600 ); // 3 min.
		delete_post_meta( $post_id, '_progressnow_read_minutes' );

		$this->assertSame( 3, progressnow_blog_read_minutes( $post_id ) );
		// Self-healed: stored for the next read.
		$this->assertSame( 3, (int) get_post_meta( $post_id, '_progressnow_read_minutes', true ) );
	}

	public function test_read_minutes_acf_override_wins() {
		$post_id = $this->make_post( 400 );
		update_post_meta( $post_id, 'read_minutes', 12 ); // ACF override (polyfill-backed).

		$this->assertSame( 12, progressnow_blog_read_minutes( $post_id ) );
	}

	/* ---------------------------------------------------------------------
	 * 4.2 shared query builder → archive context, no per-card storms.
	 * ------------------------------------------------------------------ */

	public function test_archive_context_serializes_cards_without_post_blocks_reads() {
		$ids = array( $this->make_post( 200 ), $this->make_post( 400 ) );

		// WP_Query SQL returns nothing under WorDBless — short-circuit with
		// the real posts so the shared builder + serializers run end to end.
		$posts = array_map( 'get_post', $ids );
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) use ( $posts ) {
				return 'post' === $query->get( 'post_type' ) ? $posts : $pre;
			},
			10,
			2
		);

		$blocks_reads = $this->count_meta_reads( 'post_blocks' );

		$context = progressnow_blog_archive_context( array() );

		$this->assertArrayHasKey( 'archive_posts', $context );
		$this->assertCount( 2, $context['archive_posts'] );
		// Read minutes came from the save-time meta…
		$this->assertSame( 1, $context['archive_posts'][0]['readMinutes'] );
		$this->assertSame( 2, $context['archive_posts'][1]['readMinutes'] );
		// …not from per-card flexible-content loads (the old N+1 storm).
		$this->assertSame( 0, $blocks_reads(), 'archive serialization must not read post_blocks per card' );
	}

	/* ---------------------------------------------------------------------
	 * 4.3 progressnow_cache_remember + content-version invalidation.
	 * ------------------------------------------------------------------ */

	public function test_cache_remember_caches_until_version_bump() {
		$calls = 0;
		$cb    = function () use ( &$calls ) {
			$calls++;
			return array( 'run' => $calls );
		};

		$this->assertSame( array( 'run' => 1 ), progressnow_cache_remember( 'perf_test', $cb ) );
		$this->assertSame( array( 'run' => 1 ), progressnow_cache_remember( 'perf_test', $cb ) );
		$this->assertSame( 1, $calls, 'second call must hit the transient' );

		progressnow_cache_bump_version();

		$this->assertSame( array( 'run' => 2 ), progressnow_cache_remember( 'perf_test', $cb ) );
		$this->assertSame( 2, $calls, 'version bump must invalidate' );
	}

	public function test_post_save_bumps_content_version() {
		$before = progressnow_content_version();
		$this->make_post();

		$this->assertGreaterThan( $before, progressnow_content_version() );
	}

	public function test_term_edit_bumps_only_for_canonical_taxonomies() {
		$before = progressnow_content_version();

		do_action( 'edited_term', 5, 5, 'post_tag' );
		$this->assertSame( $before, progressnow_content_version(), 'post_tag must not bump' );

		do_action( 'edited_term', 5, 5, 'category' );
		$this->assertSame( $before + 1, progressnow_content_version() );

		do_action( 'edited_term', 6, 6, 'event_category' );
		$this->assertSame( $before + 2, progressnow_content_version() );
	}

	public function test_acf_options_save_bumps_version_post_ids_do_not() {
		$before = progressnow_content_version();

		do_action( 'acf/save_post', 123 );
		$this->assertSame( $before, progressnow_content_version(), 'post saves route through save_post_post instead' );

		do_action( 'acf/save_post', 'options' );
		$this->assertSame( $before + 1, progressnow_content_version() );
	}
}
