/*!
 * imgspectrix
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The root element that will hold imgspectrix
	 *
	 * @param { obj } _options Configuration options
	 *
	 * @param { string } _id The id of the root imgspectrix element 
	 */
	function imgspectrix( _elem, _options, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _options );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The root element that will hold imgspectrix
	 *
	 * @param { obj } _options Configuration options
	 */
	imgspectrix.prototype.init = function( _elem, _options ) {
		var self = this;
		
		//------------------------------------------------------------
		// 	User options 
		//------------------------------------------------------------
		self.options = $.extend({}, _options);
		
		//------------------------------------------------------------
		//  Make sure imgspect element is passed in the options
		//------------------------------------------------------------
	}
	
	/**
	 * "Register" this plugin with jQuery
	 */
	jQuery(document).ready( function($) {
		jQuery.fn.imgspect = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new imgspect( this, options, id ) );
			});
		};
	})
})(jQuery);