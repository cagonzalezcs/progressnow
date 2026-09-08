<?php
/**
 * Output escaping (openspec security-template-output-escaping): hostile
 * editor content seeded into every field family and rendered through every
 * public template family must come out as text, never markup — and
 * well-formed content must be escaped exactly once.
 *
 * Twig runs with autoescape on (src/StarterSite.php); the two inline JSON
 * blocks (JSON-LD, __SHELL_DATA__) are produced by the script-context
 * encoder (inc/escaping.php) and are cut out before the markup assertions,
 * then checked on their own.
 *
 * Content comes through the WorDBless `posts_pre_query` seam (same as
 * tests/test-shell.php); menus are terms, which WorDBless cannot store, so
 * the menu-derived context keys (`header_nav_items`, `header_about_items`,
 * `footer_columns`) are seeded directly with the shape StarterSite builds.
 * Roles with unfiltered_html store values verbatim — kses filters are off.
 */

use WorDBless\BaseTestCase;

class TestOutputEscaping extends BaseTestCase {

	/** Script-context breakout. */
	const SCRIPT = '</script><script>alert(1)</script>';
	/** Attribute breakout + event handler. */
	const IMG = '"><img src=x onerror=alert(1)>';
	/** Single-quoted attribute breakout. */
	const QUOTE = "'-alert(1)-'";
	/** Every vector in one value: what an editor field is seeded with. */
	const HOSTILE = 'Hostile </script><script>alert(1)</script> "><img src=x onerror=alert(1)> \'-alert(1)-\'';
	/** Well-formed content with every character HTML escapes. */
	const BENIGN = 'Tom & Jerry\'s "Quotes" <3';

	/**
	 * Fragments that must never survive outside the encoder-guarded JSON
	 * blocks. Escaped text (`&lt;script&gt;alert(1)`) still contains
	 * `alert(1)`, so the assertions target the markup, not the payload.
	 */
	const EXECUTABLE = array(
		'<script>alert',
		'</script><script>',
		'<img src=x onerror=',
		'"><img src=x',
	);

	/** Public templates the suite renders, keyed by views/ basename. */
	const COVERED = array(
		'front-page.twig',
		'index.twig',
		'archive.twig',
		'search.twig',
		'author.twig',
		'single.twig',
		'single-event.twig',
		'single-password.twig',
		'page.twig',
		'page-about.twig',
		'page-get-involved.twig',
		'page-calendar.twig',
		'404.twig',
	);

	/** Templates that are not public surfaces, with the reason. */
	const NOT_A_SURFACE = array(
		'base.twig'            => 'layout — rendered by every covered template',
		'html-header.twig'     => 'layout — rendered by every covered template',
		'comment.twig'         => 'comments are disabled (starter-theme leftover)',
		'comment-form.twig'    => 'comments are disabled (starter-theme leftover)',
		'tease.twig'           => 'starter-theme leftover, unused by the archive templates',
		'tease-post.twig'      => 'starter-theme leftover, unused by the archive templates',
		'page-plugin.twig'     => 'plugin output passthrough (header.php/footer.php buffer)',
		'page-styleguide.twig' => 'developer styleguide, static copy only',
	);

	protected $seam_ids = array();
	protected $settings = array();

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		// Context filters the template PHP files rely on (hooks reset per test).
		add_filter( 'progressnow/context/front_page', 'progressnow_options_front_page_context', 5, 2 );
		add_filter( 'progressnow/context/front_page', 'progressnow_events_front_page_context' );
		add_filter( 'progressnow/context/front_page', 'progressnow_blog_front_page_context' );
		add_filter( 'progressnow/context/page', 'progressnow_interior_page_context', 10, 2 );
		add_filter( 'progressnow/context/page', 'progressnow_pages_page_context', 10, 2 );
		add_filter( 'progressnow/context/page', 'progressnow_events_calendar_context', 10, 2 );
		add_filter( 'progressnow/context/single', 'progressnow_events_single_context', 10, 2 );
		add_filter( 'progressnow/context/single', 'progressnow_blog_single_context', 10, 2 );
		add_filter( 'progressnow/context/blog_archive', 'progressnow_blog_archive_context' );
		add_filter( 'timber/context', array( StarterSite::instance(), 'add_to_context' ) );
		add_filter( 'timber/twig', array( StarterSite::instance(), 'add_to_twig' ) );
		add_filter( 'timber/twig/environment/options', array( StarterSite::instance(), 'update_twig_environment_options' ) );
		add_filter( 'timber/context', 'progressnow_i18n_context' );
		add_filter( 'timber/twig', 'progressnow_i18n_twig' );
		add_filter( 'timber/context', 'progressnow_shell_context', 20 );
		add_action( 'wp_head', 'progressnow_seo_head', 5 );
		// Timber's own Twig functions/filters (`function()`, `date`, …) survive
		// only until WorDBless restores the hook snapshot after the first test.
		$this->ensure_timber_twig();
		add_filter( 'show_admin_bar', '__return_false' );

		progressnow_events_register_post_type();

		$this->seam_ids = array();
		$this->settings = array();
		$this->supply_query_seam();
		add_filter(
			'progressnow/shell/setting',
			function ( $value, $name ) {
				return array_key_exists( $name, $this->settings ) ? $this->settings[ $name ] : $value;
			},
			10,
			2
		);

		Timber\Timber::$context_cache = array();
		update_option( 'blogname', 'Progress Now' );
		update_option( 'blog_public', 1 );
		update_option( 'show_on_front', 'page' );
		kses_remove_filters();
	}

	public function tear_down() {
		kses_init_filters();
		$_GET = array();
		parent::tear_down();
	}

	/** Re-register Timber's `timber/twig` callbacks when the snapshot restore dropped them. */
	protected function ensure_timber_twig() {
		$hook = $GLOBALS['wp_filter']['timber/twig'] ?? null;
		if ( $hook ) {
			foreach ( $hook->callbacks as $callbacks ) {
				foreach ( $callbacks as $callback ) {
					if ( is_array( $callback['function'] ) && $callback['function'][0] instanceof \Timber\Twig ) {
						return;
					}
				}
			}
		}
		\Timber\Twig::init();
	}

	/* ---------------------------------------------------------------------
	 * Seeding.
	 * ------------------------------------------------------------------ */

	protected function make( array $args ) {
		$id = wp_insert_post(
			wp_parse_args(
				$args,
				array(
					'post_status'  => 'publish',
					'post_content' => '<p>Body copy.</p>',
				)
			)
		);
		$this->seam_ids[] = (int) $id;

		return (int) $id;
	}

	protected function supply_query_seam() {
		remove_all_filters( 'posts_pre_query' );
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) {
				$types = (array) ( $query->get( 'post_type' ) ?: 'post' );
				$posts = array_values( array_filter( array_map( 'get_post', $this->seam_ids ) ) );
				$posts = array_filter(
					$posts,
					static function ( $p ) use ( $types ) {
						return in_array( $p->post_type, $types, true ) || in_array( 'any', $types, true );
					}
				);
				$not_in = array_map( 'intval', (array) $query->get( 'post__not_in' ) );
				if ( $not_in ) {
					$posts = array_filter(
						$posts,
						static function ( $p ) use ( $not_in ) {
							return ! in_array( (int) $p->ID, $not_in, true );
						}
					);
				}
				$posts                = array_values( $posts );
				$query->found_posts   = count( $posts );
				$query->max_num_pages = $posts ? 1 : 0;
				$limit                = (int) $query->get( 'posts_per_page' );
				if ( $limit > 0 ) {
					$posts = array_slice( $posts, 0, $limit );
				}
				if ( 'ids' === $query->get( 'fields' ) ) {
					return array_map( static fn( $p ) => (int) $p->ID, $posts );
				}

				return $posts;
			},
			10,
			2
		);
	}

	/** A WP_Term primed into the `terms` cache + WP_Term_Query seam (no terms store). */
	protected function supply_category( $taxonomy, $name ) {
		static $next_id = 900;
		$term_id = ++$next_id;
		$term    = new WP_Term(
			(object) array(
				'term_id'          => $term_id,
				'name'             => $name,
				'slug'             => 'chapter',
				'taxonomy'         => $taxonomy,
				'term_taxonomy_id' => $term_id,
				'term_group'       => 0,
				'parent'           => 0,
				'description'      => '',
				'count'            => 1,
			)
		);
		wp_cache_set( $term_id, $term, 'terms' );
		add_filter(
			'terms_pre_query',
			static function ( $pre, $query ) use ( $taxonomy, $term ) {
				$queried = (array) ( $query->query_vars['taxonomy'] ?? array() );
				if ( ! in_array( $taxonomy, $queried, true ) ) {
					return $pre;
				}
				switch ( $query->query_vars['fields'] ?? 'all' ) {
					case 'ids':
						return array( (int) $term->term_id );
					case 'tt_ids':
						return array( (int) $term->term_taxonomy_id );
					case 'names':
						return array( $term->name );
					case 'slugs':
						return array( $term->slug );
					case 'count':
						return 1;
					default:
						return array( $term );
				}
			},
			10,
			2
		);
	}

	/**
	 * Seed one value into every editor-controlled field family.
	 *
	 * @param string $value Field value.
	 * @return array{post:int,event:int,front:int,blog:int,about:int,gi:int,calendar:int,page:int,attachment:int}
	 */
	protected function seed( $value ) {
		// Chapter Settings (options page).
		foreach ( array( 'chapter_name', 'chapter_short_name', 'region_label', 'hero_headline_text', 'footer_tagline', 'who_we_are_alt', 'newhere_heading', 'newhere_body', 'newhere_link_label' ) as $field ) {
			update_option( 'options_' . $field, $value );
		}
		update_option( 'options_contact_email', 'hello@example.org?' . $value );

		// Category label (both taxonomies).
		$this->supply_category( 'category', $value );
		$this->supply_category( 'event_category', $value );

		// Attachment alt text → featured image on the post.
		$attachment = wp_insert_post(
			array(
				'post_title'     => $value,
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'post_mime_type' => 'image/png',
				'post_excerpt'   => $value, // caption
			)
		);
		update_post_meta( $attachment, '_wp_attached_file', '2026/09/hostile.png' );
		update_post_meta( $attachment, '_wp_attachment_metadata', array( 'file' => '2026/09/hostile.png', 'width' => 1600, 'height' => 900, 'sizes' => array() ) );
		update_post_meta( $attachment, '_wp_attachment_image_alt', $value );

		// Post: title, dek, committee byline, block content.
		$post = $this->make(
			array(
				'post_title'   => $value,
				'post_name'    => 'seeded-post',
				'post_content' => '<!-- wp:paragraph --><p>Body ' . $value . '</p><!-- /wp:paragraph --><!-- wp:quote --><blockquote class="wp-block-quote"><p>' . $value . '</p><cite>' . $value . '</cite></blockquote><!-- /wp:quote -->',
			)
		);
		update_post_meta( $post, 'dek', $value );
		update_post_meta( $post, 'committee', $value );
		update_post_meta( $post, 'byline_mode', 'committee' );
		set_post_thumbnail( $post, $attachment );

		// A second post so Read Next / archive rows render.
		$other = $this->make( array( 'post_title' => 'Other ' . $value, 'post_name' => 'other-post' ) );
		update_post_meta( $other, 'dek', $value );

		// Event: title, venue, city, summary.
		$event = $this->make(
			array(
				'post_type'    => 'event',
				'post_title'   => $value,
				'post_name'    => 'seeded-event',
				'post_content' => '<p>About ' . $value . '</p>',
			)
		);
		update_post_meta( $event, 'start_datetime', '2030-07-04 18:00:00' );
		update_post_meta( $event, 'end_datetime', '2030-07-04 20:00:00' );
		update_post_meta( $event, 'venue', $value );
		update_post_meta( $event, 'city', $value );
		update_post_meta( $event, 'summary', $value );
		$other_event = $this->make( array( 'post_type' => 'event', 'post_title' => 'Other ' . $value, 'post_name' => 'other-event' ) );
		update_post_meta( $other_event, 'start_datetime', '2030-08-04 18:00:00' );
		update_post_meta( $other_event, 'venue', $value );

		// Pages: front (hero/who copy), posts page, about, get involved, calendar, generic.
		$front = $this->make( array( 'post_type' => 'page', 'post_title' => 'Home', 'post_name' => 'home' ) );
		update_option( 'page_on_front', $front );
		foreach ( array( 'hero_subhead', 'hero_cta_primary_label', 'hero_cta_secondary_label', 'who_eyebrow', 'who_heading', 'who_p1', 'who_p2', 'who_p3', 'who_link_label', 'cta_line' ) as $field ) {
			update_post_meta( $front, $field, $value );
		}

		$blog = $this->make( array( 'post_type' => 'page', 'post_title' => $value, 'post_name' => 'blog' ) );
		update_option( 'page_for_posts', $blog );
		update_post_meta( $blog, 'lede', $value );

		$about = $this->make( array( 'post_type' => 'page', 'post_title' => $value, 'post_name' => 'about' ) );
		update_post_meta( $about, '_wp_page_template', 'page-templates/about.php' );
		update_post_meta( $about, 'lede', $value );
		foreach ( array( 'about_chapter_heading', 'about_intro_p1', 'about_intro_p2', 'about_mission_eyebrow', 'about_mission_body', 'about_history_heading', 'about_history_body', 'about_counties_heading', 'about_counties_intro', 'about_committees_heading', 'about_committees_intro', 'about_committees_link_label', 'about_governance_heading', 'about_governance_intro', 'about_faq_heading', 'about_dues_heading', 'about_dues_body' ) as $field ) {
			update_post_meta( $about, $field, $value );
		}

		$gi = $this->make( array( 'post_type' => 'page', 'post_title' => $value, 'post_name' => 'get-involved' ) );
		update_post_meta( $gi, '_wp_page_template', 'page-templates/get-involved.php' );
		update_post_meta( $gi, 'lede', $value );
		foreach ( array( 'gi_join_heading', 'gi_committees_heading', 'gi_committees_intro', 'gi_channels_heading', 'gi_faq_heading', 'gi_card_heading', 'gi_card_body', 'gi_card_link_label' ) as $field ) {
			update_post_meta( $gi, $field, $value );
		}

		$calendar = $this->make( array( 'post_type' => 'page', 'post_title' => $value, 'post_name' => 'calendar' ) );
		update_post_meta( $calendar, '_wp_page_template', 'page-templates/calendar.php' );
		update_post_meta( $calendar, 'lede', $value );

		$page = $this->make( array( 'post_type' => 'page', 'post_title' => $value, 'post_name' => 'bylaws', 'post_content' => '<p>Generic ' . $value . '</p>' ) );
		update_post_meta( $page, 'lede', $value );
		update_post_meta( $page, 'grievance_body', '<p>' . $value . '</p>' );

		return compact( 'post', 'event', 'front', 'blog', 'about', 'gi', 'calendar', 'page', 'attachment' );
	}

	/** Menu-derived context, the shape StarterSite::menu_nav_items / footer_columns build. */
	protected function menu_context( $label ) {
		return array(
			'header_nav_items'   => array( array( 'label' => $label, 'href' => '/calendar/?x=' . $label ) ),
			'header_about_items' => array( array( 'label' => $label, 'href' => '/about/' ) ),
			'footer_columns'     => array(
				array(
					'title' => $label,
					'links' => array( array( 'label' => $label, 'href' => 'https://example.com/?x=' . $label, 'external' => true ) ),
				),
			),
		);
	}

	/* ---------------------------------------------------------------------
	 * Rendering.
	 * ------------------------------------------------------------------ */

	protected function go( $path, array $flags = array(), $queried = null, array $vars = array() ) {
		$query = new WP_Query();
		foreach ( $flags as $flag ) {
			$query->$flag = true;
		}
		if ( $queried ) {
			$query->queried_object    = $queried;
			$query->queried_object_id = (int) $queried->ID;
		}
		foreach ( $vars as $key => $value ) {
			$query->set( $key, $value );
		}
		$GLOBALS['wp_query']     = $query;
		$GLOBALS['wp_the_query'] = $query;
		$_SERVER['REQUEST_URI']  = $path;

		return $query;
	}

	/**
	 * Render a template the way its PHP entry point does.
	 *
	 * @param string   $template Twig template.
	 * @param string   $path     Request path.
	 * @param string[] $flags    WP_Query is_* flags.
	 * @param int      $post_id  Queried post (0 for none).
	 * @param string   $filter   Context filter the entry point applies ('' for none).
	 * @param array    $extra    Extra context (entry-point computed keys).
	 * @param string   $label    Menu label to seed.
	 * @return string HTML.
	 */
	protected function render( $template, $path, array $flags, $post_id, $filter, array $extra, $label ) {
		$queried = $post_id ? get_post( $post_id ) : null;
		$this->go( $path, $flags, $queried );
		Timber\Timber::$context_cache = array();

		$context = Timber\Timber::context();
		$context = array_merge( $context, $this->menu_context( $label ), $extra );
		$timber_post = $post_id ? Timber\Timber::get_post( $post_id ) : null;
		if ( $timber_post ) {
			$context['post'] = $timber_post;
		}
		if ( $filter ) {
			$context = apply_filters( $filter, $context, $timber_post );
		}

		return Timber\Timber::compile( $template, $context );
	}

	/**
	 * Every public surface, rendered with the seeded content.
	 *
	 * @param array  $ids   seed() result.
	 * @param string $label Menu label.
	 * @return array<string,string> template → HTML.
	 */
	protected function render_all( array $ids, $label ) {
		$posts_page = 'search results';

		return array(
			'front-page.twig'        => $this->render( 'front-page.twig', '/', array( 'is_front_page', 'is_page', 'is_singular' ), $ids['front'], 'progressnow/context/front_page', array(), $label ),
			'index.twig'             => $this->render( 'index.twig', '/blog/', array( 'is_home' ), 0, 'progressnow/context/blog_archive', array(), $label ),
			'archive.twig'           => $this->render( 'archive.twig', '/category/chapter/', array( 'is_archive', 'is_category' ), 0, 'progressnow/context/blog_archive', array( 'title' => $label ), $label ),
			'search.twig'            => $this->render( 'search.twig', '/?s=' . rawurlencode( $label ), array( 'is_search' ), 0, 'progressnow/context/blog_archive', array( 'title' => 'Search results for ' . $label ), $label ),
			'author.twig'            => $this->render( 'author.twig', '/author/x/', array( 'is_archive', 'is_author' ), 0, 'progressnow/context/blog_archive', array( 'title' => 'Author Archives: ' . $label ), $label ),
			'single.twig'            => $this->render( 'single.twig', '/blog/seeded-post/', array( 'is_singular', 'is_single' ), $ids['post'], 'progressnow/context/single', array(), $label ),
			'single-event.twig'      => $this->render( 'single-event.twig', '/events/seeded-event/', array( 'is_singular', 'is_single' ), $ids['event'], 'progressnow/context/single', array(), $label ),
			'single-password.twig'   => $this->render( 'single-password.twig', '/blog/seeded-post/', array( 'is_singular', 'is_single' ), $ids['post'], 'progressnow/context/single', array(), $label ),
			'page.twig'              => $this->render( 'page.twig', '/bylaws/', array( 'is_singular', 'is_page' ), $ids['page'], 'progressnow/context/page', array(), $label ),
			'page-about.twig'        => $this->render( 'page-about.twig', '/about/', array( 'is_singular', 'is_page' ), $ids['about'], 'progressnow/context/page', array(), $label ),
			'page-get-involved.twig' => $this->render( 'page-get-involved.twig', '/get-involved/', array( 'is_singular', 'is_page' ), $ids['gi'], 'progressnow/context/page', array(), $label ),
			'page-calendar.twig'     => $this->render( 'page-calendar.twig', '/calendar/', array( 'is_singular', 'is_page' ), $ids['calendar'], 'progressnow/context/page', array(), $label ),
			'404.twig'               => $this->render( '404.twig', '/missing/' . rawurlencode( $label ), array( 'is_404' ), 0, '', array(), $label ),
		);
	}

	/**
	 * Split the encoder-guarded inline JSON blocks out of a document.
	 *
	 * @param string $html Rendered document.
	 * @return array{0:string,1:string[]} [markup without the blocks, block bodies]
	 */
	protected function split_encoded_blocks( $html ) {
		$blocks = array();
		$markup = preg_replace_callback(
			'#<script type="application/(?:ld\+json|json)"(?: id="__SHELL_DATA__")?>(.*?)</script>#s',
			static function ( $m ) use ( &$blocks ) {
				$blocks[] = $m[1];

				return '<!-- encoded block -->';
			},
			$html
		);

		return array( $markup, $blocks );
	}

	/** assertStringNotContainsString that prints a window around the hit, not the document. */
	protected function assert_absent( $needle, $haystack, $message ) {
		$pos = strpos( $haystack, $needle );
		if ( false !== $pos ) {
			$this->fail( $message . "\n  near: " . str_replace( "\n", ' ', substr( $haystack, max( 0, $pos - 120 ), 280 ) ) );
		}
		$this->addToAssertionCount( 1 );
	}

	/** assertStringContainsString that prints a short reason, not the document. */
	protected function assert_present( $needle, $haystack, $message ) {
		if ( false === strpos( $haystack, $needle ) ) {
			$this->fail( $message . " (`{$needle}` not found in " . strlen( $haystack ) . ' bytes)' );
		}
		$this->addToAssertionCount( 1 );
	}

	protected function assert_inert( $html, $surface ) {
		list( $markup, $blocks ) = $this->split_encoded_blocks( $html );

		foreach ( self::EXECUTABLE as $fragment ) {
			$this->assert_absent( $fragment, $markup, "{$surface}: `{$fragment}` survived outside the encoded blocks" );
		}
		// A raw apostrophe inside a tag would end a single-quoted attribute
		// (data-props='…'); as text (kses'd prose) it is inert.
		$this->assertDoesNotMatchRegularExpression( "#<[^>]*'-alert\\(1\\)-'#", $markup, "{$surface}: seeded apostrophe inside a tag" );
		// The seeded text is on the page as text, not dropped.
		$this->assert_present( '&lt;/script&gt;', $markup, "{$surface}: the hostile value renders as escaped text" );

		foreach ( $blocks as $i => $block ) {
			$this->assert_absent( '<', $block, "{$surface}: encoded block {$i} carries a literal <" );
			$this->assert_absent( '&', $block, "{$surface}: encoded block {$i} carries a literal &" );
			$this->assertNotNull( json_decode( $block, true ), "{$surface}: encoded block {$i} is valid JSON" );
		}
	}

	/* ---------------------------------------------------------------------
	 * Hostile content.
	 * ------------------------------------------------------------------ */

	public function test_hostile_content_is_inert_on_every_surface_in_islands_mode() {
		$ids = $this->seed( self::HOSTILE );

		foreach ( $this->render_all( $ids, self::HOSTILE ) as $surface => $html ) {
			$this->assert_present( '<main', $html, "{$surface}: rendered" );
			$this->assert_inert( $html, $surface );
		}
	}

	public function test_hostile_content_is_inert_in_nuxt_shell_mode() {
		$this->settings['CHAPTER_FRONTEND'] = 'nuxt';
		$ids = $this->seed( self::HOSTILE );

		$html = $this->render( 'single.twig', '/blog/seeded-post/', array( 'is_singular', 'is_single' ), $ids['post'], 'progressnow/context/single', array(), self::HOSTILE );

		$this->assertStringContainsString( 'id="__SHELL_DATA__"', $html );
		$this->assert_inert( $html, 'single.twig (nuxt)' );
		// Exactly one __SHELL_DATA__ element: the payload could not open another.
		$this->assertSame( 1, substr_count( $html, '<script type="application/json"' ) );
	}

	public function test_hostile_content_in_json_ld_head_stays_data() {
		$ids = $this->seed( self::HOSTILE );
		$this->go( '/blog/seeded-post/', array( 'is_singular', 'is_single' ), get_post( $ids['post'] ) );

		ob_start();
		progressnow_seo_head();
		$head = ob_get_clean();

		$this->assertSame( 1, preg_match_all( '#<script#', $head ), 'exactly one script element in the head' );
		$this->assert_inert( $head, 'wp_head' );
		list( , $blocks ) = $this->split_encoded_blocks( $head );
		$data = json_decode( $blocks[0], true );
		// The headline is texturized (curly quotes) but otherwise verbatim; the
		// committee name and chapter name are raw field values.
		$this->assertStringContainsString( self::SCRIPT . ' ', $data['@graph'][1]['headline'] );
		$this->assertStringContainsString( '<img src=x onerror=alert(1)>', $data['@graph'][1]['headline'] );
		$this->assertSame( self::HOSTILE, $data['@graph'][1]['author']['name'] );
		$this->assertSame( self::HOSTILE, $data['@graph'][0]['name'] );
	}

	public function test_hostile_content_in_ics_feed_is_text() {
		$this->seed( self::HOSTILE . "\r\nX-INJECTED:1" );

		$ics = progressnow_events_build_ics();

		$this->assertStringContainsString( 'BEGIN:VEVENT', $ics );
		$this->assert_absent( "\r\nX-INJECTED", $ics, 'a newline in a title cannot start a new content line' );
		$this->assert_absent( "\nX-INJECTED", $ics, 'a bare LF cannot start a new content line either' );
		$unfolded = str_replace( "\r\n ", '', $ics );
		// The title is texturized (curly quotes) but otherwise verbatim; the newline is the RFC 5545 `\n` escape.
		$this->assert_present( 'SUMMARY:Hostile </script><script>alert(1)</script> ', $unfolded, 'summary is the title as text' );
		$this->assertMatchesRegularExpression( '#SUMMARY:Hostile [^\r\n]*\\\\nX-INJECTED:1\r\n#', $unfolded, 'newline survives only as the \\n escape' );
		// The calendar name (PRODID + X-WR-CALNAME) and the venue/city location go through the same escape.
		$this->assert_present( "PRODID:-//Hostile <-script><script>alert(1)<-script> \"><img src=x onerror=alert(1)> '-alert(1)-'\\nX-INJECTED:1//Events//EN\r\n", $unfolded, 'PRODID escaped' );
		$this->assert_present( "X-WR-CALNAME:Hostile </script><script>alert(1)</script> \"><img src=x onerror=alert(1)> '-alert(1)-'\\nX-INJECTED:1 Events\r\n", $unfolded, 'calendar name escaped' );
		$this->assert_present( "LOCATION:Hostile </script><script>alert(1)</script> \"><img src=x onerror=alert(1)> '-alert(1)-'\\nX-INJECTED:1 — Hostile ", $unfolded, 'location is city — venue as text' );
	}

	/* ---------------------------------------------------------------------
	 * Single escaping.
	 * ------------------------------------------------------------------ */

	public function test_well_formed_content_is_escaped_exactly_once() {
		$ids = $this->seed( self::BENIGN );

		foreach ( $this->render_all( $ids, self::BENIGN ) as $surface => $html ) {
			list( $markup, $blocks ) = $this->split_encoded_blocks( $html );

			$this->assert_absent( '&amp;amp;', $markup, "{$surface}: double-escaped ampersand" );
			$this->assert_absent( '&amp;#', $markup, "{$surface}: double-escaped numeric entity" );
			$this->assert_absent( '&amp;quot;', $markup, "{$surface}: double-escaped quote" );
			$this->assert_absent( '&amp;lt;', $markup, "{$surface}: double-escaped angle bracket" );
			$this->assert_present( 'Tom &amp; Jerry', $markup, "{$surface}: ampersand escaped once" );
			$this->assert_absent( 'Tom & Jerry', $markup, "{$surface}: raw ampersand" );

			foreach ( $blocks as $i => $block ) {
				$data = json_decode( $block, true );
				$this->assertNotNull( $data, "{$surface}: encoded block {$i} decodes" );
				$this->assertStringContainsString( 'Tom & Jerry', wp_json_encode( $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ), "{$surface}: inline JSON carries the raw value" );
			}
		}
	}

	public function test_chapter_name_renders_once_escaped_in_head_and_chrome() {
		$ids = $this->seed( self::BENIGN );
		$this->go( '/', array( 'is_front_page', 'is_page', 'is_singular' ), get_post( $ids['front'] ) );

		ob_start();
		progressnow_seo_head();
		$head = ob_get_clean();
		$this->assert_present( 'content="Tom &amp; Jerry', $head, 'meta content escaped once' );
		$this->assert_absent( '&amp;amp;', $head, 'double-escaped ampersand in head' );
		list( , $blocks ) = $this->split_encoded_blocks( $head );
		$this->assertSame( self::BENIGN, json_decode( $blocks[0], true )['@graph'][0]['name'] );

		$html = $this->render( 'front-page.twig', '/', array( 'is_front_page', 'is_page', 'is_singular' ), $ids['front'], 'progressnow/context/front_page', array(), self::BENIGN );
		// Header lockup alt + footer name + tagline: once each.
		$this->assert_present( 'aria-label="Tom &amp; Jerry&#039;s &quot;Quotes&quot; &lt;3 home"', $html, 'header lockup link label' );
		$this->assert_present( '<span>Tom &amp; Jerry&#039;s &quot;Quotes&quot; &lt;3</span>', $html, 'footer name' );
		$this->assert_absent( '&amp;amp;', $html, 'double-escaped ampersand' );
	}

	/* ---------------------------------------------------------------------
	 * Inventory.
	 * ------------------------------------------------------------------ */

	public function test_every_public_template_has_a_hostile_content_case() {
		$templates = array_map( 'basename', glob( dirname( __DIR__ ) . '/views/*.twig' ) );
		sort( $templates );

		$known    = array_merge( self::COVERED, array_keys( self::NOT_A_SURFACE ) );
		$unknown  = array_values( array_diff( $templates, $known ) );
		$missing  = array_values( array_diff( self::COVERED, $templates ) );

		$this->assertSame( array(), $unknown, 'Templates without a hostile-content case (add to COVERED + render_all, or to NOT_A_SURFACE with a reason): ' . implode( ', ', $unknown ) );
		$this->assertSame( array(), $missing, 'COVERED lists templates that no longer exist: ' . implode( ', ', $missing ) );
	}
}
