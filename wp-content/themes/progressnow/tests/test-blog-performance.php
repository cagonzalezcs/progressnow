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
		// The inc/cache.php hook set (keep in sync with that file).
		add_action( 'save_post', 'progressnow_cache_bump_on_post_save', 20, 2 );
		add_action( 'deleted_post', 'progressnow_cache_bump_on_post_delete', 10, 2 );
		add_action( 'edited_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );
		add_action( 'created_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );
		add_action( 'delete_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );
		add_action( 'wp_update_nav_menu', 'progressnow_cache_bump_on_menu_change' );
		add_action( 'delete_nav_menu', 'progressnow_cache_bump_on_menu_change' );
		add_action( 'add_option_' . progressnow_cache_theme_mods_option(), 'progressnow_cache_bump_on_menu_change' );
		add_action( 'update_option_' . progressnow_cache_theme_mods_option(), 'progressnow_cache_bump_on_menu_change' );
		add_action( 'acf/save_post', 'progressnow_cache_bump_on_options_save' );
		add_action( 'edit_attachment', 'progressnow_cache_bump_version' );
		add_action( 'pll_save_strings_translations', 'progressnow_cache_bump_version' );

		do_action( 'after_setup_theme' );

		parent::set_up();
	}

	/** A WP_Post that never touched the store — enough for the save_post guard. */
	private function fake_post( $post_type, $post_status = 'publish' ) {
		return new WP_Post(
			(object) array(
				'ID'          => 777,
				'post_type'   => $post_type,
				'post_status' => $post_status,
				'post_title'  => 'Fake',
			)
		);
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

		progressnow_cache_reset_bump_guard(); // Next request.
		do_action( 'edited_term', 6, 6, 'event_category' );
		$this->assertSame( $before + 2, progressnow_content_version() );
	}

	public function test_term_create_and_delete_bump_for_canonical_taxonomies() {
		$before = progressnow_content_version();

		do_action( 'created_term', 7, 7, 'post_tag' );
		do_action( 'delete_term', 7, 7, 'post_tag', (object) array(), array() );
		$this->assertSame( $before, progressnow_content_version(), 'post_tag create/delete must not bump' );

		do_action( 'created_term', 8, 8, 'category' );
		$this->assertSame( $before + 1, progressnow_content_version(), 'category create must bump' );

		progressnow_cache_reset_bump_guard(); // Next request.
		do_action( 'delete_term', 8, 8, 'event_category', (object) array(), array() );
		$this->assertSame( $before + 2, progressnow_content_version(), 'event_category delete must bump' );
	}

	public function test_post_delete_bumps_only_for_public_post_types() {
		$before = progressnow_content_version();

		foreach ( array( 'revision', 'nav_menu_item', 'auto-draft', 'attachment' ) as $noise ) {
			do_action( 'deleted_post', 99, (object) array( 'post_type' => $noise ) );
		}
		$this->assertSame( $before, progressnow_content_version(), 'noise post types must not churn the version' );

		$page = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'P' ) );
		progressnow_cache_reset_bump_guard(); // The insert bumped; the delete is a new request.
		$at = progressnow_content_version();
		wp_delete_post( $page, true );
		$this->assertSame( $at + 1, progressnow_content_version(), 'page delete must bump' );
	}

	public function test_cache_remember_does_not_persist_null() {
		$calls = 0;
		$cb    = function () use ( &$calls ) {
			$calls++;
			return null;
		};

		$this->assertNull( progressnow_cache_remember( 'perf_null', $cb ) );
		$this->assertNull( progressnow_cache_remember( 'perf_null', $cb ) );
		$this->assertSame( 2, $calls, 'null must be recomputed, never stored' );
		$this->assertFalse( get_transient( 'progressnow_perf_null_' . progressnow_content_version() ) );
	}

	/** The ICS body is memoized per content version — the all-events query runs once, not per hit. */
	public function test_ics_body_is_cached_until_version_bump() {
		$queries = 0;
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) use ( &$queries ) {
				if ( 'event' === $query->get( 'post_type' ) ) {
					$queries++;
				}
				return $pre;
			},
			10,
			2
		);

		$first  = progressnow_events_cached_ics();
		$second = progressnow_events_cached_ics();

		$this->assertSame( $first, $second );
		$this->assertSame( progressnow_events_build_ics(), $first, 'cached body must equal the freshly built one' );
		$this->assertSame( 2, $queries, 'one query for the cached pair, one for the direct build' );

		progressnow_cache_bump_version();
		progressnow_events_cached_ics();
		$this->assertSame( 3, $queries, 'version bump must invalidate the feed body' );
	}

	public function test_acf_options_save_bumps_version_post_ids_do_not() {
		$before = progressnow_content_version();

		do_action( 'acf/save_post', 123 );
		$this->assertSame( $before, progressnow_content_version(), 'post saves route through save_post instead' );

		do_action( 'acf/save_post', 'options' );
		$this->assertSame( $before + 1, progressnow_content_version() );
	}

	/* ---------------------------------------------------------------------
	 * Complete write-path coverage + one bump per request.
	 * ------------------------------------------------------------------ */

	/** A page save bumps once and fires the action once, even when ACF's save_post fires alongside. */
	public function test_page_save_bumps_once_per_request() {
		$before = progressnow_content_version();
		$fired  = 0;
		add_action(
			'progressnow/content_version_bumped',
			function () use ( &$fired ) {
				$fired++;
			}
		);

		$page = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'About' ) );
		// The same request: ACF writes the section fields, then save_post fires again.
		do_action( 'acf/save_post', 'options' );
		do_action( 'save_post', $page, get_post( $page ), true );

		$this->assertSame( $before + 1, progressnow_content_version(), 'exactly one increment per request' );
		$this->assertSame( 1, $fired, 'exactly one progressnow/content_version_bumped per request' );

		progressnow_cache_reset_bump_guard();
		do_action( 'save_post', $page, get_post( $page ), true );
		$this->assertSame( $before + 2, progressnow_content_version(), 'the next request bumps again' );
		$this->assertSame( 2, $fired );
	}

	public function test_event_save_bumps() {
		$before = progressnow_content_version();

		wp_insert_post( array( 'post_type' => 'event', 'post_status' => 'publish', 'post_title' => 'Clinic' ) );

		$this->assertSame( $before + 1, progressnow_content_version() );
	}

	/** Revisions, autosaves, auto-drafts, and non-public types never churn the version. */
	public function test_noise_saves_do_not_bump() {
		$before = progressnow_content_version();

		wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'auto-draft', 'post_title' => 'Auto Draft' ) );
		wp_insert_post( array( 'post_type' => 'nav_menu_item', 'post_status' => 'publish', 'post_title' => 'Item' ) );
		$this->assertSame( $before, progressnow_content_version(), 'auto-draft and nav_menu_item saves must not bump' );

		$post = $this->make_post(); // Bumps once.
		progressnow_cache_reset_bump_guard();
		$at = progressnow_content_version();

		wp_insert_post( array( 'post_type' => 'revision', 'post_status' => 'inherit', 'post_parent' => $post, 'post_name' => $post . '-revision-v1', 'post_title' => 'Perf post' ) );
		wp_insert_post( array( 'post_type' => 'revision', 'post_status' => 'inherit', 'post_parent' => $post, 'post_name' => $post . '-autosave-v1', 'post_title' => 'Perf post' ) );
		do_action( 'save_post', 777, $this->fake_post( 'acf-field-group' ), true );
		do_action( 'save_post', 777, $this->fake_post( 'attachment', 'inherit' ), true );
		$this->assertSame( $at, progressnow_content_version(), 'revision / autosave / acf-field-group / attachment saves must not bump' );
	}

	public function test_public_post_types_are_filterable() {
		add_filter(
			'progressnow/cache/public_post_types',
			static function ( $types ) {
				return array_merge( $types, array( 'faq' ) );
			}
		);
		$before = progressnow_content_version();

		do_action( 'save_post', 777, $this->fake_post( 'faq' ), true );

		$this->assertSame( array( 'post', 'event', 'page', 'faq' ), progressnow_cache_public_post_types() );
		$this->assertSame( $before + 1, progressnow_content_version() );
	}

	/** Menu contents (wp_update_nav_menu) and menu locations (theme mods) both bump. */
	public function test_menu_and_location_changes_bump() {
		$before = progressnow_content_version();

		do_action( 'wp_update_nav_menu', 7 );
		$this->assertSame( $before + 1, progressnow_content_version(), 'menu save must bump' );

		progressnow_cache_reset_bump_guard();
		set_theme_mod( 'nav_menu_locations', array( 'primary' => 7 ) ); // First write: add_option.
		$this->assertSame( $before + 2, progressnow_content_version(), 'menu location assignment must bump' );

		progressnow_cache_reset_bump_guard();
		set_theme_mod( 'nav_menu_locations', array( 'primary' => 8 ) ); // Later writes: update_option.
		$this->assertSame( $before + 3, progressnow_content_version(), 'menu location reassignment must bump' );

		progressnow_cache_reset_bump_guard();
		do_action( 'delete_nav_menu', 7, 7, 7 );
		$this->assertSame( $before + 4, progressnow_content_version(), 'menu deletion must bump' );
	}

	public function test_attachment_and_string_translation_edits_bump() {
		$before = progressnow_content_version();

		do_action( 'edit_attachment', 55 );
		$this->assertSame( $before + 1, progressnow_content_version(), 'attachment metadata edit must bump' );

		progressnow_cache_reset_bump_guard();
		do_action( 'pll_save_strings_translations' );
		$this->assertSame( $before + 2, progressnow_content_version(), 'Polylang string translation save must bump' );
	}
}
