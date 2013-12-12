/*!
 * imgspect
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The img element you want to inspect
	 *
	 * @param { obj } _options Configuration options
	 *
	 * @param { string } _id The id of the img element 
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
	 * @param { obj } _options Configuration options
	 */
	imgspect.prototype.init = function( _elem, _options ) {
		var self = this;
		
		//------------------------------------------------------------
		// 	User options 
		//------------------------------------------------------------
		self.options = $.extend({
			zoom_unit: .1,
			style: 'basic',
			lite_color: '#FFFF00',
			lite_opacity: .6
		}, _options);
		
		//------------------------------------------------------------
		//  Events
		//------------------------------------------------------------
		self.events = {
			change: 'IMGSPECT-CHANGE',
			undo: 'IMGSPECT-UNDO'
		}
		
		//------------------------------------------------------------
		//  Plugin properties
		//------------------------------------------------------------
		self.lites = [];
		self.zoom_n = 1;
		self.pan = { x:0, y:0 };
		self.c_lite = null;
		
		//------------------------------------------------------------
		//  Original height and width
		//------------------------------------------------------------
		self.orig_w = $( self.elem ).width();
		self.orig_h = $( self.elem ).height();
		
		//------------------------------------------------------------
		//  Nav scaling factor
		//------------------------------------------------------------
		self.nav_scale = 1;
		
		//------------------------------------------------------------
		//	Build the application and get ready for interactivity
		//------------------------------------------------------------
		self.buildDom();
		self.resize();
		self.start();
	}
	
	/**
	 * Build the imgspect DOM elements
	 */
	imgspect.prototype.buildDom = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Wrap the image in the imgspect class.
		//------------------------------------------------------------
		$( self.elem ).wrap( '<div class="imgspect">' );
		self.elem = $( self.elem ).parent();
		
		//------------------------------------------------------------
		//  Add the style class if it is not null
		//------------------------------------------------------------
		if ( self.options['style'] != null ) {
			$( self.elem ).addClass( self.options['style'] );
		}
		
		//------------------------------------------------------------
		//  Create the navigation window aka the 'nav'
		//------------------------------------------------------------
		$( 'img', self.elem ).wrap( '<div class="nav">' );
		
		//------------------------------------------------------------
		//  Create the navigation dragger aka the 'drag'
		//------------------------------------------------------------
		$( '.nav', self.elem ).prepend( '<div class="drag">' );
		
		//------------------------------------------------------------
		//  Create the viewport aka the 'view
		//------------------------------------------------------------
		$( self.elem ).prepend( '<div class="view">' );
		
		//------------------------------------------------------------
		//  Create the drawing area aka the 'drawable image'
		//------------------------------------------------------------
		$( '.view', self.elem ).prepend( '<div class="draw">' );
		
		//------------------------------------------------------------
		//  Set image as drawing area background
		//------------------------------------------------------------
		var src = $( '.nav img', self.elem ).attr('src');
		$( '.draw', self.elem ).css({ 
			'background-image': "url('"+src+"')",
		});
		
		//------------------------------------------------------------
		//  Create the tool buttons
		//------------------------------------------------------------
		$( self.elem ).append( '<div class="tools">' );
		$( '.tools', self.elem ).append( '<a href="#" class="tool zoom in">+</a>' );
		$( '.tools', self.elem ).append( '<a href="#" class="tool zoom out">-</a>' );
		$( '.tools', self.elem ).append( '<a href="#" class="tool undo">&larr;</a>' );
		
		//------------------------------------------------------------
		//  Clear element so no unexpected wrapping occurs
		//------------------------------------------------------------
		$( self.elem ).append( '<div style="clear:both">' );
	}
	
	/**
	 * Resize imgspect
	 */
	imgspect.prototype.resize = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Resize the drawing area
		//------------------------------------------------------------
		self.navResize();
		self.viewResize();
		self.drawResize();
		self.dragResize();
		self.liteResize();
	}
	
	/**
	 * Start imgspect
	 */
	imgspect.prototype.start = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Start event listeners
		//------------------------------------------------------------
		self.zoomStart();
		self.undoStart();
		self.liteStart();
		self.dragStart();
		self.sizeStart();
	}
	
	/**
	 * Listen for undo button click
	 */
	imgspect.prototype.undoStart = function() {
		var self = this;
		$( '.undo', self.elem ).click( function( _e ) {
			self.lites.pop();
			self.liteRedraw();
			$( '.nav .lite:last', self.elem ).remove();
			_e.preventDefault();
		});
	}
	
	/**
	 * Start window resize event listener
	 */
	imgspect.prototype.sizeStart = function() {
		var self = this;
		var timer;
		$(window).resize( function(){
			timer && clearTimeout(timer);
			timer = setTimeout( function(){ self.resize(); }, 100 );
		});
	}
	
	/**
	 * Start the lite mouse event listeners
	 */
	imgspect.prototype.liteStart = function() {
		var self = this;
		
		$( '.view', self.elem ).mousedown( function( _e ) {
			self.c_lite = $( document.createElement('div') ).addClass( 'lite' );
			$( '.draw', self.elem ).append( self.c_lite );
			var dp = $( '.draw', self.elem ).position();
			var mp = self.viewMousePos( _e );
			self.c_lite.css({
				left: mp.x - dp.left,
				top: mp.y - dp.top,
				'background-color': self.options['background-color'],
				opacity: self.options['opacity']
			});
			_e.preventDefault();
		});
		
		$( '.view', self.elem ).mousemove( function( _e ) {
			if ( self.c_lite != null ) {
				var lp = self.c_lite.position();
				var mp = self.viewMousePos( _e );
				var dp = $( '.draw', self.elem ).position();
				self.c_lite.css({
					width: mp.x - lp.left - dp.left,
					height: mp.y - lp.top - dp.top
				});
			}
			
		});
		
		$( '.view', self.elem ).mouseup( function( _e ) {
			//------------------------------------------------------------
			//  Store lite position in relation to original
			//------------------------------------------------------------
			var cp = self.c_lite.position();
			var x1 = cp.left / self.zoom_n;
			var y1 = cp.top / self.zoom_n;
			var x2 = x1 + self.c_lite.width() / self.zoom_n;
			var y2 = y1 + self.c_lite.height() / self.zoom_n;
			self.lites.push({ 
				x1: parseInt(x1),
				y1: parseInt(y1),
				x2: parseInt(x2),
				y2: parseInt(y2),
				zoom: self.zoom_n,
				color: self.options['lite_color'],
				opacity: self.options['lite_opacity'],
				id: self.lites.length
			});
			
			console.log( self.lites );
			
			//------------------------------------------------------------
			//  Draw the lite on the nav image.
			//  ( Make this optional with a config option? )
			//------------------------------------------------------------
			self.liteDrawNav();
			
			//------------------------------------------------------------
			//  Reset current lite
			//------------------------------------------------------------
			self.c_lite = null;
			
			//------------------------------------------------------------
			//  Let the world know the app state has changed
			//------------------------------------------------------------
			$( self.elem ).trigger( self.events['change'] );
			
			_e.preventDefault();
		});
	}
	
	/**
	 * Build the DOM element for a lite
	 *
	 * @return { jQuery } A jQuery DOM element handle
	 */
	imgspect.prototype.liteDom = function() {
		return $( document.createElement('div') ).addClass( 'lite' );
	}
	
	/**
	 * Build the imgspect DOM elements
	 */
	imgspect.prototype.liteDrawNav = function() {
		var self = this;
		var lite = self.liteDom();
		var nav = $( '.nav', self.elem );
		nav.append( lite );
		var np = nav.position();
		var lp = self.liteLast();
		lite.css({
			left: lp.x1 / self.nav_scale + np.left,
			top: lp.y1 / self.nav_scale + np.top,
			width: lp.x2 / self.nav_scale - lp.x1 / self.nav_scale,
			height: lp.y2 / self.nav_scale - lp.y1 / self.nav_scale,
			'background-color': lp.color,
			opacity: lp.opacity
		});
	}
	
	/**
	 * Returns the last lite
	 *
	 * @ return { lite } A lite object
	 */
	imgspect.prototype.liteLast = function() {
		return this.lites[ this.lites.length - 1 ];
	}
	
	/**
	 * Resize the lites
	 */
	imgspect.prototype.liteResize = function() {
		this.liteRedraw();
	}
	
	/**
	 * Move the dragger so the selected lite is displayed
	 * in the center of draw area
	 *
	 * @ param { int } _id The lite id
	 */
	imgspect.prototype.liteShow = function( _id ) {
		var self = this;
		var lite = self.lites[ _id ];
		
		//------------------------------------------------------------
		//  Start by finding the center of the lite
		//------------------------------------------------------------
		var x = lite.x1 + ( lite.x2 - lite.x1 )/2;
		var y = lite.y1 + ( lite.y2 - lite.y1 )/2;
		
		//------------------------------------------------------------
		//  Then subtract half the view area taking zoom level
		//  into consideration to center the lite
		//------------------------------------------------------------
		x = x - ( $( '.view', self.elem ).width()/2 )/self.zoom_n;
		y = y - ( $( '.view', self.elem ).height()/2 )/self.zoom_n;
		
		//------------------------------------------------------------
		//  But you also have to make sure you aren't moving beyond
		//  the edges of the image... Maybe not...
		//  I'm not convinced this is best.  If people complain
		//  here's where you can constrain the coordinates.
		//------------------------------------------------------------

		self.goTo( x, y );
	}
	
	/**
	 * Redraw the lites
	 */
	imgspect.prototype.liteRedraw = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Clear the existing lites
		//------------------------------------------------------------
		$( '.draw .lite', self.elem ).remove();
		
		//------------------------------------------------------------
		//  Redraw at different dimensions
		//------------------------------------------------------------
		var dp = $( '.draw', self.elem ).position();
		for ( var i in self.lites ) {
			var lite = self.liteDom();
			$( '.draw' ).append( lite );
			lite.css({
				left: self.lites[i].x1 * self.zoom_n,
				top: self.lites[i].y1 * self.zoom_n,
				width: ( self.lites[i].x2 - self.lites[i].x1 ) * self.zoom_n,
				height: ( self.lites[i].y2 - self.lites[i].y1 ) * self.zoom_n,
			});
		}
	}
	
	/**
	 * Start the zoom event listeners
	 */
	imgspect.prototype.zoomStart = function() {
		var self = this;
		$( '.zoom', self.elem ).click( function( _e ) {
			if ( $(this).hasClass('in') ) {
				self.zoomIn();
			}
			else {
				self.zoomOut();
			}
			_e.preventDefault();
		});
	}
	
	/**
	 * Make drawable image larger
	 */
	imgspect.prototype.zoomIn = function() {
		var self = this;
		self.zoom('IN');
	}

	/**
	 * Make drawable image smaller
	 */
	imgspect.prototype.zoomOut = function() {
		var self = this;
		self.zoom('OUT');
	}
	
	/**
	 * Scale drawable image
	 *
	 * @param { string } _dir Either 'IN' or 'OUT'
	 */
	imgspect.prototype.zoom = function( _dir ) {
		var self = this;
		switch( _dir.toUpperCase() ) {
			case 'IN':
				self.zoom_n += self.options['zoom_unit'];
				break;
			case 'OUT':
				self.zoom_n = ( self.zoom_n <= 1 ) ? 1 : self.zoom_n-self.options['zoom_unit'];
				break;
		}
		
		//------------------------------------------------------------
		//  Resize draw window & nav drag
		//------------------------------------------------------------
		self.resize();
	}
	
	/**
	 * Start drag listener
	 */
	imgspect.prototype.dragStart = function() {
		var self = this;
		
		$( '.drag', self.elem ).draggable({
			containment: 'parent',
			scroll: false,
			drag: function() {
				var nav_pos = $( '.nav', this.elem ).position();
				var drag_pos = $( '.drag', this.elem ).position();
				self.dragHandler( nav_pos, drag_pos );
			}
		});
		
		//------------------------------------------------------------
		//  Set the dragger to the nav's origin
		//------------------------------------------------------------
		var nav_pos = $( '.nav', this.elem ).position();
		$( '.drag', self.elem ).css({
			left: nav_pos.left,
			top: nav_pos.top
		});
	}
	
	/**
	 * Moves the drawable image when the nav drag is moved
	 *
	 * @param { object } _nav_pos nav window position
	 * @param { object } _drag_pos drag position
	 */
	imgspect.prototype.dragHandler = function( _nav_pos, _drag_pos ) {
		var self = this;
		var x = _drag_pos.left - _nav_pos.left;
		var y = _drag_pos.top - _nav_pos.top;
		var left = x * -1 * self.zoom_n * self.nav_scale;
		var top = y * -1 * self.zoom_n * self.nav_scale;
		self.drawMove( left, top );
	}
	
	/**
	 * Positions the view origin to the passed coordinates.
	 * AKA it GOES to the coordinates.
	 *
	 * @param { float } _x x coordinate
	 * @param { float } _y y coordinate
	 * @param { float } _sec number of seconds the dragger movement takes
	 */
	imgspect.prototype.goTo = function( _x, _y, _sec ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Set defaults
		//------------------------------------------------------------
		_x = ( _x == undefined ) ? 0 : _x;
		_y = ( _y == undefined ) ? 0 : _y;
		_sec = ( _sec == undefined ) ? .5 : _sec;
		
		//------------------------------------------------------------
		//  Start the drag animation
		//------------------------------------------------------------
		var nav_pos = $( '.nav', this.elem ).position();
		$( '.drag', self.elem ).animate({
			left: _x / self.nav_scale + nav_pos.left,
			top: _y / self.nav_scale + nav_pos.top
		},
		{
			duration: _sec * 1000, // to milliseconds
			
			//------------------------------------------------------------
			//  Reuse the drag handler function...
			//------------------------------------------------------------
			step: function() {
				var drag_pos = $( '.drag', this.elem ).position();
				self.dragHandler( nav_pos, drag_pos );
			}
		});
	}
	
	/**
	 * Resize drag window
	 */
	imgspect.prototype.dragResize = function() {
		var self = this;
		var view = $( '.view', self.elem );
		var draw = $( '.draw', self.elem );
		
		var w_ratio = view.width() / draw.width();
		w_ratio = ( w_ratio > 1 ) ? 1 : w_ratio;
		
		var h_ratio = view.height() / draw.height();
		h_ratio = ( h_ratio > 1 ) ? 1 : h_ratio;
		
		var img = $( '.nav img', self.elem );
		$( '.drag', self.elem ).css({
			width: img.width() * w_ratio,
			height: img.height() * h_ratio
		});
	}
	
	/**
	 * Move the drawable image
	 *
	 * @param { float } _left new left css parameter
	 * @param { float } _top new top css parameter
	 */
	imgspect.prototype.drawMove = function( _left, _top ) {
		$( '.draw', this.elem ).css({
			left: _left,
			top: _top
		});
	}
	
	/**
	 * Resize drawable window when zoomed
	 */
	imgspect.prototype.drawResize = function() {
		var self = this;
		$( '.draw', self.elem ).css({
			width: self.orig_w * self.zoom_n,
			height: self.orig_h * self.zoom_n
		});
		
		//------------------------------------------------------------
		//  Call the dragHandler method to move.
		//  You have to pass the nav and drag position before calling.
		//
		//  Sorry it's clunky but the jQuery position() method 
		//  call is costly.
		//------------------------------------------------------------
		var nav_pos = $( '.nav', self.elem ).position();
		var drag_pos = $( '.drag', self.elem ).position();
		self.dragHandler( nav_pos, drag_pos );
	}
	
	/**
	 *  Resize the nav img and set the nav_scaling factor
	 */
	imgspect.prototype.navResize = function() {
		var self = this;
		var width = $( '.nav', self.elem ).width();
		self.nav_scale = self.orig_w / width;
		$( '.nav img', self.elem ).css({
			width: width
		});
	}
	
	/**
	 *  Resize the view element to fit the empty space
	 */
	imgspect.prototype.viewResize = function() {
		var self = this;
		var app_width = $( self.elem ).width();
		$( '.view', self.elem ).css({
			width: app_width
		});
	}
	
	/**
	 * Retrieve the mouse position in relation to the view
	 *
	 * @param { Event } _e the mouse event object
	 */
	imgspect.prototype.viewMousePos = function( _e ) {
		var vp = $( '.view', this.elem ).position();
		var x = _e.clientX - vp.left;
		var y = _e.clientY - vp.top + $(window).scrollTop();
		return { 'x':x, 'y':y }
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