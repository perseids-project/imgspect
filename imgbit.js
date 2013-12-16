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
		//  Events
		//------------------------------------------------------------
		self.events = {
			change: 'IMGBIT-CHANGE'
		}
		
		//------------------------------------------------------------
		//  Separate the image source and clipping coordinates
		//------------------------------------------------------------
		self.href = $( self.elem ).attr( 'href' );
		
		var arr = self.href.split('?');
		self.src = arr[0];
		self.area = self.getToJson( arr[1] );
		
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
		//  Check to see if special style classes have been passed
		//------------------------------------------------------------
		if ( $( self.elem ).hasClass('min') ) {
			self.options['style'] = null;
		}
		if ( $( self.elem ).hasClass('edit') ) {
			self.options['style'] = 'edit';
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
		//  Store the id
		//------------------------------------------------------------
		var id = $( self.elem ).attr('id');
		
		//------------------------------------------------------------
		//  Change anchor tag to div
		//------------------------------------------------------------
		$( self.elem ).after( '<div class="imgbit">' );
		self.elem = $( self.elem ).next();
		
		//------------------------------------------------------------
		//  Add the id
		//------------------------------------------------------------
		$( self.elem ).attr( 'id', id );
		
		//------------------------------------------------------------
		//  Remove the original anchor tag.
		//------------------------------------------------------------
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
		//  Load the image
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
			if ( self.options['style'] != null && self.options['style'] != 'edit' ) {
				$( self.elem ).prepend( '<a class="source" href="'+ self.src +'">source</a>' );
			}
			
			//------------------------------------------------------------
			//  If the edit tag is set create the edit dom elements
			//------------------------------------------------------------
			self.editStart();
			
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
	 * Build DOM elements needed for edit style
	 *
	 * @param { imgbit } _self There are weird scopr
	 */
	imgbit.prototype.editStart = function() {
		var self = this;
		if ( self.options['style'] == 'edit' ) {
			
			//------------------------------------------------------------
			//  Build a caption
			//------------------------------------------------------------
			var text = $( '.text', self.elem );
			text.after( '<textarea class="caption">'+text.text()+'</textarea>' );
			var caption = $( '.caption', self.elem );
			
			//------------------------------------------------------------
			//  Set the width of the caption to the size of the image
			//------------------------------------------------------------
			caption.css({ width: $( '.view', self.elem).width() });
			
			//------------------------------------------------------------
			//  Build a switcher
			//------------------------------------------------------------
			caption.after( '<a href="#" class="switcher">edit</a>' );
			$( '.caption', self.elem ).hide();
			
			//------------------------------------------------------------
			//  Switch between editable and static captions
			//------------------------------------------------------------
			var switcher = $( '.switcher', self.elem );
			switcher.click( function( _e ) {
				if ( caption.is(":visible") ) {
					caption.hide();
					text.show();
					switcher.text( 'edit' );
				}
				else {
					caption.show();
					text.hide();
					switcher.text( 'save' );
					caption.cursorToEnd();
				}
				_e.preventDefault();
			});
			
			//------------------------------------------------------------
			//  Keep editable and static caption synched
			//------------------------------------------------------------
			caption.bind( 'input propertychange', function() {
				text.text( caption.val() );
				
				//------------------------------------------------------------
				//  Let the application know you've changed
				//------------------------------------------------------------
				$( self.elem ).trigger( self.events['change'] );
			});
		}
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
            json[ param[0] ] = decodeURIComponent( param[1].replace( /\+/g, "" ) );
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

/*
 *  Extend jQuery
 */
jQuery.fn.cursorToEnd = function() {
	return this.each( function() {
		$(this).focus();
		
		//------------------------------------------------------------
		//   If this function exists...
		//------------------------------------------------------------
		if ( this.setSelectionRange ) {
			//------------------------------------------------------------
			// ... then use it (Doesn't work in IE)
			// Double the length because Opera is inconsistent 
			// about whether a carriage return is one character or two.
			//------------------------------------------------------------
			var len = $(this).val().length * 2;
			this.setSelectionRange(len, len);
		} 
		else {
			//------------------------------------------------------------
			// ... otherwise replace the contents with itself
			// (Doesn't work in Google Chrome)
			//------------------------------------------------------------
			$(this).val($(this).val());
		}
		//------------------------------------------------------------
		// Scroll to the bottom, in case we're in a tall textarea
		// (Necessary for Firefox and Google Chrome)
		//------------------------------------------------------------
		this.scrollTop = 999999;
	});
};