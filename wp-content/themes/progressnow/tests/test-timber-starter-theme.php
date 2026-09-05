<?php

use Timber\Timber;
use WorDBless\BaseTestCase;

class TestTimberStarterTheme extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';

		// WorDBless includes wp-settings.php
		do_action( 'after_setup_theme' );

		parent::set_up();
	}

	public function tear_down() {
		parent::tear_down();
	}

	public function test_timber_exists() {
		$context = Timber::context();
		$this->assertTrue( is_array( $context ) );
	}

	public function test_functions_php() {
		$context = Timber::context();
		$this->assertEquals( 'StarterSite', get_class( $context['site'] ) );
		$this->assertTrue( current_theme_supports( 'post-thumbnails' ) );
	}

	public function test_loading() {
		$str = Timber::compile( 'tease.twig' );
		$this->assertStringStartsWith( '<article class="tease tease-" id="tease-">', $str );
		$this->assertStringEndsWith( '</article>', $str );
	}
}
