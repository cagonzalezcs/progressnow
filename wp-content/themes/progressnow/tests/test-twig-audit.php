<?php
/**
 * Twig output-escaping gate (openspec security-template-output-escaping):
 * the same rules as bin/twig-audit.mjs, so `composer test` alone fails on
 * an unmarked `|raw`, an inline <script> that interpolates anything but the
 * encoder's output, json_encode concatenated into a <script> line, or
 * autoescape switched off. Rule text lives in bin/twig-audit.mjs.
 */

use PHPUnit\Framework\TestCase;

class TestTwigAudit extends TestCase {

	/** Context keys produced by progressnow_json_for_script (inc/shell.php). */
	const ENCODED = array( 'shell_data_json' );
	const MARKER  = '/\{#\s*raw:\s*(?:kses|encoder|markup)(?:\s*,\s*(?:kses|encoder|markup))*\s*#\}/';
	const RAW     = '/\|\s*raw\b/';

	/**
	 * Audit a Twig source.
	 *
	 * @param string $source Template source.
	 * @param string $name   File name for findings.
	 * @return string[] Findings as `file:line message`.
	 */
	public static function audit_twig( $source, $name ) {
		$findings  = array();
		$in_script = false;
		// Comments blanked (newlines kept) so `|raw` in prose is not a finding.
		$code_lines = explode(
			"\n",
			preg_replace_callback(
				'/\{#.*?#\}/s',
				static function ( $m ) {
					return preg_replace( '/[^\n]/', ' ', $m[0] );
				},
				$source
			)
		);

		foreach ( explode( "\n", $source ) as $i => $line ) {
			$at   = $name . ':' . ( $i + 1 );
			$code = $code_lines[ $i ];

			if ( preg_match( self::RAW, $code ) && ! preg_match( self::MARKER, $line ) ) {
				$findings[] = "{$at} |raw without a {# raw: kses|encoder|markup #} marker";
			}

			$from = 0;
			$len  = strlen( $code );
			while ( $from < $len ) {
				if ( ! $in_script ) {
					$open = strpos( $code, '<script', $from );
					if ( false === $open ) {
						break;
					}
					$gt = strpos( $code, '>', $open );
					if ( false === $gt ) {
						break;
					}
					$in_script = true;
					$from      = $gt + 1;
				} else {
					$close = strpos( $code, '</script>', $from );
					$body  = false === $close ? substr( $code, $from ) : substr( $code, $from, $close - $from );
					if ( preg_match_all( '/\{\{\s*(.*?)\s*\}\}/', $body, $m ) ) {
						foreach ( $m[1] as $expr ) {
							$parts = explode( '|', $expr );
							$var   = trim( $parts[0] );
							if ( ! in_array( $var, self::ENCODED, true ) || ! preg_match( self::RAW, $expr ) ) {
								$findings[] = "{$at} <script> interpolates `{$expr}` — only encoder output (" . implode( ', ', self::ENCODED ) . ') may be inlined';
							}
						}
					}
					if ( false === $close ) {
						break;
					}
					$in_script = false;
					$from      = $close + strlen( '</script>' );
				}
			}
		}

		return $findings;
	}

	/**
	 * Audit a PHP source for json_encode concatenated into a <script> line.
	 *
	 * @param string $source PHP source.
	 * @param string $name   File name for findings.
	 * @return string[]
	 */
	public static function audit_php( $source, $name ) {
		$findings = array();
		foreach ( explode( "\n", $source ) as $i => $line ) {
			if ( preg_match( '/<script\b/', $line ) && preg_match( '/json_encode\s*\(/', $line ) ) {
				$findings[] = $name . ':' . ( $i + 1 ) . ' json_encode inside a <script> line — use progressnow_json_for_script()';
			}
		}

		return $findings;
	}

	private static function files( $dir, $ext ) {
		$out = array();
		$it  = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $dir, FilesystemIterator::SKIP_DOTS ) );
		foreach ( $it as $file ) {
			if ( substr( $file->getPathname(), -strlen( $ext ) ) === $ext ) {
				$out[] = $file->getPathname();
			}
		}
		sort( $out );

		return $out;
	}

	/* ---- the theme ---- */

	public function test_autoescape_is_enabled() {
		$starter = file_get_contents( dirname( __DIR__ ) . '/src/StarterSite.php' );

		$this->assertMatchesRegularExpression( "/^\s*\\\$options\['autoescape'\]\s*=\s*'html';/m", $starter, 'src/StarterSite.php must set $options[\'autoescape\'] = \'html\'' );
	}

	public function test_every_raw_is_marked_and_scripts_inline_only_encoder_output() {
		$root     = dirname( __DIR__ );
		$findings = array();
		foreach ( self::files( $root . '/views', '.twig' ) as $file ) {
			$findings = array_merge( $findings, self::audit_twig( file_get_contents( $file ), substr( $file, strlen( $root ) + 1 ) ) );
		}
		foreach ( array_merge( self::files( $root . '/inc', '.php' ), self::files( $root . '/src', '.php' ) ) as $file ) {
			$name = substr( $file, strlen( $root ) + 1 );
			if ( 'inc/escaping.php' === $name ) {
				continue;
			}
			$findings = array_merge( $findings, self::audit_php( file_get_contents( $file ), $name ) );
		}

		$this->assertSame( array(), $findings, "twig-audit findings:\n  " . implode( "\n  ", $findings ) );
	}

	public function test_markers_are_present_on_every_raw_site() {
		// The rule bites: the theme has |raw sites, each marked.
		$root  = dirname( __DIR__ );
		$raw   = 0;
		$marks = 0;
		foreach ( self::files( $root . '/views', '.twig' ) as $file ) {
			// Per line: one marker covers every |raw on that line.
			$source = file_get_contents( $file );
			$lines  = explode( "\n", $source );
			$code   = preg_replace_callback( '/\{#.*?#\}/s', static fn( $m ) => preg_replace( '/[^\n]/', ' ', $m[0] ), $source );
			foreach ( explode( "\n", $code ) as $i => $line ) {
				if ( preg_match( self::RAW, $line ) ) {
					++$raw;
					$marks += preg_match( self::MARKER, $lines[ $i ] );
				}
			}
		}
		$this->assertGreaterThan( 20, $raw );
		$this->assertSame( $raw, $marks );
	}

	/* ---- the rules ---- */

	public function test_unmarked_raw_is_a_finding() {
		$this->assertSame( array(), self::audit_twig( "<div>{{ body|raw }}</div> {# raw: kses #}", 'x.twig' ) );
		$this->assertSame( array(), self::audit_twig( "{# raw: encoder, markup #}<html {{ attrs|raw }}>", 'x.twig' ) );
		$this->assertSame(
			array( 'x.twig:2 |raw without a {# raw: kses|encoder|markup #} marker' ),
			self::audit_twig( "<p>{{ ok }}</p>\n<div>{{ body | raw }}</div>", 'x.twig' )
		);
		// A marker naming an unknown sanitizer does not count; a marker in a comment on another line does not count.
		$this->assertCount( 1, self::audit_twig( "{{ body|raw }} {# raw: trust-me #}", 'x.twig' ) );
		$this->assertCount( 1, self::audit_twig( "{# raw: kses #}\n{{ body|raw }}", 'x.twig' ) );
	}

	public function test_script_interpolation_must_be_encoder_output() {
		$this->assertSame( array(), self::audit_twig( '<script type="application/json" id="__SHELL_DATA__">{{ shell_data_json|raw }}</script> {# raw: encoder #}', 'x.twig' ) );
		$this->assertSame(
			array( 'x.twig:1 <script> interpolates `data|json_encode|raw` — only encoder output (shell_data_json) may be inlined' ),
			self::audit_twig( '<script>window.x = {{ data|json_encode|raw }};</script> {# raw: encoder #}', 'x.twig' )
		);
		$this->assertCount(
			1,
			self::audit_twig( "<script>\n  var t = {{ title }};\n</script>", 'x.twig' ),
			'plain interpolation in a multi-line script body'
		);
		// `|raw` in a Twig comment is prose, not a finding (multi-line comments included).
		$this->assertSame( array(), self::audit_twig( "{# rendered |raw\n   by the wrapper #}\n<p>{{ x }}</p>", 'x.twig' ) );
	}

	public function test_json_encode_in_a_script_line_is_a_finding() {
		$this->assertSame( array(), self::audit_php( "echo '<script type=\"application/ld+json\">' . progressnow_json_for_script( \$data ) . '</script>';", 'x.php' ) );
		$this->assertSame(
			array( 'x.php:1 json_encode inside a <script> line — use progressnow_json_for_script()' ),
			self::audit_php( "echo '<script>' . wp_json_encode( \$data, JSON_HEX_TAG ) . '</script>';", 'x.php' )
		);
	}
}
