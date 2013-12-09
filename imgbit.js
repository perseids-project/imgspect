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
		self.area.z = ( self.area.z == undefined ) ? 1 : self.area.z;
		
		//------------------------------------------------------------
		//  Check to see if img is in album
		//------------------------------------------------------------
		self.imgCheck();
	}
	
	/**
	 * Check to see if an image is stored in the page's imgbit album
	 */
	imgbit.prototype.imgCheck = function() {
		var self = this;
		$( 'img', self.album ).each( function() {
			if ( $( this ).attr( 'src' ) == self.src ) {
				self.buildDom();
				return;
			};
		});
		
		//------------------------------------------------------------
		//  If the image isn't in the album download it.
		//------------------------------------------------------------
		self.imgLoad();
	}
	
	
	/**
	 * Retrieve an image from the page's imgbit album
	 */	
	imgbit.prototype.imgFromAlbum = function() {
		var self = this;
		$( 'img', self.album ).each( function() {
			if ( $( this ).attr( 'src' ) == self.src ) {
				$( this ).clone().appendTo( $( '.view', self.elem ) ).addClass('star');
			};
		});
	}
	
	/**
	 * Load an image and store it in the page's imgbit album
	 */	
	imgbit.prototype.imgLoad = function() {
		var self = this;
		var img = new Image();
		img.onload = function() {
			self.album.append( this );
			self.buildDom();
		}
		img.src = self.src;
	}
	
	/**
	 * Check to see if a page's imgbit album has been created
	 */	
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
		$( document.body ).append( '<div id="imgbit_album">' );
		self.album = $( '#imgbit_album' );
		self.album.hide();
		
		$( document.body ).append( '<ul id="imgbit_index">' );
		self.index = $( '#imgbit_index' );
		self.index.hide();
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
		//  Create the viewport
		//------------------------------------------------------------
		$( self.elem ).append( '<div class="view">' );
		
		//------------------------------------------------------------
		//  Store the a tag text
		//------------------------------------------------------------
		$( self.elem ).append( '<div class="text">'+ html +'</div>' );
		
		//------------------------------------------------------------
		//  Clone the image
		//------------------------------------------------------------
		self.imgFromAlbum();
		
		//------------------------------------------------------------
		//  Crop the view to the area dimensions
		//------------------------------------------------------------
		self.viewCrop();
		
		//------------------------------------------------------------
		//  Move the image into place and scale it
		//------------------------------------------------------------
		self.imgMove();
		
		//------------------------------------------------------------
		//  Add a link to the source image
		//------------------------------------------------------------
		$( self.elem ).append( '<a href="'+ self.src +'">+</a>' );
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