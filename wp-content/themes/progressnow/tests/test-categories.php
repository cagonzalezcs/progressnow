<?php
/**
 * Category registry (inc/categories.php): JSON registry, term merge
 * logic, and the canonical-slug rename guard.
 *
 * WorDBless has no terms store (wp_insert_term writes, but WP_Term_Query
 * reads return nothing), so term-backed scenarios use the core seams
 * instead: `terms_pre_query` to supply terms, `get_term_metadata` to
 * supply the ACF color meta, and the `terms` cache group for get_term().
 */

use WorDBless\BaseTestCase;

class TestCategories extends BaseTestCase {

	const CANONICAL = array( 'chapter', 'poled', 'mutual', 'labor', 'electoral', 'social' );

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		// event CPT + event_category taxonomy (init hasn't fired under WorDBless).
		progressnow_events_register_post_type();

		parent::set_up();
	}

	public function tear_down() {
		parent::tear_down();
	}

	/**
	 * Build a WP_Term and prime the `terms` cache so get_term() resolves it.
	 */
	private function make_term( $term_id, $slug, $name, $taxonomy ) {
		$term = new WP_Term(
			(object) array(
				'term_id'          => $term_id,
				'name'             => $name,
				'slug'             => $slug,
				'taxonomy'         => $taxonomy,
				'term_taxonomy_id' => $term_id,
				'term_group'       => 0,
				'parent'           => 0,
				'description'      => '',
				'count'            => 1,
			)
		);
		wp_cache_set( $term_id, $term, 'terms' );

		return $term;
	}

	/**
	 * Short-circuit WP_Term_Query for a taxonomy with the given terms.
	 */
	private function supply_terms( $taxonomy, array $terms ) {
		add_filter(
			'terms_pre_query',
			function ( $pre, $query ) use ( $taxonomy, $terms ) {
				$queried = (array) ( $query->query_vars['taxonomy'] ?? array() );
				if ( ! in_array( $taxonomy, $queried, true ) ) {
					return $pre;
				}

				// Honor the requested fields (core calls with ids/tt_ids too).
				switch ( $query->query_vars['fields'] ?? 'all' ) {
					case 'ids':
						return array_map( static fn( $t ) => (int) $t->term_id, $terms );
					case 'tt_ids':
						return array_map( static fn( $t ) => (int) $t->term_taxonomy_id, $terms );
					case 'names':
						return array_map( static fn( $t ) => $t->name, $terms );
					case 'slugs':
						return array_map( static fn( $t ) => $t->slug, $terms );
					case 'count':
						return count( $terms );
					default:
						return $terms;
				}
			},
			10,
			2
		);
	}

	public function test_registry_matches_categories_json() {
		$registry = progressnow_category_registry();

		$this->assertSame( self::CANONICAL, array_keys( $registry ) );

		// Colors/labels = the palette formerly duplicated in inc/blog.php + inc/events.php.
		$this->assertSame( 'Chapter-Wide', $registry['chapter']['label'] );
		$this->assertSame( '#B01B22', $registry['chapter']['color'] );
		$this->assertSame( 'Political Education', $registry['poled']['label'] );
		$this->assertSame( '#33518F', $registry['poled']['color'] );
		$this->assertSame( '#1B6B40', $registry['mutual']['color'] );
		$this->assertSame( '#8F5715', $registry['labor']['color'] );
		$this->assertSame( '#6E3B87', $registry['electoral']['color'] );
		$this->assertSame( '#0A6B74', $registry['social']['color'] );
	}

	public function test_categories_fall_back_to_registry_when_terms_absent() {
		foreach ( array( 'category', 'event_category' ) as $taxonomy ) {
			$categories = progressnow_categories( $taxonomy );

			$this->assertSame( self::CANONICAL, array_column( $categories, 'id' ) );
			$this->assertSame( 'Chapter-Wide', $categories[0]['label'] );
			$this->assertSame( '#B01B22', $categories[0]['color'] );
		}
	}

	public function test_categories_merge_term_name_and_color_override() {
		$term = $this->make_term( 7, 'mutual', 'Ayuda Mutua', 'category' );
		$this->supply_terms( 'category', array( $term ) );
		add_filter(
			'get_term_metadata',
			function ( $value, $object_id, $meta_key ) {
				return ( 7 === $object_id && 'color' === $meta_key ) ? '#123456' : $value;
			},
			10,
			3
		);

		$by_id = array_column( progressnow_categories( 'category' ), null, 'id' );

		// Term name + term-meta color win.
		$this->assertSame( 'Ayuda Mutua', $by_id['mutual']['label'] );
		$this->assertSame( '#123456', $by_id['mutual']['color'] );

		// Slugs without a term keep registry defaults.
		$this->assertSame( 'Labor', $by_id['labor']['label'] );
		$this->assertSame( '#8F5715', $by_id['labor']['color'] );
	}

	public function test_categories_term_without_color_keeps_registry_color() {
		$term = $this->make_term( 8, 'labor', 'Labor Solidarity', 'event_category' );
		$this->supply_terms( 'event_category', array( $term ) );

		$by_id = array_column( progressnow_categories( 'event_category' ), null, 'id' );

		$this->assertSame( 'Labor Solidarity', $by_id['labor']['label'] );
		$this->assertSame( '#8F5715', $by_id['labor']['color'] );
	}

	public function test_slug_guard_forces_canonical_slug_back_on_rename() {
		foreach ( array( 'category' => 9, 'event_category' => 11 ) as $taxonomy => $term_id ) {
			$this->make_term( $term_id, 'labor', 'Labor', $taxonomy );

			$data = progressnow_guard_canonical_term_slugs(
				array(
					'name'       => 'Labor',
					'slug'       => 'work-stuff',
					'term_group' => 0,
				),
				$term_id,
				$taxonomy
			);

			$this->assertSame( 'labor', $data['slug'], "canonical slug not preserved in {$taxonomy}" );
		}
	}

	public function test_slug_guard_leaves_non_canonical_terms_alone() {
		$this->make_term( 12, 'zines', 'Zines', 'category' );

		$data = progressnow_guard_canonical_term_slugs(
			array(
				'name'       => 'Zines',
				'slug'       => 'zine-library',
				'term_group' => 0,
			),
			12,
			'category'
		);

		$this->assertSame( 'zine-library', $data['slug'] );
	}

	public function test_slug_guard_ignores_other_taxonomies() {
		$this->make_term( 13, 'labor', 'Labor', 'post_tag' );

		$data = progressnow_guard_canonical_term_slugs(
			array(
				'name'       => 'Labor',
				'slug'       => 'renamed',
				'term_group' => 0,
			),
			13,
			'post_tag'
		);

		$this->assertSame( 'renamed', $data['slug'] );
	}

	public function test_blog_post_cat_maps_to_same_chip_classes_as_old_palette() {
		// Chip markup gate: bg-cat-<slug> classes derive from registry keys —
		// must equal the pre-dedupe canonical palette keys exactly.
		$expected = array_map(
			static function ( $slug ) {
				return 'bg-cat-' . $slug;
			},
			self::CANONICAL
		);

		$actual = array_map(
			static function ( $slug ) {
				return 'bg-cat-' . $slug;
			},
			array_keys( progressnow_category_registry() )
		);

		$this->assertSame( $expected, $actual );

		// And a post whose term is canonical resolves to that slug.
		$term = $this->make_term( 14, 'mutual', 'Mutual Aid', 'category' );
		$this->supply_terms( 'category', array( $term ) );

		$post_id = wp_insert_post(
			array(
				'post_title'  => 'Test post',
				'post_status' => 'publish',
				'post_type'   => 'post',
			)
		);

		$this->assertSame( 'mutual', progressnow_blog_post_cat( get_post( $post_id ) ) );
	}
}
