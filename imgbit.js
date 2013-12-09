/*!
 * imgbit
 *
 * The format of the <a> tag needed by imgbit
 * <a href="path.to/your/img.jpg?x1=0&y1=0&x2=100&y2=100">Display text or markup!</a>
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The <a> tag holding your urn and display text.
	 *
	 * @param { obj } _options Configuration options
	 *
	 * @param { string } _id The id of the anchor element 
	 */
	function imgbit( _elem, _options, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _options );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The <a> tag holding your urn and display text.
	 *
	 * @param { obj } _options Configuration options
	 */
	imgbit.prototype.init = function( _elem, _options ) {
		var self = this;
		
		//------------------------------------------------------------
		// 	User options 
		//------------------------------------------------------------
		self.options = $.extend({}, _options);
		
		//------------------------------------------------------------
		//  Check for the imgbit album
		//------------------------------------------------------------
		self.albumCheck();
		
		//------------------------------------------------------------
		//  Separate the image source and clipping coordinates
		//------------------------------------------------------------
		self.href = $( self.elem ).attr( 'href' );
		var arr = self.href.split('?');
		self.src = arr[0];
		self.area = self.getToJson( arr[1] );
	}
	
	imgbit.prototype.albumCheck = function() {
		var self = this;
		self.album = $( '#imgbit_album' );
		if ( self.album.length == 0 ) {
			self.albumBuild();
		}
	}

	/**
	 * Build the imgbit album
	 */	
	imgbit.prototype.albumBuild = function() {
		var self = this;
		$( document ).append( '<div id="imgbit_album">' );
		self.album = $( '#imgbit_album' );
	}
	
	/**
	 * Build the imgbit DOM elements
	 */
	imgbit.prototype.buildDom = function() {
		var self = this;
	}
	
	imgbit.prototype.getToJson = function( _get ) {
        if ( _get == "" ) return {};
        var json = {};
		var key_vals = _get.split('&');
        for ( var i=0; i < key_vals.length; i++ ) {
			var param = key_vals[i].split('=');
			if ( param.length != 2 ) {
				continue;
			}
            json[ param[0] ] = decodeURIComponent( param[1].replace( /\+/g, " " ) );
        }
        return json;
    }
	
	/**
	 * "Register" this plugin with jQuery
	 */
	jQuery(document).ready( function($) {
		jQuery.fn.imgbit = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new imgbit( this, options, id ) );
			});
		};
	})
})(jQuery);