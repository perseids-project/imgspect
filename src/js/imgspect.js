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
					console.log( time );
				}
				break;
			case 'space':
				var sorted = new Sorted();
				var imgbits = sorted.areaSort( self.imgbits, "param.x1", "param.y1", "param.y2" );
				console.log( imgbits );
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
	 * Start the lite mouse event listeners
	 */
	imgspect.prototype.liteStart = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Mouse Down
		//------------------------------------------------------------
		$( '.view', self.elem ).mousedown( function( _e ) {
			_e.preventDefault();
			
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
		});
		
		//------------------------------------------------------------
		//  Mouse Move
		//------------------------------------------------------------
		$( '.view', self.elem ).mousemove( function( _e ) {
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
			
		});
		
		//------------------------------------------------------------
		//  Mouse Up
		//------------------------------------------------------------
		$( '.view', self.elem ).mouseup( function( _e ) {
			_e.preventDefault();
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
		});
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
		var left = _e.clientX - vp.left;
		var top = _e.clientY - vp.top + $(window).scrollTop();
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