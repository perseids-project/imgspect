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
		self.options = $.extend({
			style: 'full'
		}, _options);
		
		//------------------------------------------------------------
		//  Separate the image source and clipping coordinates
		//------------------------------------------------------------
		self.href = $( self.elem ).attr( 'href' );
		
		var arr = self.href.split('?');
		self.src = arr[0];
		self.area = self.getToJson( arr[1] );
		
		console.log( self.area );
		
		//------------------------------------------------------------
		//  Explicit width?
		//------------------------------------------------------------
		if ( self.area.w != undefined ) {
			self.area.z = self.area.w / ( self.area.x2 - self.area.x1 );
		}
		
		//------------------------------------------------------------
		//  Explicit height?
		//------------------------------------------------------------
		if ( self.area.h != undefined ) {
			self.area.z = self.area.h / ( self.area.y2 - self.area.y1 );
		}
		
		self.area.z = ( self.area.z == undefined ) ? 1 : self.area.z;
		
		//------------------------------------------------------------
		//  Check to see if min class has been passed
		//------------------------------------------------------------
		if ( $( self.elem ).hasClass('min') ) {
			self.options['style'] = null;
		}
		
		//------------------------------------------------------------
		//  Check to see if img is in album
		//------------------------------------------------------------
		self.buildDom();
	}
	
	/**
	 * Build the imgbit DOM elements
	 */
	imgbit.prototype.buildDom = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Change anchor tag to div
		//------------------------------------------------------------
		$( self.elem ).after( '<div class="imgbit">' );
		self.elem = $( self.elem ).next();
		var a = $( self.elem ).prev();
		var html = a.html();
		a.remove();
		
		//------------------------------------------------------------
		//  Add the style class if it is not null
		//------------------------------------------------------------
		if ( self.options['style'] != null ) {
			$( self.elem ).addClass( self.options['style'] );
		}
		
		//------------------------------------------------------------
		//  Create the viewport
		//------------------------------------------------------------
		$( self.elem ).append( '<div class="view">' );
		
		//------------------------------------------------------------
		//  Store the a tag text
		//------------------------------------------------------------
		if ( self.options['style'] != null ) {
			$( self.elem ).append( '<div class="text">'+ html +'</div>' );
		}
		
		//------------------------------------------------------------
		//  Clone the image
		//------------------------------------------------------------
		var img = new Image();
		img.onload = function() {
			$( this ).addClass('star');
			
			//------------------------------------------------------------
			//  Add the image to the view
			//------------------------------------------------------------
			$( '.view', self.elem ).append( this )
			
			//------------------------------------------------------------
			//  Crop the view to the area dimensions
			//------------------------------------------------------------
			self.viewCrop();
		
			//------------------------------------------------------------
			//  Move the image into place and scale it
			//------------------------------------------------------------
			self.imgMove();
		
			//------------------------------------------------------------
			//  Add a clear
			//------------------------------------------------------------
			$( self.elem ).prepend( '<div style="clear:both"></div>' );
		
			//------------------------------------------------------------
			//  Add a link to the source image
			//------------------------------------------------------------
			if ( self.options['style'] != null ) {
				$( self.elem ).prepend( '<a class="source" href="'+ self.src +'">source</a>' );
			}
						
			//------------------------------------------------------------
			//  Scale imgbit container to size of image
			//------------------------------------------------------------
			$( self.elem ).css({
				width: $( '.view', self.elem ).width()
			});
		}
		img.src = self.src;
	}
	
	/**
	 * Crop the view window
	 */
	imgbit.prototype.viewCrop = function() {
		var self = this;
		$( '.view', self.elem ).css({
			width: ( self.area.x2 - self.area.x1 ) * self.area.z,
			height: ( self.area.y2 - self.area.y1 ) * self.area.z
		});
	}
	
	/**
	 * Move the image into place
	 */
	imgbit.prototype.imgMove = function() {
		var self = this;
		$( 'img.star', self.elem ).css({
			width: $( 'img.star', self.elem ).width() * self.area.z,
			height: $( 'img.star', self.elem ).height() * self.area.z,
			left: self.area.x1*-1*self.area.z,
			top: self.area.y1*-1*self.area.z
		});
	}
	
	/**
	 * Turn GET parameter string into a JSON object
	 */
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