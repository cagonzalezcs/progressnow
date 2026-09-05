<?php

namespace WordfenceLS\View;

/**
 * Represents a tab in the UI.
 * 
 * @package Wordfence2FA\View
 * @property string $id
 * @property string $a
 * @property string $tabTitle
 * @property string $pageTitle
 * @property bool $active
 * @property string|null $mobileTabTitle
 */
class Model_Tab {
	protected $_id;
	protected $_a;
	protected $_tabTitle;
	protected $_pageTitle;
	protected $_active;
	protected $_mobileTabTitle;
	
	public function __construct($id, $a, $tabTitle, $pageTitle, $active = false, $mobileTabTitle = null) {
		$this->_id = $id;
		$this->_a = $a;
		$this->_tabTitle = $tabTitle;
		$this->_pageTitle = $pageTitle;
		$this->_active = $active;
		$this->_mobileTabTitle = $mobileTabTitle;
	}
	
	public function __get($name) {
		switch ($name) {
			case 'id':
				return $this->_id;
			case 'a':
				return $this->_a;
			case 'tabTitle':
				return $this->_tabTitle;
			case 'pageTitle':
				return $this->_pageTitle;
			case 'active':
				return $this->_active;
			case 'mobileTabTitle':
				return $this->_mobileTabTitle;
		}
		
		throw new \OutOfBoundsException('Invalid key: ' . $name);
	}
}
