/*!
 * imgspect
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The img element you want to inspect
	 * @param { obj } _options Configuration options
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
	 * @param { obj } _options Configuration options
	 */
	imgspect.prototype.init = function( _elem, _options ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Lite colors
		//------------------------------------------------------------
		self.colors = {
			'YELLOW': '#FFFF00',
			'MAGENTA': '#FF00FF',
			'CYAN': '#00FFFF'
		}
		
		//------------------------------------------------------------
		// 	User options 
		//------------------------------------------------------------
		self.options = $.extend({
			zoom_unit: .1,
			lite_color: new Culuh( self.colors['YELLOW'] ),
			lite_opacity: .4,
			secs: .5, // default number of seconds it takes for goTo() animations
			load: null, // object to load at startup to build lites and imgbits
			info: null
		}, _options);
		
		//------------------------------------------------------------
		//  Events
		//------------------------------------------------------------
		self.events = {
			change: 'IMGSPECT-CHANGE',
			undo: 'IMGSPECT-UNDO',
			error: 'IMGSPECT-ERROR',
			update: 'IMGSPECT-UPDATE',
			ready: 'IMGSPECT-READY'
		}
		
		//------------------------------------------------------------
		//  Plugin properties
		//------------------------------------------------------------
		self.lites = [];
		self.imgbits = [];
		self.zoom_n = 1;
		self.zoom_shift = null;
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
		//  Will store the source of the img
		//------------------------------------------------------------
		self.src = null;
		
		//------------------------------------------------------------
		//	Build the application and get ready for interactivity
		//------------------------------------------------------------
		self.build();
		self.resize();
		
		//------------------------------------------------------------
		//  Create the output window after the nav resize
		//------------------------------------------------------------
		self.outputBuild();
		self.start();
		
		//------------------------------------------------------------
		//  If a load parameter is passed to the constructor then
		//  load it.
		//------------------------------------------------------------
		if ( self.options['load'] != null ) {
			self.load( self.options['load'] );
		}
		
		//------------------------------------------------------------
		//  Let everything listening know imgspect is ready
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['ready'] );
	}
	/**
	 * Return a jsonLD object
	 */
	imgspect.prototype.toJsonLD = function() {
		var self = this;
		var jsonLD = [];
		for ( var i=0, ii=self.imgbits.length; i<ii; i++ ) {
			jsonLD[i] = self.imgbits[i].toJsonLD( self.options['info'] );
		}
		return jsonLD;
	}
	
	/**
	 * Dump an imgspect object to the console
	 */	
	imgspect.prototype.dump = function() {
		console.log( this );
	}
	
	/**
	 * Build the imgspect DOM elements
	 */
	imgspect.prototype.build = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Wrap the image in the imgspect class.
		//------------------------------------------------------------
		$( self.elem ).wrap( '<div class="imgspect">' );
		self.elem = $( self.elem ).parent();
		
		//------------------------------------------------------------
		//  Create the navigation window aka the 'nav'
		//------------------------------------------------------------
		$( 'img', self.elem ).wrap( '<div class="nav">' );
		
		//------------------------------------------------------------
		//  Create the navigation dragger aka the 'drag'
		//------------------------------------------------------------
		$( '.nav', self.elem ).prepend( '<div class="drag">' );
		
		//------------------------------------------------------------
		//  Wrap containers so nav and tools can be center aligned
		//------------------------------------------------------------
		$( '.nav', self.elem ).wrap( '<div class="ui">' );
		$( '.ui', self.elem ).wrap( '<div class="center">' );
		
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
		self.src = $( '.nav img', self.elem ).attr('src');
		$( '.draw', self.elem ).css({ 
			'background-image': "url('"+self.src+"')"
		});
		
		//------------------------------------------------------------
		//  Create the tool buttons
		//------------------------------------------------------------
		self.toolsBuild();
		
		//------------------------------------------------------------
		//  Create the dropdown
		//------------------------------------------------------------
		self.dropBuild();
		
		//------------------------------------------------------------
		//  Clear element so no unexpected wrapping occurs
		//------------------------------------------------------------
		$( self.elem ).append( '<div style="clear:both">' );
	}
	
	/**
	 * Add the DOM elements that make up the tools
	 */
	imgspect.prototype.toolsBuild = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Build the tool area
		//------------------------------------------------------------
		$( '.ui', self.elem ).append( '<div class="tools">' );
		
		//------------------------------------------------------------
		//  Create the zoom buttons
		//------------------------------------------------------------
		$( '.tools', self.elem ).append('\
				<a href="#" class="tool zoom in">+</a>\
				<a href="#" class="tool zoom out">-</a>\
		 ');
		
		//------------------------------------------------------------
		//  Build the color
		//------------------------------------------------------------
		$( '.tools', self.elem ).append( '<div class="colors">' );
		for ( var i in self.colors ) {
			var name = i.toLowerCase();
			$( '.colors', self.elem ).append( '<a href="#" class="tool color '+ name + '">&nbsp;<a>' );
			$( '.color.'+name, self.elem ).css({
				'background-color': self.colors[i]
			});
		}
		$( '.tools', self.elem ).append( '<a href="#" class="tool undo">&larr;</a>' );
		$( '.tools', self.elem ).append( '<div style="clear:both">' );
	}
	
	/**
	 * Build the dropdown
	 */	
	imgspect.prototype.dropBuild = function() {
		var self = this;
		var drop = '\
			<div id="drop">\
				<div class="sortBits">\
					<a href="" id="time" class="sort">Time</a>\
					<a href="" id="space" class="sort">Space</a>\
				</div>\
				<div class="imgbits"></div>\
			</div>';
		$( self.elem ).before( drop.smoosh() );
		self.drop = $( '#drop' ).menumucil({ 
			cover: true,
			closed: '&#9660',
			open: '&#9650'
		 }).data( '#drop' );
		self.dropStart();
	}
	
	/**
	 * Update the dropdown counter
	 */	
	imgspect.prototype.dropCount = function() {
		var self = this;
		var count = self.lites.length;
		$( '#drop .extra' ).text( count );
	}
	
	/**
	 * Start the dropdown listener
	 */	
	imgspect.prototype.dropStart = function() {
		var self = this;
		$( self.elem ).on( self.events['change'], function( _e ) {
			var id = self.liteLast().id;
			self.imgbitAdd( id );
			self.dropCount();
		});
		
		//------------------------------------------------------------
		//  Sort listeners
		//------------------------------------------------------------
		$( '#drop .sort' ).click( function( _e ) {
			_e.preventDefault();
			var type = $( this ).attr('id');
			self.imgbitsSort( type );
		})
	}
	
	/**
	 * Add an imgbit to the drop-down
	 *
	 * @param { int } _id Lite id
	 */	
	imgspect.prototype.imgbitAdd = function( _id ) {
		var self = this;
		var imgbit = self.liteToImgbit( _id );
		$( '#drop .imgbits' ).append( imgbit );
		
		//------------------------------------------------------------
		//  Start the imgbit and store a reference to it
		//------------------------------------------------------------
		var id = '#drop #imgbit-'+_id;
		self.imgbits.push( $( id ).imgbit().data( id ) );
		self.imgbitStart( _id );
	}
	
	/**
	 * Sort the imgbits in the drop-down menu.
	 *
	 * @param { string } _method string time, space
	 */
	imgspect.prototype.imgbitsSort = function( _method ) {
		var self = this;
		_method = ( _method == undefined ) ? 'time' : _method
		
		//------------------------------------------------------------
		//  Sort the imgbits
		//------------------------------------------------------------
		var timeStamp = new TimeStamp();
		var out = [];
		switch ( _method ) {
			case 'time':
				for ( var i=0, ii=self.imgbits.length; i<ii; i++ ) {
					var timeCreated = self.imgbits[i].timeCreated;
					var time = timeStamp.toUnix( timeCreated );
				}
				break;
			case 'space':
				var sorted = new Sorted();
				var imgbits = sorted.areaSort( self.imgbits, "param.x1", "param.y1", "param.y2" );
				break;
		}
	}
	
	/**
	 * Remove an imgbit from the DOM
	 *
	 * @param { int } _id imgbit id
	 * @param { bool } _imgbit Remove imgbit from the DOM
	 */
	imgspect.prototype.imgbitRemove = function( _id, _imgbit ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.imgbits.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
		self.imgbits[_id].remove();
		var imgbit = self.imgbits.splice( _id, 1 );
		
		//------------------------------------------------------------
		//  Reshuffle ids
		//------------------------------------------------------------
		for ( var i=0, ii=self.imgbits.length; i<ii; i++ ) {
			self.imgbits[i].idUpdate( 'imgbit-'+i );
			
			//------------------------------------------------------------
			//  Remove the listeners
			//------------------------------------------------------------
			self.imgbits[i].elem.off( 'IMGBIT-CHANGE' );
			self.imgbits[i].elem.off( 'IMGBIT-CLOSED' );
			
			//------------------------------------------------------------
			//  Reset the listeners
			//------------------------------------------------------------
			self.imgbitStart( i );
		}
				
		//------------------------------------------------------------
		//  Update the count
		//------------------------------------------------------------
		self.dropCount();
	}
	
	/**
	 * Start imgbit event listeners
	 *
	 * @param { int } _id Lite id
	 */
	imgspect.prototype.imgbitStart = function( _id ) {
		var self = this;
		//------------------------------------------------------------
		//  Clicking an imgbit will take you to its position in
		//  the original image.
		//------------------------------------------------------------
		$( '#drop #imgbit-'+_id+' .view' ).click( function( _e ) {
			self.drop.close();
			var id = $(this).parent().attr('id');
			var i = parseInt( id.replace( 'imgbit-', '') );
			//------------------------------------------------------------
			//  Wait a bit before moving
			//------------------------------------------------------------
			setTimeout( function() {
				self.liteShow( i );
			}, 500 );
			_e.preventDefault();
		});
		
		//------------------------------------------------------------
		//  Listen for any changes
		//------------------------------------------------------------
		$( '#drop #imgbit-'+_id ).on( 'IMGBIT-CHANGE', function() {
			self.outputUpdate();
		});
		
		//------------------------------------------------------------
		//  Listen for remove click
		//------------------------------------------------------------
		$( '#drop #imgbit-'+_id ).on( 'IMGBIT-CLOSED', function() {
			self.liteRemove( _id );
		});
	}

	/**
	 * Build the output area
	 */
	imgspect.prototype.outputBuild = function() {
		var self = this;
		$( '.tools', self.elem ).append( '<textarea readonly="readonly" id="imgspectOut" class="output"></textarea>' );
		$( '.output', self.elem ).css({
			'max-height': $( '.nav', self.elem ).innerHeight() - $( '.tool', self.elem ).outerHeight()
		});
		self.outputInitText();
	}
	
	/**
	 * Initial preformatted text for the output area
	 */
	imgspect.prototype.outputInitText = function() {
		var self = this;
		var output = '\
WELCOME TO IMGSPECT \n\
------------------- \n\
Imgspect is a tool for captioning or transcribing select areas of large images.\n\n\
Unique identifiers for your captioned areas will be written to this output window once you begin. \n\n\
\n\
HOW TO USE IMGSPECT \n\
------------------- \n\
Drag the see-through white rectangle over the area of the smaller image you want to inspect. \n\n\
Click and drag your mouse over the larger image to highlight areas you\'re interested in. \n\n\
Click the color squares to change the highlight color. \n\n\
Click the plus and minus buttons to zoom the larger image in and out. \n\n\
Click the back-arrow to remove the last highlight. \n\n\
Click the triangle to open a drop-down of just your highlighted areas. \n\n\
In the drop-down view click the hash tag to caption or transcribe the highlighted area.\n\n\
In the drop-down view click an img to find its original position in the larger image.\n\n\
';
		$( '.output', self.elem ).val( output.trim() );
	}
	
	/**
	 * Update the output area
	 */
	imgspect.prototype.outputUpdate = function() {
		var self = this;
		$( '.output', self.elem ).val('');
		var output = '';
		//------------------------------------------------------------
		//  Loop through all the imgbits and return their HTML
		//------------------------------------------------------------
		for ( var i=0, ii=self.imgbits.length; i<ii; i++ ) {
			output += self.imgbits[i].html() + "\n";
		}
		$( '.output', self.elem ).val( output );
		$( self.elem ).trigger( self.events['update'] );
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
		
		//------------------------------------------------------------
		//  TODO: dragger move with window resize.
		//------------------------------------------------------------
		var dleft = $( '.nav .drag' ).offset().left;
		var nleft = $( '.nav' ).offset().left;
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
		self.colorStart();
	}
	
	/**
	 * Start the color
	 */
	imgspect.prototype.colorStart = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Select the first color
		//------------------------------------------------------------
		var first = $( '.color:first', self.elem );
		first.addClass( 'selected' );
		
		//------------------------------------------------------------
		//  Select the clicked color
		//------------------------------------------------------------
		$( '.color', self.elem ).click( function( _e ) {
			$( '.color', self.elem ).removeClass( 'selected' );
			$( this ).addClass( 'selected' );
			self.liteColor( $( this ).css('background-color') );
			_e.preventDefault();
		});
	}
	
	/**
	 * Listen for undo button click
	 */
	imgspect.prototype.undoStart = function() {
		var self = this;
		$( '.undo', self.elem ).click( function( _e ) {
			//------------------------------------------------------------
			//  Remove the last lite
			//------------------------------------------------------------
			var id = self.lites.length - 1;
			self.liteRemove( id );
			
			//------------------------------------------------------------
			//  Let the world know what's happened here.
			//------------------------------------------------------------
			_e.preventDefault();
		});
	}
	
	/**
	 * Remove a lite
	 *
	 * @param { int } _id Lite id
	 */	
	imgspect.prototype.liteRemove = function( _id ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.imgbits.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
		//------------------------------------------------------------
		//  Remove the lite
		//------------------------------------------------------------
		var lite = self.lites.splice( _id, 1 );
		
		//------------------------------------------------------------
		//  Remove the imgbit
		//------------------------------------------------------------
		self.imgbitRemove( _id );
		
		//------------------------------------------------------------
		//  Redraw the lites
		//------------------------------------------------------------
		self.liteRedraw();
		
		//------------------------------------------------------------
		//  Update the lite preview
		//------------------------------------------------------------
		$( '.nav .lite:eq('+_id+')', self.elem ).remove();
		
		//------------------------------------------------------------
		//  Let the world know what happened here.
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['undo'], { id: lite.id } );
		
		//------------------------------------------------------------
		//  Update the output window
		//------------------------------------------------------------
		self.outputUpdate();
	}
	
	/**
	 * Start window resize event listener
	 */
	imgspect.prototype.sizeStart = function() {
		var self = this;
		var timer;
		$(window).resize( function(){
			timer && clearTimeout(timer);
			timer = setTimeout( function(){ self.resize(); }, 50 );
		});
	}
	
	/**
	 * Draw area mouse-down listener
	 */
	imgspect.prototype.drawMouseDown = function( _e ) {
		var self = this;
		//------------------------------------------------------------
		//  Create a new lite
		//------------------------------------------------------------
		self.c_lite = $( document.createElement('div') ).addClass( 'lite' );
		$( '.draw', self.elem ).append( self.c_lite );
		
		//------------------------------------------------------------
		//  Get the mouse and draw position
		//------------------------------------------------------------
		var mp = self.viewMousePos( _e );
		var dp = $( '.draw', self.elem ).position();
		
		//------------------------------------------------------------
		//  Stash the current coordinates in 'img' space
		//------------------------------------------------------------
		self.c_pos = {
			left: mp.left - dp.left,
			top: mp.top - dp.top
		};
		
		//------------------------------------------------------------
		//  Start drawing the highlight
		//------------------------------------------------------------
		self.c_lite.css({
			left: self.c_pos.left,
			top: self.c_pos.top,
			'background-color': '#'+self.options['lite_color'].hex(),
			opacity: self.options['lite_opacity']
		});
	}
	
	/**
	 * Draw area mouse-move listener
	 */
	imgspect.prototype.drawMouseMove = function( _e ) {
		var self = this;
		if ( self.c_lite != null ) {
			var cp = self.c_pos;
			var mp = self.viewMousePos( _e );
			var dp = $( '.draw', self.elem ).position();
			
			//------------------------------------------------------------
			//  Get mouse position coordinates in 'img' space
			//------------------------------------------------------------
			mp.left -= dp.left;
			mp.top -= dp.top;
			
			//------------------------------------------------------------
			//  This logic controls left-handed highlight support.
			//  The origin of the highlight will change to the mouse's
			//  current position if it's less than the original click
			//  position.
			//------------------------------------------------------------
			if ( cp.left > mp.left ) {
				self.c_lite.css({
					left: mp.left,
					width: cp.left - mp.left
				});
			}
			else {
				self.c_lite.css({
					left: cp.left,
					width: mp.left - cp.left
				});
			}
			if ( cp.top > mp.top ) {
				self.c_lite.css({
					top: mp.top,
					height: cp.top - mp.top
				});
			}
			else {
				self.c_lite.css({
					top: cp.top,
					height: mp.top - cp.top
				});
			}
		}
	}
	
	/**
	 * Draw area mouse-up listener
	 */
	imgspect.prototype.drawMouseUp = function( _e ) {
		var self = this;
		if ( self.c_lite == null ) {
			return;
		}
		//------------------------------------------------------------
		//  Check to see if the current lite is not just 
		//  a trivial mouse slip up.
		//------------------------------------------------------------
		if ( self.c_lite.width() == 0 || self.c_lite.height() == 0 ) {
			self.c_lite = null;
			return;
		}
		//------------------------------------------------------------
		//  Store lite position in relation to original
		//------------------------------------------------------------
		var cp = self.c_lite.position();
		var x1 = cp.left / self.zoom_n;
		var y1 = cp.top / self.zoom_n;
		var x2 = x1 + self.c_lite.width() / self.zoom_n;
		var y2 = y1 + self.c_lite.height() / self.zoom_n;
		self.liteAdd( x1, y1, x2, y2 );
	}
	
	/**
	 * Start the lite mouse event listeners
	 */
	imgspect.prototype.liteStart = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Mouse Down
		//------------------------------------------------------------
		$( '.view', self.elem ).mousedown( function( _e ) {
			_e.preventDefault();
			self.drawMouseDown( _e );
		});
		$( '.view', self.elem ).bind('touchstart', function( _e ) {
			_e.preventDefault();
			self.drawMouseDown( _e );
		});
		
		//------------------------------------------------------------
		//  Mouse Move
		//------------------------------------------------------------
		$( '.view', self.elem ).mousemove( function( _e ) {
			_e.preventDefault();
			self.drawMouseMove( _e );
		});
		$( '.view', self.elem ).bind( 'touchmove', function( _e ) {
			_e.preventDefault();
			self.drawMouseMove( _e );
		})
		
		//------------------------------------------------------------
		//  Mouse Up
		//------------------------------------------------------------
		$( self.elem ).mouseup( function( _e ) {
			_e.preventDefault();
			self.drawMouseUp( _e );
		});
		$( self.elem ).bind( 'touchend', function( _e ) {
			_e.preventDefault();
			self.drawMouseUp( _e );
		})
	}
	
	/**
	 * Add a lite
	 */
	imgspect.prototype.liteAdd = function( _x1, _y1, _x2, _y2 ) {
		var self = this;
		//------------------------------------------------------------
		//  Stash that lite
		//------------------------------------------------------------
		self.lites.push({ 
			x1: parseInt( _x1 ),
			y1: parseInt( _y1 ),
			x2: parseInt( _x2 ),
			y2: parseInt( _y2 ),
			zoom: self.zoom_n,
			color: self.options['lite_color'],
			opacity: self.options['lite_opacity'],
			id: self.lites.length
		});
		
		//------------------------------------------------------------
		//  Draw the lite on the nav image.
		//  ( Make this optional with a config option? )
		//------------------------------------------------------------
		self.navLiteDraw( self.liteLast().id );
		
		//------------------------------------------------------------
		//  Reset current lite
		//------------------------------------------------------------
		self.c_lite = null;
		self.c_pos = null;
		
		//------------------------------------------------------------
		//  Let the world know the app state has changed
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['change'] );
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
	 * Draw a lite in the nav
	 *
	 * @param { int } _id Lite id
	 */
	imgspect.prototype.navLiteDraw = function( _id ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.lites.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
		var lite = self.liteDom();
		var nav = $( '.nav', self.elem );
		nav.append( lite );
		var np = nav.position();
		var lp = self.lites[_id];
		lite.css({
			left: lp.x1 / self.nav_scale + np.left,
			top: lp.y1 / self.nav_scale + np.top,
			width: lp.x2 / self.nav_scale - lp.x1 / self.nav_scale,
			height: lp.y2 / self.nav_scale - lp.y1 / self.nav_scale,
			'background-color': '#'+lp.color.hex(),
			opacity: lp.opacity
		});
	}
	
	/**
	 * Returns the last lite
	 *
	 * @ return { lite } A lite object
	 */
	imgspect.prototype.liteLast = function() {
		return this.lites[ this.lites.length-1 ];
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
		
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.lites.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
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
		for ( var i=0, ii=self.lites.length; i<ii; i++ ) {
			var lite = self.liteDom();
			$( '.draw' ).append( lite );
			lite.css({
				left: self.lites[i].x1 * self.zoom_n,
				top: self.lites[i].y1 * self.zoom_n,
				width: ( self.lites[i].x2 - self.lites[i].x1 ) * self.zoom_n,
				height: ( self.lites[i].y2 - self.lites[i].y1 ) * self.zoom_n,
				'background-color': '#'+self.lites[i].color.hex(),
				opacity: self.lites[i].opacity
			});
		}
	}
	
	/**
	*  Remove all lites preview from the nav
	*/
	imgspect.prototype.navLiteClear = function() {
		var self = this;
		$( '.nav .lite', self.elem ).remove();
	}
	
	/**
	*  Remove all lites preview from the nav
	*/
	imgspect.prototype.navLiteRedraw = function() {
		var self = this;
		self.navLiteClear();
		for ( var i=0, ii=self.lites.length; i<ii; i++ ) {
			self.navLiteDraw( i );
		}
	}
	
	/**
	 * Change the color of future lites
	 *
	 * @param { string } _color CMYK name as defined in self.colors
	 *						    OR a hex color value
	 */
	imgspect.prototype.liteColor = function( _color ) {
		var self = this;
		_color = _color.toUpperCase();
		if ( _color in self.colors ) {
			self.options['lite_color'] = new Culuh( self.colors[ _color ] );
		}
		else {
			self.options['lite_color'] = new Culuh( _color );
		}
	}
	
	/**
	 * Turn a lite into an imgbit
	 *
	 * @param { int } _id Lite id
	 */
	imgspect.prototype.liteToImgbit = function( _id ) {
		var self = this;
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.lites.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
		var lite = self.lites[_id];
		
		var color = lite.color;
		var questAnd = ( self.src.indexOf('?') == -1 ) ? '?' : '&'
		var tag = '<a id="imgbit-'+_id+'" class="imgbit edit closable" href="'+self.src+'\
				'+questAnd+'imgbit=\
				x1='+lite.x1+'\
				%y1='+lite.y1+'\
				%x2='+lite.x2+'\
				%y2='+lite.y2+'\
				%c='+color.sat( 0.5, true ).hex()+'\
				">#</a>';
		return tag.smoosh();
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
		var old_zoom = self.zoom_n;
		switch( _dir.toUpperCase() ) {
			case 'IN':
				self.zoom_n += self.options['zoom_unit'];
				break;
			case 'OUT':
				self.zoom_n -= self.options['zoom_unit'];
				break;
		}
		
		//------------------------------------------------------------
		//  Calculate zoom shift
		//------------------------------------------------------------
		var top = $( '.draw', self.elem ).position().top;
		var left = $( '.draw', self.elem ).position().left;
		top = top / old_zoom - top / self.zoom_n;
		left = left / old_zoom - left / self.zoom_n;
		self.zoom_shift = { top: top, left: left };
		
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
				self.drawResize();
			}
		});
		
		//------------------------------------------------------------
		//  Set the dragger to the nav's origin
		//------------------------------------------------------------
		var nav_pos = $( '.nav', this.elem ).offset();
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
		var width = img.width() * w_ratio; 
		var height = img.height() * h_ratio;
		$( '.drag', self.elem ).css({
			width: width,
			height: height
		});
		
		/*
		//------------------------------------------------------------
		//  Calculate zoom shift
		//------------------------------------------------------------
		if ( self.zoom_shift != null ) {
			var pos = $( '.draw', self.elem ).position();
			//------------------------------------------------------------
			//  Find the of the view
			//------------------------------------------------------------
			var sh = ( view.height()/2 ) * self.zoom_n;
			var sw = ( view.width()/2 ) * self.zoom_n;
			console.log( 'sh = ' + sh );
			console.log( 'sw = ' + sw );
			var top = Math.abs( Math.ceil( pos.top/self.zoom_n )) - sh;
			var left = Math.abs( Math.ceil( pos.left/self.zoom_n )) - sw;
			self.goTo( left, top, 0 );
		}
		*/
		self.zoom_shift = null;
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
		var height = $( '.nav', self.elem ).height();
		self.nav_scale = self.orig_h / height;
		$( '.nav img', self.elem ).css({
			height: height
		});
		self.navLiteRedraw();
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
		var x = ( _e.clientX != undefined ) ? _e.clientX : _e.originalEvent.pageX;
		var y = ( _e.clientY != undefined ) ? _e.clientY : _e.originalEvent.pageY;
		var left = x - vp.left;
		var top = y - vp.top + $(window).scrollTop();
		return { 'left':left, 'top':top }
	}
	
	/**
	 * Positions the view origin to the passed coordinates.
	 * AKA it GOES to the coordinates.
	 *
	 * It will center the coordinates within the dragger but
	 * constrain the edges of the dragger to the nav box
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
		_sec = ( _sec == undefined ) ? self.options['secs'] : _sec;
		
		//------------------------------------------------------------
		//  Start the drag animation
		//------------------------------------------------------------
		var nav_pos = $( '.nav', this.elem ).position();
		var nav_width = $( '.nav', this.elem ).width();
		var nav_height = $( '.nav', this.elem ).height();
		var drag_width = $( '.drag', this.elem ).width();
		var drag_height = $( '.drag', this.elem ).height();
		
		var left = _x / self.nav_scale + nav_pos.left;
		var top = _y / self.nav_scale + nav_pos.top;
		
		//------------------------------------------------------------
		//  Constrain the dragger
		//------------------------------------------------------------		
		left = ( left < nav_pos.left ) ? nav_pos.left : left;
		top = ( top < nav_pos.top ) ? nav_pos.top : top;
		var drag_max_x = nav_pos.left + nav_width - drag_width;
		var drag_max_y = nav_pos.top + nav_height - drag_height;
		left = ( left > drag_max_x ) ? drag_max_x : left;
		top = ( top > drag_max_y ) ? drag_max_y : top;
		
		//------------------------------------------------------------
		//  Start the drag animation
		//------------------------------------------------------------
		$( '.drag', self.elem ).animate({
			left: left,
			top: top
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
	 * Load an imgspect object TODO
	 */	
	imgspect.prototype.load = function( _obj ) {
		var self = this;
	}
	
	/**
	 * Export an imgspect object TODO
	 */	
	imgspect.prototype.export = function() {
		var self = this;
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
/*!
 * imgbit
 *
 * The format of the <a> tag needed by imgbit
 * <a href="path.to/your/img.jpg?imgbit=x1=0%y1=0%x2=100%y2=100">Display text or markup!</a>
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The <a> tag holding your urn and display text.
	 * @param { obj } _options Configuration options
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
	 * @param { obj } _options Configuration options
	 */
	imgbit.prototype.init = function( _elem, _options ) {
		var self = this;
		
		//------------------------------------------------------------
		// 	User options 
		//------------------------------------------------------------
		self.options = $.extend({
			style: 'full',
			closable: false
		}, _options);
		
		//------------------------------------------------------------
		//  Events
		//------------------------------------------------------------
		self.events = {
			change: 'IMGBIT-CHANGE',
			closed: 'IMGBIT-CLOSED'
		}
		
		//------------------------------------------------------------
		//  Store original element in plain text
		//------------------------------------------------------------
		self.original = $( self.elem ).myHtml();
		
		//------------------------------------------------------------
		//  Separate the image source and clipping coordinates
		//------------------------------------------------------------
		self.href = $( self.elem ).attr( 'href' );
		self.caption = $( self.elem ).text();
		
		//------------------------------------------------------------
		//  Store the images original height and width
		//------------------------------------------------------------
		self.imgWidth = null;
		self.imgHeight = null;
		
		//------------------------------------------------------------
		//  Time created with UTC offset
		//------------------------------------------------------------
		var timeStamp = new TimeStamp();
		self.timeCreated = timeStamp.withUtc( true );
		
		//------------------------------------------------------------
		//  Get the imgbit parameters
		//------------------------------------------------------------
		var arr = self.href.split('imgbit=');
		self.src = arr[0].substring( 0, arr[0].length-1 );
		self.param = self.getToJson( arr[1] );
		
		//------------------------------------------------------------
		//  Explicit width?
		//------------------------------------------------------------
		if ( self.param.w != undefined ) {
			self.param.z = self.param.w / ( self.param.x2 - self.param.x1 );
		}
		
		//------------------------------------------------------------
		//  Explicit height?
		//------------------------------------------------------------
		if ( self.param.h != undefined ) {
			self.param.z = self.param.h / ( self.param.y2 - self.param.y1 );
		}
		
		//------------------------------------------------------------
		//  Color?
		//------------------------------------------------------------
		if ( self.param.c != undefined ) {
			self.culuh = new Culuh( self.param.c );
		}
		
		//------------------------------------------------------------
		//  Zoom?
		//------------------------------------------------------------
		self.param.z = ( self.param.z == undefined ) ? 1 : self.param.z;
		
		//------------------------------------------------------------
		//  Check to see if special style classes have been passed
		//------------------------------------------------------------
		if ( $( self.elem ).hasClass('min') ) {
			self.options['style'] = null;
		}
		if ( $( self.elem ).hasClass('edit') ) {
			self.options['style'] = 'edit';
		}
		if ( $( self.elem ).hasClass('closable') ) {
			self.options['closable'] = true;
		}
		
		//------------------------------------------------------------
		//  Check to see if img is in album
		//------------------------------------------------------------
		self.build();
	}
	
	/**
	 * Build the imgbit DOM elements
	 */
	imgbit.prototype.build = function() {
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
			//  Store the orignal size of the image
			//------------------------------------------------------------
			self.imgWidth = img.width;
			self.imgHeight = img.height;
			
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
			//  Scale imgbit container to size of image
			//------------------------------------------------------------
			$( self.elem ).css({
				width: $( '.view', self.elem ).width()
			});
			
			//------------------------------------------------------------
			//  If the edit tag is set, create the edit dom elements
			//------------------------------------------------------------
			self.editStart();
			
			//------------------------------------------------------------
			//  If the imgbit is closable add the close button
			//------------------------------------------------------------
			if ( self.options['closable'] == true ) {
				self.closeBuild();
			}
			
			//------------------------------------------------------------
			//  If the color has been set... set the color
			//------------------------------------------------------------
			if ( self.param.c != undefined ) {
				$( self.elem ).css({
					'background-color': '#'+self.param.c
				});
				$( '.close', self.elem ).css({
					'background-color': '#'+self.param.c
				})
			}
			
			//------------------------------------------------------------
			//  Let the world know you've changed
			//------------------------------------------------------------
			$( self.elem ).trigger( self.events['change'] );
		}
		img.src = self.src;
	}

	/**
	 * Build the close button and start the click listener
	 */	
	imgbit.prototype.closeBuild = function() {
		var self = this;
		$( self.elem ).prepend( '<a href="" class="close">x</a>' );
		$( '.close', self.elem ).click( function( _e ) {
			$( self.elem ).trigger( self.events['closed'] );
			$( self.elem ).trigger( self.events['change'] );
			_e.preventDefault();
		});
	}
	
	/**
	 * Resize caption textarea to match static caption
	 */
	imgbit.prototype.captionResize = function() {
		var self = this;
		var text = $( '.text', self.elem );
		
		//------------------------------------------------------------
		//  jQuery's height() method returns incorrect values if
		//  the targeted element is hidden.  So we have to do a
		//  a little show and hide voodoo to get an accurate height
		//  value.  Hopefully it won't cause any strobing.
		//------------------------------------------------------------
		var hide = false;
		if ( text.is(':visible') == false ) {
			hide = true;
		}
		text.show();
		var textHeight = text.height();
		if ( hide == true ) {
			text.hide();
		}
		var fontSize = parseInt( text.css( 'font-size' ).replace( 'px', '' ) );
		var height = ( textHeight > fontSize ) ? textHeight : fontSize;
		$( '.caption', self.elem ).height( height )
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
			//  Build the edit DOM elements.
			//------------------------------------------------------------
			self.editBuild();
			
			//------------------------------------------------------------
			//  Resize the caption as neeeded.
			//------------------------------------------------------------
			self.captionResize();
			
			//------------------------------------------------------------
			//  Listen for return key.  
			//------------------------------------------------------------
			$( '.caption', self.elem ).keypress( function( _e ) {
				if ( _e.which == 13) {
					self.editSwitch();
				};
			});
			
			//------------------------------------------------------------
			//  Keep editable and static caption synched.
			//------------------------------------------------------------
			$( '.caption', self.elem ).bind( 'input propertychange', function() {
				self.setCaption( $( '.caption', self.elem ).val() );
			});
		}
	}
	
	/**
	 * Remove the imgbit from the DOM
	 */
	imgbit.prototype.remove = function() {
		var self = this;
		$( self.elem ).remove();
	}
	
	/**
	 * Update the caption
	 */
	imgbit.prototype.setCaption = function( _caption ) {
		var self = this;
		self.caption = _caption;
		$( '.text', self.elem ).text( self.caption );
		self.captionResize();
		//------------------------------------------------------------
		//  Let the application know you've changed.
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['change'] );
	}
	
	/**
	 * Change the ids
	 */
	imgbit.prototype.idUpdate = function( _id ) {
		var self = this;
		$( self.elem ).attr( 'id', _id );
	}
	
	/**
	 * Build the edit DOM elements
	 */
	imgbit.prototype.editBuild = function() {
		var self = this;
		//------------------------------------------------------------
		//  Build a caption
		//------------------------------------------------------------
		var textarea = '<textarea class="caption">'+$( '.text', self.elem ).text()+'</textarea>';
		$( '.text', self.elem ).after( textarea );
		
		//------------------------------------------------------------
		//  Set the width of the caption textarea to the size of the 
		//  image and the height of the static caption.
		//------------------------------------------------------------
		 $( '.caption', self.elem ).css({ 
			width: $( '.view', self.elem).width()
		});
		
		//------------------------------------------------------------
		//  If a color has been set desaturate the color.
		//------------------------------------------------------------
		if ( self.culuh != undefined ) {
			$( '.caption', self.elem ).css({
				'background-color': self.culuh.sat( 0.35, true ).hex()
			});
		}
		
		$( '.caption', self.elem ).hide();
		
		//------------------------------------------------------------
		//  Switch between editable and static captions
		//------------------------------------------------------------
		$( '.text', self.elem ).click( function( _e ) {
			self.editSwitch();
			_e.preventDefault();
		});
	}
	
	/**
	 * Switch between static caption and textarea caption
	 */
	imgbit.prototype.editSwitch = function() {
		var self = this;
		if ( $( '.caption', self.elem ).is(":visible") ) {
			self.editHide();
		}
		else {
			//------------------------------------------------------------
			//  There can only be one imgbit caption editor
			//  Calling editHide() on the prototype object will
			//  call that method for all instances.
			//------------------------------------------------------------
			imgbit.prototype.editHide();
			self.editShow();
		}
	}
	
	/**
	 * Hide caption textarea
	 */
	imgbit.prototype.editHide = function() {
		var self = this;
		$( '.caption', self.elem ).hide();
		$( '.text', self.elem ).show();
	}
	
	/**
	 * Show caption textarea
	 */
	imgbit.prototype.editShow = function() {
		var self = this;
		$( '.text', self.elem ).hide();
		$( '.caption', self.elem ).show();
		$( '.caption', self.elem ).cursorToEnd();
	}
	
	/**
	 * Crop the view window
	 */
	imgbit.prototype.viewCrop = function() {
		var self = this;
		$( '.view', self.elem ).css({
			width: ( self.param.x2 - self.param.x1 ) * self.param.z,
			height: ( self.param.y2 - self.param.y1 ) * self.param.z
		});
	}
	
	/**
	 * Move the image into place
	 */
	imgbit.prototype.imgMove = function() {
		var self = this;
		$( 'img.star', self.elem ).css({
			width: $( 'img.star', self.elem ).width() * self.param.z,
			height: $( 'img.star', self.elem ).height() * self.param.z,
			left: self.param.x1*-1*self.param.z,
			top: self.param.y1*-1*self.param.z
		});
	}
	
	/**
	 * Turn GET parameter string into a JSON object
	 */
	imgbit.prototype.getToJson = function( _get ) {
        if ( _get == "" ) return {};
        var json = {};
		var key_vals = _get.split('%');
        for ( var i=0, ii=key_vals.length; i<ii; i++ ) {
			var param = key_vals[i].split('=');
			if ( param.length != 2 ) {
				continue;
			}
            json[ param[0] ] = decodeURIComponent( param[1].replace( /\+/g, "" ) );
        }
        return json;
    }
	
	/**
	 * Turn imgbit into imgbit constructor HTML
	 * You know the markup you need to start imgbit
	 *
	 * @return { string } HTML representation
	 */
	imgbit.prototype.html = function() {
		var self = this;
		var questAnd = ( self.src.indexOf('?') == -1 ) ? '?' : '&';
		var html = '<a class="imgbit" \
						href="'+self.src+'\
						'+questAnd+'imgbit=\
						x1='+self.param['x1']+'\
						%y1='+self.param['y1']+'\
						%x2='+self.param['x2']+'\
						%y2='+self.param['y2']+'\
						%c='+self.param['c']+'\
						%z='+self.param['z']+'">\
						'+self.caption+'\
					<a>';
		return html.smoosh();
	}
	
	/**
	 * Returns coordinates for cite urns.
	 * All coordinates are stored as ratios to the original height and width
	 * 
	 * @return { array } [ top-left-x, top-left-y, width, height ]
	 */
	imgbit.prototype.citeCoords = function() {
		var self = this;
		var output = [];
		output[0] = self.param['x1'] / self.imgWidth;
		output[1] = self.param['y1'] / self.imgHeight;
		output[2] = ( self.param['x2'] - self.param['x1'] ) / self.imgWidth;
		output[3] = ( self.param['y2'] - self.param['y1'] ) / self.imgHeight;
		for( var i=0, ii=output.length; i<ii; i++ ) {
			output[i] = output[i].toFixed(4);
		}
		return output;
	}
	
	/**
	 * Returns an imgbit transcription in open annotation spec JSON
	 *
	 * @param { json } JSON with additional info 
	 *                 needed to construct a complete JSON LD object
	 *
	 *		"@id": "http://perseids.org/collections/urn:cite:perseus:annsimp.1.1",
	 *		"annotatedBy": {
	 *			"@id": "http://data.perseids.org/people/1",
	 *			"mbox": {
	 *				"@id": "mailto:name@email.com"
	 *			}
	 *			"name": "Name"
	 *		}
	 *		"hasBody": "http://perseids.org/collections/urn:cite:perseus:lci.1",
	 *		"hasTarget": "http://perseids.org/citations/urn:cts:greekLit:tlg0008.tlg001.perseus-grc1:6.103"
	 *
	 *
	 * @return { json } JSON LD http://www.openannotation.org/spec/core/
	 */
	imgbit.prototype.toJsonLD = function( _info ) {
		var self = this;
		return {
			"@context": "http://www.w3.org/ns/oa-context-20130208.json",
			"@type": "oa:Annotation",
			"annotatedAt": self.timeCreated,
			"annotatedBy": {
				"@type": "foaf:Person"
			},
			"motivatedBy": "perseus:transcribing",
			"label": "isQuotationOf"
		}
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
/**
 * Extend jQuery
 */
jQuery.fn.cursorToEnd = function() {
	return this.each( function() {
		$( this ).focus();
		
		//------------------------------------------------------------
		//   If this function exists...
		//------------------------------------------------------------
		if ( this.setSelectionRange ) {
			//------------------------------------------------------------
			// ... then use it ( Doesn't work in IE )
			// Double the length because Opera is inconsistent 
			// about whether a carriage return is one character or two.
			//------------------------------------------------------------
			var len = $( this ).val().length * 2;
			this.setSelectionRange( len, len );
		} 
		else {
			//------------------------------------------------------------
			// ... otherwise replace the contents with itself
			// ( Doesn't work in Google Chrome )
			//------------------------------------------------------------
			$( this ).val( $( this ).val() );
		}
		//------------------------------------------------------------
		// Scroll to the bottom, in case we're in a tall textarea
		// ( Necessary for Firefox and Google Chrome )
		//------------------------------------------------------------
		this.scrollTop = 999999;
	});
};

/**
 *  Get an element's html
 */
jQuery.fn.myHtml = function() {
	return $( this ).clone().wrap( '<div>' ).parent().html();
}

/**
 *  Get transition time in milliseconds
 *
 *  @return { Number } Time in milliseconds
 */
jQuery.fn.transLength = function() {
	var trans = $( this ).css( 'transition' );
	var res = trans.match( / [\d|\.]+s/g );
	var sec = Number( res[0].replace( 's','' ) );
	return sec*1000;
}
/**
 * Remove newlines and tabs
 */
String.prototype.smoosh = function() {
	return this.replace(/(\r\n+|\n+|\r+|\t+)/gm,'');
}

/**
 * Count the occurences of a string in a larger string
 *
 * @parm {string} _sub : The search string
 * @param {boolean} _overlap : Optional. Default: false
 * @return {int} : The count
 */
String.prototype.occurs = function( _search, _overlap ) {
	var string = this;
	//------------------------------------------------------------
	//  If _search is null just return a char count
	//------------------------------------------------------------
	if ( _search == undefined ) {
		return string.length;
	}
	//------------------------------------------------------------
	//  Make sure _search is a string
	//------------------------------------------------------------
	_search+="";
	//------------------------------------------------------------
	//  If no search term is past just return a character count
	//------------------------------------------------------------
	if ( _search.length <= 0 ) {
		return string.length;
	}
	//------------------------------------------------------------
	//  Otherwise start counting.
	//------------------------------------------------------------
	var n=0;
	var pos=0;
	var step = ( _overlap ) ? 1 : _search.length;
	while ( true ) {
		pos = string.indexOf( _search, pos );
		if ( pos >= 0 ) {
			n++;
			pos += step;
		}
		else {
			break;
		}
	}
	return n;
}

/*
 * Turn a string with HTTP GET style parameters to an object
 *
 * @return { obj } A collection of keys and values
 */
String.prototype.params = function() {
	var arr = this.split('?');
	var get = arr[1];
	arr = get.split('&');
	var out = {};
	for ( var i=0, ii=arr.length; i<ii; i++ ) {
		if ( arr[i] != undefined ) {
			var pair = arr[i].split('=');
			out[ pair[0] ] = pair[1];
		}
	}
	return out;
}

/*
 * Check for the existence of an upper-case letter
 *
 * @return { boolean }
 */
String.prototype.hasUpper = function() {
	return /[A-Z]/.test( this );
}

/*
 * Create a word frequency report object
 *
 * @return { obj } Report object
 */
String.prototype.report = function() {
	var words = this.toLowerCase().split(' ');
	var stats = {};
	for ( var i=0, ii=words.length; i<ii; i++ ) {
		var word = words[i];
		if ( ! ( word in stats ) ) {
			stats[word] = 1;
		}
		else {
			stats[word] += 1;
		}
	}
	return stats;
}

/*
 * Divide text into an array of lines by splitting on linebreaks
 *
 * @return { array } An array of lines
 */
String.prototype.lines = function() {
	return this.split("\n");
}

/*
 * Divide text into an array of individual sentences
 * This is English-centric.  Forgive me.
 *
 * @return { array } An array of sentences
 */
String.prototype.sentences = function() {
	var check = this.match( /[^\.!\?]+[\.!\?]+/g );
	
	//------------------------------------------------------------
	//  Make sure characters aren't used for purposes other than
	//  sentences.
	//------------------------------------------------------------
	var vowels = [ 'a','e','i','o','u','y' ];
	var out = [];
	var carry = '';
	for ( var i=0; i<check.length; i++ ) {
		//------------------------------------------------------------
		//  Clean up.
		//------------------------------------------------------------
		var strCheck = carry + check[i];
		carry = '';
		//------------------------------------------------------------
		//  Check for the existence of a vowel, so we aren't
		//  accidentally thinking part of an abbreviation is its
		//  own sentence.
		//------------------------------------------------------------
		var merge = true;
		for ( var j=0; j<vowels.length; j++ ) {
			if ( strCheck.indexOf( vowels[j] ) != -1 ) {
				merge = false;
				break;
			}
		}
		//------------------------------------------------------------
		//  Also check for a capital letter on the first word.  
		//  Most sentences have those too.
		//------------------------------------------------------------
		var capTest = strCheck.trim();
		if ( ! capTest[0].hasUpper() ) {
			merge = true;
		}
		//------------------------------------------------------------
		//  If no vowel exists in the sentence you're probably
		//  dealing with an abbreviation.  Merge with last sentence.  
		//------------------------------------------------------------
		if ( merge ) {
			if ( out.length > 0 ) {
				out[ out.length-1 ] += strCheck;
			}
			else {
				carry = strCheck;
			}
			continue;
		}
		
		//------------------------------------------------------------
		//  Prepare output.
		//------------------------------------------------------------
		out.push( strCheck.smoosh().trim() );
	}
	return out;
}
/**
 * Get a quality timestamp
 * @requires datejs ../third_party/datejs.date.js [ http://www.datejs.com/ ]
 */
function TimeStamp() {}

/**
 * Return a timestamp with a UTC offset
 *
 * @param { boolean } _milli include milliseconds
 * @return { string } timestamp with UTC offset
 */
TimeStamp.prototype.withUtc = function( _milli ) {
	var d = new Date();
	var yyyy = d.getFullYear();
	var mm = ('0' + (d.getMonth()+1)).slice(-2);
	var dd = ('0' + d.getDate()).slice(-2);
	var hh = d.getHours();
	var min = ('0' + d.getMinutes()).slice(-2);
	var sec = ('0' + d.getSeconds()).slice(-2);
	var mil = ('0' + d.getMilliseconds()).slice(-3);
	var diff = d.getTimezoneOffset();
	
	//------------------------------------------------------------
	//  Include milliseconds?
	//------------------------------------------------------------
	var time = '';
	if ( _milli ) {
		time = yyyy+'-'+mm+'-'+dd+'T'+hh+":"+min+":"+sec+":"+mil+"UTC";
	}
	else {
		time = yyyy+'-'+mm+'-'+dd+'T'+hh+":"+min+":"+sec+"UTC";		
	}
	
	//------------------------------------------------------------
	//  Get the timezone offset
	//------------------------------------------------------------
	if ( diff > 0 ) {
		time = time+"+"+diff;
	}
	else {
		time = time+"-"+diff;
	}
	return time;
}

/**
 * Return unix time
 *
 * @return { int } unix time
 */
TimeStamp.prototype.unix = function() {
	return new Date().getTime();
}

/**
 * Return millisecond unix time from UTC string
 *
 * @param { string } _string timestamp with UTC offset
 * @return { int } unix time
 */
TimeStamp.prototype.toUnix = function( _string ) {
	//------------------------------------------------------------
	// Kill the UTC offset
	//------------------------------------------------------------
	var cleanTime = _string.replace( /UTC.*/, '' );
	var milli = 0;
	//------------------------------------------------------------
	// Grab the milliseconds if they exist
	//------------------------------------------------------------
	if ( cleanTime.match( /:\d{3}/ ) ) {
		milli = cleanTime.slice( -4 );
		cleanTime = cleanTime.replace( /:\d+$/, '' );
		milli = parseInt( milli.replace(':','') );
	}
	return Date.parse( cleanTime ).getTime() + milli;
}
/**
 * A smarter way to control colors
 */
function Culuh( _color ) {
	this.r=0; // red
	this.g=0; // blue
	this.b=0; // green
	this.h=0; // hue
	this.s=0; // saturation
	this.v=0; // value
	if ( _color != undefined ) {
		this.original = _color;
		this.reset();
		this.hsvUpdate();
	}
}

/**
 * Reset the color to the original color 
 * declared in the constructor.
 */
Culuh.prototype.reset = function( ) {
	var self = this;
	var color = this.original;
	
	//------------------------------------------------------------
	//  Check if it's RGB
	//------------------------------------------------------------
	color = color.toUpperCase();
	if ( color.indexOf( 'RGB' ) > -1 ) {
		var vals = color.match( /\d+\.?\d*/g );
		this.r = parseInt( vals[0] );
		this.g = parseInt( vals[1] );
		this.b = parseInt( vals[2] );
	}
	
	//------------------------------------------------------------
	//  No... then it's a hex
	//------------------------------------------------------------
	else {
		var vals = color.match( /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i );
		this.r = this.hexToInt( vals[1] );
		this.g = this.hexToInt( vals[2] );
		this.b = this.hexToInt( vals[3] );
	}
}

/**
 * Builds HSV ( Hue, Saturation, and Value ) from RGB
 * ported from http://lodev.org/cgtutor/color.html
 */
Culuh.prototype.hsvUpdate = function() {
	var h; 
	var s;
	var v;
	
	var r = this.r / 255;
	var g = this.g / 255;
	var b = this.b / 255;
	
	//------------------------------------------------------------
	//  Find the value
	//------------------------------------------------------------
	var min = Math.min( r, g, b );
	var max = Math.max( r, g, b );
	var delta = max-min;
	v = max;
	
	//------------------------------------------------------------
	//  If black well... saturation is easy
	//------------------------------------------------------------
	if ( max == 0 ) {
		s = 0;
	}
	else {
		s = delta / max;
	}
	if ( s == 0 ) {
		h = 0;
	}
	else {
		if ( r == max ) {
			h = ( g-b ) / delta;
		}
		else if ( g == max ) {
			h = 2 + ( b-r ) / delta;
		}
		else {
			h = 4 + ( r-g ) / delta;
		}
		
		if ( isNaN( h ) ) {
			h = 0;
		}
		h /= 6;
		if ( h < 0 ) {
			h++;
		}

	}
	this.h = h * 255;
	this.s = s * 255;
	this.v = v * 255;
}

/**
 * Builds RGB from HSV
 * ported from http://lodev.org/cgtutor/color.html
 */
Culuh.prototype.rgbUpdate = function() {
	var r;
	var g;
	var b;
	
	var h = this.h / 255;
	var s = this.s / 255;
	var v = this.v / 255;
	
	//------------------------------------------------------------
	// No saturation means achromatic aka 'gray'
	//------------------------------------------------------------
	if ( s == 0 ) {
		r = g = b = v;
	}
	
	//------------------------------------------------------------
	// If there is saturation things get messy 
	//------------------------------------------------------------
	else {
		h *= 6;
		var i = Math.floor( h );
		var frac = h % 1;
		var p = v * ( 1 - s );
		var q = v * ( 1 - ( s * frac ));
		var t = v * ( 1 - ( s * ( 1 - frac )));

		switch( i ) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			case 5:
				r = v;
				g = p;
				b = q;
				break;
		}
	}
	this.r = parseInt( r * 255 );
	this.g = parseInt( g * 255 );
	this.b = parseInt( b * 255 );	
}

/**
 * Builds hexadecimal color value
 *
 * @param { string } _pre hexadecimal prefix typically '#' or '0x'
 * @return { string } hexadecimal color value
 */
Culuh.prototype.hex = function( _pre ) {
	_pre = ( _pre == undefined ) ? '' : _pre;
	return _pre + this.rHex() + this.gHex() + this.bHex();
}

/**
 * Returns RGB color value
 *
 * @return { string } rgb color value
 */
Culuh.prototype.rgb = function() {
	return 'rgb('+this.r+','+this.g+','+this.b+')';
}

/**
 * Returns red hex value
 *
 * @return { string } red hex value
 */
Culuh.prototype.rHex = function() {
	return this.intToHex( this.r );
}

/**
 * Returns green hex value
 *
 * @return { string } green hex value
 */
Culuh.prototype.gHex = function() {
	return this.intToHex( this.g );
}

/**
 * Returns blue hex value
 *
 * @return { string } blue hex value
 */
Culuh.prototype.bHex = function() {
	return this.intToHex( this.b );
}

/**
 * Returns red integer value 0-255
 *
 * @return { int } red int value
 */
Culuh.prototype.rInt = function() {
	return this.r;
}

/**
 * Returns green integer value 0-255
 *
 * @return { int } green int value
 */
Culuh.prototype.gInt = function() {
	return this.g;
}

/**
 * Returns blue integer value 0-255
 *
 * @return { int } blue int value
 */
Culuh.prototype.bInt = function() {
	return this.b;
}

/**
 * Converts hex to integer value
 *
 * @return { int } integer value
 */
Culuh.prototype.hexToInt = function( _hex ) {
	return parseInt( _hex, 16 );
}

/**
 * Converts integer to hex value
 *
 * @return { string } hexadecimal value
 */
Culuh.prototype.intToHex = function( _int ) {
	var hex = _int.toString(16);
	if ( hex.length < 2 ) {
		hex = '0'+hex;
	}
	return hex.toUpperCase();
}

/**
 * Change the saturation of the color
 *
 * @param { float } _sat saturation multiplier
 * @param { boolean: false } _new return new Culuh
 *		and don't change the current Culuh values
 * @return { Culuh }
 */
Culuh.prototype.sat = function( _sat, _out ) {
	var sat = this.s;
	sat *= _sat;
	if ( _out != true ) {
		this.s = sat;
		this.rgbUpdate();
	}
	else {
		var out = new Culuh( this.rgb() );
		out.sat( _sat );
		return out;
	}
}

/**
 * Invert the color
 *
 * @param { boolean: false } _new return new Culuh
 *		and don't change the current Culuh values
 * @return { Culuh }
 */
Culuh.prototype.invert = function( _out ) {
	if ( _out != true ) {
		this.r = 255 - this.r;
		this.g = 255 - this.g;
		this.b = 255 - this.b;
		this.hsvUpdate();
	}
	else {
		var out = new Culuh( this.rgb() );
		out.invert();
		return out;
	}
}
/*!
 * menumucil
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The element that becomes the root of the plugin
	 * @param { obj } _options Configuration options
	 * @param { string } _id The id of the root element 
	 */
	function menumucil( elem, options, id ) {
		var self = this;
		self.elem = elem;
		self.id = id;
		self.init( elem, options );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The element that becomes the root of the plugin
	 * @param { obj } _options Configuration options
	 */
	menumucil.prototype.init = function( elem, options ) {
		var self = this;
		
		//---------------
		//	User options 
		//---------------
		self.options = $.extend({
			closed: "&#9660;",
			open: "&#9650;",
			button_classes: null,
			up: false,
			cover: false
		}, options);
		
		self.events = {
			open: 'MENUMUCIL-OPEN',
			closed: 'MENUMUCIL-CLOSED'
		};
		
		//-----------------------------------
		//	Shared instance method variables
		//-----------------------------------
		self.menu = null;
		self.pane = null;
		self.clicker = null;
		
		//-------------------------
		//	Get the party started  
		//-------------------------
		self.build();
	}
	
	/**
	 * Build the DOM elements needed by the plugin
	 */
	menumucil.prototype.build = function() {
		var self = this;
		self.menu = $( self.elem );
		
		self.menu.addClass( 'menumucil' );
		
		//------------------------------------------------------------
		//  Cover mode?
		//------------------------------------------------------------
		if ( self.options['cover'] || self.options['up'] ) {
			self.menu.css({
				position: 'absolute',
				'z-index': 5000
			});
		}
		self.menu.wrapInner( '<div class="inner" />');
		self.menu.wrapInner( '<div class="pane" />');
		
		self.pane = $( '.pane', self.elem );
		self.pane.addClass( 'closed' );
		
		//------------------------------------------------------------
		//	Create clicker
		//------------------------------------------------------------
		self.clicker = $( document.createElement( 'a' ) );
		self.clicker.attr( 'href', '#' );
		self.clicker.addClass( 'clicker' );
		if ( self.options['button_classes'] != null ) {
		    self.clicker.addClass( self.options['button_classes'] );
		}
		self.menu.append( self.clicker );
		
		//------------------------------------------------------------
		//  The main clicker icon
		//------------------------------------------------------------
		self.icon = $( document.createElement( 'span' ) );
		self.icon.addClass( 'icon' );
		self.clicker.append( self.icon );
		self.icon.html( self.options['closed'] );
		
		
		//------------------------------------------------------------
		//  Extra content that needs to be written to the clicker.
		//  Content counts and that sort of thing.
		//------------------------------------------------------------
		self.extra = $( document.createElement( 'span' ) );
		self.extra.addClass( 'extra' );
		self.clicker.append( self.extra );
		
		//---------------------------------
		//	Register transition listeners  
		//---------------------------------
		self.pane.on( 'transitionEnd webkitTransitionEnd transitionend oTransitionEnd msTransitionEnd', function( _e ) {
			if ( self.pane.hasClass( 'open' ) ) {
				self.pane.css('max-height', 9999);
			}
		});
		
		//------------------------------------------------------------
		//  Cover mode?
		//------------------------------------------------------------
		if ( self.options['cover'] || self.options['up'] ) {
			var height = self.clicker.height();
			self.menu.after( '<div style="height:'+height+'px;clear:both"></div>')
		}
		
		//-----------------------------
		//	Close the menu by default  
		//-----------------------------
		self.closeNow();
		
		//------------------------
		//	Register click event  
		//------------------------
		$( self.clicker ).click( function( _e ) {
			if ( self.isOpen() ) {
				self.close();
			}
			else if ( self.pane.hasClass('closed') ) {
				self.open();
			}
			_e.preventDefault();
		})
	}
	
	/**
	 * Check to see if the menu is open.
	 *
	 * @return { boolean }
	 */
	menumucil.prototype.isOpen = function() {
		var self = this;
		if ( self.pane.hasClass('open') ) {
			return true;
		}
		return false;
	}
	
	/**
	 * Check to see if the menu is closed.
	 *
	 * @return { boolean }
	 */
	menumucil.prototype.isClosed = function() {
		var self = this;
		if ( self.pane.hasClass('closed') ) {
			return true;
		}
		return false;
	}
	
	/**
	 * Open the menu.
	 */
	menumucil.prototype.open = function() {
		var self = this;
		self.pane.contentHeight = self.pane.outerHeight();
		self.pane.contentHeight += $( '.inner', self.elem ).outerHeight();
		self.pane.css({
			'max-height': self.pane.contentHeight
		});
		if ( self.options['up'] ) {
			self.menu.css({
				'top': self.menu.position().top - self.pane.contentHeight
			});
		}
		self.pane.removeClass( 'closed' );
		self.pane.addClass( 'open' );
		self.icon.html( self.options['open'] );
		self.pane.trigger( self.events['open'], [self.id] );
	}
	
	/**
	 * Close the menu.
	 */
	menumucil.prototype.close = function() {
		var self = this;
		self.pane.contentHeight = self.pane.outerHeight();
		self.pane.removeClass('transitions').css( 'max-height', self.pane.contentHeight );
		
		//------------------------------------------------------------
		//	This delay is needed for quick close animation
		//------------------------------------------------------------
		setTimeout( function() {
			self.closeNow();
			self.pane.removeClass('open');
			self.pane.addClass('closed');
			self.icon.html( self.options['closed'] );
			self.menu.trigger( self.events['closed'], [self.id] );
		}, 10 );
	}
	
	/**
	 * Close the menu bypassing animations
	 */
	menumucil.prototype.closeNow = function() {
		var self = this;
		self.pane.addClass('transitions').css({
			'max-height': 0
		});
	}

	//----------------
	//	Extend JQuery 
	//----------------
	jQuery(document).ready( function($) {
		jQuery.fn.menumucil = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new menumucil( this, options, id ) );
			});
		};
	})
})(jQuery);
