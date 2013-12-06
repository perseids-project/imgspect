/*!
 * imgspect
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The image DOM element you want to inspect
	 *
	 * @param { obj } _options Key value pairs that hold 
	 *		imgspect's configuration
	 *
	 * @param { string } _id The id of the DOM element 
	 */
	function imgspect( _elem, _options, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _options );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The image DOM element you want to inspect
	 *
	 * @param { obj } _options Key value pairs that hold 
	 *		imgspect's configuration
	 */
	imgspect.prototype.init = function( _elem, _options ) {
		var self = this;
		
		//------------------------------------------------------------
		// 	User options 
		//------------------------------------------------------------
		self.options = $.extend({}, _options);
		
		//------------------------------------------------------------
		//  Plugin properties
		//------------------------------------------------------------
		self.highlights = [];
		self.zoomLev = 1;
		self.pan = { x:0, y:0 };
		self.curHiDom = null;
		
		//------------------------------------------------------------
		//  Original height and width
		//------------------------------------------------------------
		self.origW = $( self.elem ).width();
		self.origH = $( self.elem ).height();
		
		//------------------------------------------------------------
		//	Start this party
		//------------------------------------------------------------
		self.buildDom();
		
		//------------------------------------------------------------
		//  Start interaction
		//------------------------------------------------------------
		self.start();
	}
	
	/**
	 * Create the imgspect environment.
	 */
	imgspect.prototype.buildDom = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Wrap the image in the imgspect class.
		//------------------------------------------------------------
		$( self.elem ).wrap( '<div class="imgspect">' );
		self.elem = $( self.elem ).parent();
		
		//------------------------------------------------------------
		//  Build the viewport.
		//------------------------------------------------------------
		$( 'img', self.elem ).wrap( '<div class="viewport">' );
		
		//------------------------------------------------------------
		//  Clone the viewport and rename it to create the
		//  navigation boundary box.
		//------------------------------------------------------------
		$( self.elem ).append( $( '.viewport', self.elem ).clone() );
		$( '.viewport:eq(0)', self.elem ).removeClass( 'viewport' ).addClass( 'navigate' );
		
		//------------------------------------------------------------
		//  Create the navigation dragger
		//------------------------------------------------------------
		$( '.navigate', self.elem ).prepend( '<div class="drag">' );
		
		//------------------------------------------------------------
		//  Clear element so no unexpected wrapping occurs
		//------------------------------------------------------------
		$( self.elem ).append( '<div style="clear:both">' );
		
		//------------------------------------------------------------
		//  Create the toolbrs
		//------------------------------------------------------------
		$( self.elem ).append( '<div class="tools">' );
		$( '.tools', self.elem ).append( '<a href="#" class="zoom in">+</a>' );
		$( '.tools', self.elem ).append( '<a href="#" class="zoom out">-</a>' );
		
		//------------------------------------------------------------
		//  Clear element so no unexpected wrapping occurs
		//------------------------------------------------------------
		$( self.elem ).append( '<div style="clear:both">' );
	}
	
	/**
	 * Start imgspect interactivity.
	 */
	imgspect.prototype.start = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Build the navigation dragger
		//------------------------------------------------------------
		$( '.drag', self.elem ).draggable({
			containment: 'parent',
			scroll: false,
			drag: function() {
				var pPos = $( '.navigate', this.elem ).position();
				var tPos = $( '.drag', this.elem ).position();
				self.drag( pPos, tPos );
			}
		});
		
		//------------------------------------------------------------
		//  Set the navigation dragger dimensions
		//------------------------------------------------------------
		var img = $( '.navigate img', self.elem );
		$( '.drag', self.elem ).css({
			width: img.width(),
			height: img.height(),
		});
		
		//------------------------------------------------------------
		//  Zooming
		//------------------------------------------------------------
		$( '.zoom', self.elem ).click( function( _e ) {
			if ( $(this).hasClass('in') ) {
				self.zoomIn();
			}
			else {
				self.zoomOut();
			}
			_e.preventDefault();
		});
		
		//------------------------------------------------------------
		//  Add Highlights Mouse Event Listener
		//------------------------------------------------------------
		$( '.viewport', self.elem ).mousedown( function( _e ) {
			self.curHiDom = $( document.createElement('div') ).addClass( 'highlight' );
			$( '.viewport', self.elem ).append( self.curHiDom );
			var c = self.coords( _e );
			self.curHiDom.css({
				left: c.x,
				top: c.y
			});
			_e.preventDefault();
		});
		$( '.viewport', self.elem ).mousemove( function( _e ) {
			if ( self.curHiDom != null ) {
				var c = self.coords( _e );
				var width = c.x - parseInt( self.curHiDom.css('left').replace('px') );
				var height = c.y - parseInt( self.curHiDom.css('top').replace('px') );
				self.curHiDom.css({
					'width': width,
					'height': height
				});
			}
			_e.preventDefault();
		});
		$( '.viewport', self.elem ).mouseup( function( _e ) {
			//------------------------------------------------------------
			//  Mark the temporary highlight for removal
			//------------------------------------------------------------
			self.curHiDom.addClass( 'remove' );
			
			//------------------------------------------------------------
			//  Store coordinates in relation to original image
			//------------------------------------------------------------
			var cp = self.curHiDom.position();
			var vi = $( '.viewport img', self.elem ).position();
			var x1 = ( cp.left - vi.left ) / self.zoomLev;
			var y1 = ( cp.top - vi.top ) / self.zoomLev;
			var x2 = x1 + self.curHiDom.width() / self.zoomLev;
			var y2 = y1 + self.curHiDom.height() / self.zoomLev;
			
			self.highlights.push({ x1:x1, y1:y1, x2:x2, y2:y2 });
			self.drawHiLiteNav();
			
			//------------------------------------------------------------
			//  Reset the temp highlight
			//------------------------------------------------------------
			self.curHiDom = null;
			_e.preventDefault();
		});
	}
	
	imgspect.prototype.drawHiLiteNav = function() {
		var self = this;
		var hilite = $( document.createElement('div') ).addClass( 'highlight' );
		$( '.navigate', self.elem ).append( hilite );
		
		var hl = self.highlights[ self.highlights.length - 1 ];
		console.log( hl );
		
		hilite.css({
			'left': hl.x1,
			'top': hl.y1,
			'width': hl.x2 - hl.x1,
			'height': hl.y2 - hl.y1
		});
	}
	
	/**
	 * Drag event handler.
	 */
	imgspect.prototype.drag = function( _pPos, _tPos ) {
		var x = _tPos.left - _pPos.left;
		var y = _tPos.top - _pPos.top;
		
		var left = x*-1*this.zoomLev;
		var top = y*-1*this.zoomLev;
				
		$( '.viewport img', this.elem ).css({
			left: left,
			top: top
		});
	}
	
	/**
	 * Drag event handler.
	 */	
	imgspect.prototype.coords = function( _e ) {
		var vp = $( '.viewport', this.elem ).position();		
		var x = _e.clientX - vp.left;
		var y = _e.clientY - vp.top;
		return { 'x':x, 'y':y }
	}
	
	/**
	 * Zoom handler.
	 */	
	imgspect.prototype.zoom = function( _dir ) {
		var self = this;
		switch ( _dir.toUpperCase() ) {
			case 'IN':
				self.zoomLev += .1;
				break;
			case 'OUT':
				self.zoomLev = ( self.zoomLev <= 1 ) ? 1 : self.zoomLev-.1;
				break;
		}
		
		//------------------------------------------------------------
		//  Resize the viewport img
		//------------------------------------------------------------
		var vImg = $( '.viewport img', self.elem );
		vImg.css({
			width: self.origW * self.zoomLev,
			height: self.origH * self.zoomLev
		});
		
		
		//------------------------------------------------------------
		//  TODO Reposition the highlights
		//------------------------------------------------------------
		
		//------------------------------------------------------------
		//  Resize the navigation dragger
		//------------------------------------------------------------
		//------------------------------------------------------------
		//  Get the ratio of the zoomed image to the viewport
		//------------------------------------------------------------
		var wRatio = $( '.viewport', self.elem ).width() / vImg.width();
		wRatio = ( wRatio > 1 ) ? 1 : wRatio;
		
		var hRatio = $( '.viewport', self.elem ).height() / vImg.height();
		hRatio = ( hRatio > 1 ) ? 1 : hRatio;
		
		var navWidth = $( '.navigate img', self.elem ).width();
		var navHeight = $( '.navigate img', self.elem ).height();
		$( '.drag', self.elem ).css({
			width: navWidth*wRatio,
			height: navHeight*hRatio
		});
		
		
	}
	
	imgspect.prototype.zoomIn = function() {
		var self = this;
		self.zoom('IN');
	}
	
	imgspect.prototype.zoomOut = function() {
		var self = this;
		self.zoom('OUT');
	}
	
	imgspect.prototype.addHighlight = function() {
		var self = this;
	}

	//----------------
	//	Extend JQuery 
	//----------------
	jQuery(document).ready( function($) {
		jQuery.fn.imgspect = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new imgspect( this, options, id ) );
			});
		};
	})
})(jQuery);