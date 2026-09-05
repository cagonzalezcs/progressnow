<?php
/**
 * Category registry: the single source of truth for the six canonical
 * category slugs, labels, and colors.
 *
 * Reads `categories.json` (theme root) — the same file `src/lib/events.ts`
 * imports and the vitest drift test checks the Tailwind `--color-cat-*`
 * tokens against. Slugs are load-bearing (URLs + Vue types); a
 * `wp_update_term_data` guard forces canonical slugs back on rename.
 *
 * Public contract (other domains call these):
 * - progressnow_category_registry(): array<slug, array{label, color}> — JSON
 *   defaults, static-cached.
 * - progressnow_categories( $taxonomy ): array — [{ id, label, color }] with the
 *   WP term name and ACF term-meta `color` merged over the defaults.
 */

/**
 * Canonical category registry from categories.json, keyed by slug.
 *
 * @return array<string, array{label: string, color: string}>
 */
function progressnow_category_registry() {
	static $registry = null;
	if ( null !== $registry ) {
		return $registry;
	}

	$registry = array();
	$raw      = file_get_contents( dirname( __DIR__ ) . '/categories.json' );
	$entries  = $raw ? json_decode( $raw, true ) : null;

	if ( is_array( $entries ) ) {
		foreach ( $entries as $entry ) {
			if ( ! is_array( $entry ) || empty( $entry['id'] ) ) {
				continue;
			}
			$registry[ (string) $entry['id'] ] = array(
				'label' => (string) $entry['label'],
				'color' => (string) $entry['color'],
			);
		}
	}

	return $registry;
}

/**
 * Canonical slug for a term: its own slug when canonical, otherwise the
 * canonical slug found elsewhere in its Polylang translation group
 * (Polylang gives translated terms suffixed slugs, e.g. `poled-en`).
 *
 * @param WP_Term $term Term to resolve.
 * @return string Canonical slug, or '' when the term maps to none.
 */
function progressnow_canonical_term_slug( $term ) {
	$registry = progressnow_category_registry();
	if ( array_key_exists( $term->slug, $registry ) ) {
		return $term->slug;
	}

	if ( function_exists( 'pll_get_term_translations' ) ) {
		foreach ( pll_get_term_translations( $term->term_id ) as $translation_id ) {
			$translation = get_term( $translation_id, $term->taxonomy );
			if ( $translation instanceof WP_Term && array_key_exists( $translation->slug, $registry ) ) {
				return $translation->slug;
			}
		}
	}

	return '';
}

/**
 * Term ids carrying a canonical category slug: the canonical-slug term plus
 * its Polylang translations. Queries intersect these with their language
 * tax_query, so canonical-slug filtering works in every language.
 *
 * @param string $slug     Canonical slug from the registry.
 * @param string $taxonomy 'category' or 'event_category'.
 * @return int[] Term ids; empty when the term doesn't exist.
 */
function progressnow_category_term_ids( $slug, $taxonomy = 'category' ) {
	$terms = get_terms(
		array(
			'taxonomy'   => $taxonomy,
			'slug'       => $slug,
			'hide_empty' => false,
			'lang'       => '', // Polylang: don't restrict to the current language.
		)
	);
	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	$ids = array( (int) $terms[0]->term_id );
	if ( function_exists( 'pll_get_term_translations' ) ) {
		foreach ( pll_get_term_translations( $terms[0]->term_id ) as $translation_id ) {
			$ids[] = (int) $translation_id;
		}
	}

	return array_values( array_unique( $ids ) );
}

/**
 * The six canonical categories for a taxonomy, in registry order.
 * Term name and ACF term-meta `color` win when the term exists; the
 * registry is the fallback. Terms are matched through their Polylang
 * translation group, so on the front end the current-language term
 * (which Polylang leaves in get_terms) supplies the label.
 *
 * @param string $taxonomy 'category' or 'event_category'.
 * @return array [{ id: slug, label: string, color: hex }]
 */
function progressnow_categories( $taxonomy = 'category' ) {
	$by_slug = array();
	$terms   = get_terms(
		array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => false,
		)
	);
	if ( ! is_wp_error( $terms ) ) {
		foreach ( $terms as $term ) {
			$canonical = progressnow_canonical_term_slug( $term );
			if ( '' !== $canonical && ! isset( $by_slug[ $canonical ] ) ) {
				$by_slug[ $canonical ] = $term;
			}
		}
	}

	$categories = array();
	foreach ( progressnow_category_registry() as $slug => $fallback ) {
		$term  = isset( $by_slug[ $slug ] ) ? $by_slug[ $slug ] : null;
		$color = $fallback['color'];

		if ( $term && function_exists( 'get_field' ) ) {
			// Color may live on any term in the translation group (it is
			// usually set once, on the canonical-slug term).
			$candidates = array( $term->term_id );
			if ( function_exists( 'pll_get_term_translations' ) ) {
				$candidates = array_merge( $candidates, array_values( pll_get_term_translations( $term->term_id ) ) );
			}
			foreach ( array_unique( $candidates ) as $term_id ) {
				$term_color = get_field( 'color', $taxonomy . '_' . $term_id );
				if ( is_string( $term_color ) && '' !== $term_color ) {
					$color = $term_color;
					break;
				}
			}
		}

		$categories[] = array(
			'id'    => $slug,
			'label' => $term ? $term->name : $fallback['label'],
			'color' => $color,
		);
	}

	return $categories;
}

/* -------------------------------------------------------------------------
 * Canonical slug protection.
 * ---------------------------------------------------------------------- */

add_filter( 'wp_update_term_data', 'progressnow_guard_canonical_term_slugs', 10, 3 );

/**
 * Force canonical slugs back on rename: if a `category`/`event_category`
 * term currently has a canonical slug, keep it — the slugs appear in URLs
 * and the Vue category union type, so a rename silently breaks routing
 * and degrades posts to the "chapter" fallback.
 *
 * @param array  $data     Term data to be updated.
 * @param int    $term_id  Term ID.
 * @param string $taxonomy Taxonomy slug.
 * @return array Term data with the canonical slug restored when needed.
 */
function progressnow_guard_canonical_term_slugs( $data, $term_id, $taxonomy ) {
	if ( ! in_array( $taxonomy, array( 'category', 'event_category' ), true ) ) {
		return $data;
	}

	$term = get_term( $term_id, $taxonomy );
	if ( ! $term instanceof WP_Term ) {
		return $data;
	}

	if ( array_key_exists( $term->slug, progressnow_category_registry() ) ) {
		$data['slug'] = $term->slug;
	}

	return $data;
}
