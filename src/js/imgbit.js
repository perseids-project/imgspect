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
		//	User options 
		//------------------------------------------------------------
		self.options = $.extend({
			style: 'full',
			closable: false
		}, _options);
		
		//------------------------------------------------------------
		//	Events
		//------------------------------------------------------------
		self.events = {
			change: 'IMGBIT-CHANGE',
			closed: 'IMGBIT-CLOSED',
			frame: 'IMGBIT-FRAME'
		}
		
		//------------------------------------------------------------
		//	Store original element in plain text
		//------------------------------------------------------------
		self.original = $( self.elem ).myHtml();
		
		//------------------------------------------------------------
		//	Separate the image source and clipping coordinates
		//------------------------------------------------------------
		self.href = $( self.elem ).attr( 'href' );
		self.caption = $( self.elem ).text();
		
		//------------------------------------------------------------
		//	Store the images original height and width
		//------------------------------------------------------------
		self.imgWidth = null;
		self.imgHeight = null;
		
		//------------------------------------------------------------
		//	Time created with UTC offset
		//------------------------------------------------------------
		var timeStamp = new TimeStamp();
		self.timeCreated = timeStamp.withUtc( true );
		
		//------------------------------------------------------------
		//	Get the imgbit parameters
		//------------------------------------------------------------
		var arr = self.href.split('imgbit=');
		self.src = self.href;
		self.param = {};
		if ( arr.length > 1 ) {
			self.src = arr[0].substring( 0, arr[0].length-1 );
			self.param = self.getToJson( arr[1] );
		}
		
		//------------------------------------------------------------
		//  Check for special class options
		//------------------------------------------------------------
		self.specClass();
		
		//------------------------------------------------------------
		//	Check to see if img is in album
		//------------------------------------------------------------
		self.build();
	}
	
	/**
	 * Check for special classes
	 */
	imgbit.prototype.specClass = function() {
		var self = this;
		
		//------------------------------------------------------------
		//	Check to see if special style classes have been passed
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
	}
	
	/**
	 * Build the imgbit DOM elements
	 */
	imgbit.prototype.fixParams = function() {
		var self = this;
		
		//------------------------------------------------------------
		//	Explicit width?
		//------------------------------------------------------------
		if ( self.param.w != undefined ) {
			self.param.z = self.param.w / ( self.param.x2 - self.param.x1 );
		}
		
		//------------------------------------------------------------
		//	Explicit height?
		//------------------------------------------------------------
		if ( self.param.h != undefined ) {
			self.param.z = self.param.h / ( self.param.y2 - self.param.y1 );
		}
		
		//------------------------------------------------------------
		//	Color?
		//------------------------------------------------------------
		if ( self.param.c != undefined ) {
			self.culuh = new Culuh( self.param.c );
		}
		
		//------------------------------------------------------------
		//	Zoom?
		//------------------------------------------------------------
		self.param.z = ( self.param.z == undefined ) ? 1 : self.param.z;
	}
	
	/**
	 * Build the imgbit DOM elements
	 */
	imgbit.prototype.build = function() {
		var self = this;
		
		//------------------------------------------------------------
		//	Store the id
		//------------------------------------------------------------
		var id = $( self.elem ).attr('id');
		
		//------------------------------------------------------------
		//	Change anchor tag to div
		//------------------------------------------------------------
		$( self.elem ).after( '<div class="imgbit">' );
		self.elem = $( self.elem ).next();
		
		//------------------------------------------------------------
		//	Add the id
		//------------------------------------------------------------
		$( self.elem ).attr( 'id', id );
		
		//------------------------------------------------------------
		//	Remove the original anchor tag.
		//------------------------------------------------------------
		var a = $( self.elem ).prev();
		var html = a.html();
		a.remove();
		
		//------------------------------------------------------------
		//	Add the style class if it is not null
		//------------------------------------------------------------
		if ( self.options['style'] != null ) {
			$( self.elem ).addClass( self.options['style'] );
		}
		
		//------------------------------------------------------------
		//	Create the viewport
		//------------------------------------------------------------
		$( self.elem ).append( '<div class="view">' );
		
		//------------------------------------------------------------
		//	Store the a tag text
		//------------------------------------------------------------
		$( self.elem ).append( '<div class="text">'+ html +'</div>' );
		$( '.text', self.elem ).hide();
		if ( self.options['style'] != null ) {
			$( '.text', self.elem ).show();
		}
		
		//------------------------------------------------------------
		//	Load the image
		//------------------------------------------------------------
		var img = new Image();
		img.onload = function() {
			$( this ).addClass('star');
			
			//------------------------------------------------------------
			//	Store the orignal size of the image
			//------------------------------------------------------------
			self.imgWidth = img.width;
			self.imgHeight = img.height;
			
			//------------------------------------------------------------
			//  Relative to explicit
			//------------------------------------------------------------
			self.toExplicit();
			self.fixParams();
			
			//------------------------------------------------------------
			//	Add the image to the view
			//------------------------------------------------------------
			$( '.view', self.elem ).append( this )
			
			//------------------------------------------------------------
			//	Crop the view to the area dimensions
			//------------------------------------------------------------
			self.viewCrop();
		
			//------------------------------------------------------------
			//	Move the image into place and scale it
			//------------------------------------------------------------
			self.imgMove();
		
			//------------------------------------------------------------
			//	Add a clear
			//------------------------------------------------------------
			$( self.elem ).prepend( '<div style="clear:both"></div>' );
		
			//------------------------------------------------------------
			//	Add a link to the source image
			//------------------------------------------------------------
			if ( self.options['style'] != null && self.options['style'] != 'edit' ) {
				$( self.elem ).prepend( '<a class="source" href="'+ self.src +'">source</a>' );
			}
			
			//------------------------------------------------------------
			//	Scale imgbit container to size of image
			//------------------------------------------------------------
			$( self.elem ).css({
				width: $( '.view', self.elem ).width()
			});
			
			//------------------------------------------------------------
			//	If the edit tag is set, create the edit dom elements
			//------------------------------------------------------------
			self.editStart();
			
			//------------------------------------------------------------
			//	If the imgbit is closable add the close button
			//------------------------------------------------------------
			if ( self.options['closable'] == true ) {
				self.closeBuild();
			}
			
			//------------------------------------------------------------
			//	If the color has been set... set the color
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
			//	Let the world know you've changed
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
		//	jQuery's height() method returns incorrect values if
		//	the targeted element is hidden.	 So we have to do a
		//	a little show and hide voodoo to get an accurate height
		//	value.	Hopefully it won't cause any strobing.
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
			//	Build the edit DOM elements.
			//------------------------------------------------------------
			self.editBuild();
			
			//------------------------------------------------------------
			//	Resize the caption as neeeded.
			//------------------------------------------------------------
			self.captionResize();
			
			//------------------------------------------------------------
			//	Listen for return key.	
			//------------------------------------------------------------
			$( '.caption', self.elem ).keypress( function( _e ) {
				if ( _e.which == 13) {
					self.editSwitch();
				};
			});
			
			//------------------------------------------------------------
			//	Keep editable and static caption synched.
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
		//	Let the application know you've changed.
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
		//	Build a caption
		//------------------------------------------------------------
		var textarea = '<textarea class="caption">'+$( '.text', self.elem ).text()+'</textarea>';
		$( '.text', self.elem ).after( textarea );
		
		//------------------------------------------------------------
		//	Set the width of the caption textarea to the size of the 
		//	image and the height of the static caption.
		//------------------------------------------------------------
		 $( '.caption', self.elem ).css({ 
			width: $( '.view', self.elem).width()
		});
		
		//------------------------------------------------------------
		//	If a color has been set desaturate the color.
		//------------------------------------------------------------
		if ( self.culuh != undefined ) {
			$( '.caption', self.elem ).css({
				'background-color': self.culuh.sat( 0.35, true ).hex()
			});
		}
		$( '.caption', self.elem ).hide();
		
		//------------------------------------------------------------
		//	Switch between editable and static captions
		//------------------------------------------------------------
		$( '.text', self.elem ).on( 'touchstart click', function( _e ) {
			_e.preventDefault();
			self.editSwitch();
		});
		
		//------------------------------------------------------------
		//  Clicking outside a focused imgbit will uneditify them.
		//------------------------------------------------------------
		$( document ).on( 'touchstart click', function( _e ) {
			if ( $( _e.target ).html() == $( '.caption', self.elem ).html() ||
				 $( _e.target ).html() == $( '.text', self.elem ).html() ) {
				return;
			}
			self.editHide();
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
			//	There can only be one imgbit caption editor
			//	Calling editHide() on the prototype object will
			//	call that method for all instances.
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
		$( self.elem ).css({
			width: ( self.param.x2 - self.param.x1 ) * self.param.z
		});
	}
	
	/**
	 * Move the image into place
	 */
	imgbit.prototype.imgMove = function() {
		var self = this;
		$( 'img.star', self.elem ).css({
			width: self.imgWidth * self.param.z,
			height: self.imgHeight * self.param.z,
			left: self.param.x1*-1*self.param.z,
			top: self.param.y1*-1*self.param.z
		});
	}
	
	/**
	 * Show an imgbit sequence
	 *
	 * @param { obj } The sequence config.  See examples/imgbit/sequence
	 * @param { bool } Loop the sequence?
	 * @param { int } Current index of sequence
	 */
	imgbit.prototype.sequence = function( _sequence, _loop, _i ) {
		var self = this;
		//------------------------------------------------------------
		//  Default values
		//------------------------------------------------------------
		_i = ( _i != undefined ) ? _i : 0;
		_loop = ( _loop == undefined ) ? false : _loop;
		//------------------------------------------------------------
		//  Looping logic...
		//------------------------------------------------------------
		if ( _sequence.length <= _i ) {
			if ( _loop == true ) {
				self.sequence( _sequence, _loop, 0 );
			}
			return;
		}
		//------------------------------------------------------------
		//  Put sequence config in place
		//------------------------------------------------------------
		self.param.x1 = _sequence[ _i ]['coords'][0];
		self.param.y1 = _sequence[ _i ]['coords'][1];
		self.param.x2 = _sequence[ _i ]['coords'][2] + self.param.x1;
		self.param.y2 = _sequence[ _i ]['coords'][3] + self.param.y1;
		self.param.z = _sequence[ _i ]['coords'][4];
		var wipe = ( _sequence[ _i ]['wipe'] == undefined ) ? 1 : _sequence[ _i ]['wipe'];
		var stay = ( _sequence[ _i ]['stay'] == undefined ) ? 5 : _sequence[ _i ]['stay'];
		//------------------------------------------------------------
		//  Animate Transitions
		//------------------------------------------------------------
		$( 'img.star, .view', self.elem ).css({
			transition: "all " + wipe + "s",
			'-webkit-transition': "all " + wipe + "s"
		});
		$( self.elem ).css({
			transition: "all " + wipe + "s",
			'-webkit-transition': "all " + wipe + "s"
		});
		self.imgMove();
		self.viewCrop();
		//------------------------------------------------------------
		//  Captions, Captions, Captions
		//------------------------------------------------------------
		$( '.caption', self.elem ).hide();
		var caption = null;
		if ( 'caption' in _sequence[ _i ] ) {
			caption = _sequence[ _i ]['caption'];
			if ( self.options['style'] != 'min' || self.options['style'] != null ) {
				$( '.caption', self.elem ).show();
				self.setCaption( caption );
			}
		}
		//------------------------------------------------------------
		//  Next Frame!
		//------------------------------------------------------------
		_i++;
		setTimeout( function() {  
			self.sequence( _sequence, _loop, _i );
		}, (stay+wipe) * 1000 );
		//------------------------------------------------------------
		//  Alert the DOM of what you're doing.
		//  Passing along the caption for custom display.
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['frame'], { 'caption': caption } );
	}
	
	/**
	 * Turn GET parameter string into a JSON object
	 *
	 * @param { string } HTTP Get style string
	 * @return { obj } JSON
	 */
	imgbit.prototype.getToJson = function( _get ) {
		if ( _get == "" || _get == undefined ) return {};
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
	 * Turn imgbit into imgbit constructor HTML
	 * You know the markup you need to start imgbit
	 *
	 * @return { string } HTML representation
	 */
	imgbit.prototype.sequenceFormat = function() {
		var self = this;
		var x1 = parseInt( self.param.x1 );
		var y1 = parseInt( self.param.y1 );
		var width = parseInt( self.param.x2 ) - parseInt( self.param.x1 );
		var height = parseInt( self.param.y2 ) - parseInt( self.param.y1 );
		var zoom = self.param.z;
		var output = {
			coords: [ x1, y1, width, height, zoom ],
			caption: self.caption
		};
		return output;
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
		output[0] = self.param.x1 / self.imgWidth;
		output[1] = self.param.y1 / self.imgHeight;
		output[2] = ( self.param.x2 - self.param.x1 ) / self.imgWidth;
		output[3] = ( self.param.y2 - self.param.y1 ) / self.imgHeight;
		for( var i=0, ii=output.length; i<ii; i++ ) {
			output[i] = output[i].toFixed(4);
		}
		return output;
	}
	
	/**
	 * @return { boolean }
	 */
	imgbit.prototype.toExplicit = function() {
		var self = this;
		if ( self.param.w <= 1 && self.param.h <= 1 && self.param.x <= 1 && self.param.y <= 1 ) {
			self.param.x1 = self.param.x * self.imgWidth;
			self.param.y1 = self.param.y * self.imgHeight;
			self.param.x2 = self.param.x1 + self.param.w * self.imgWidth;
			self.param.y2 = self.param.y1 + self.param.y * self.imgHeight;
			delete self.param.x;
			delete self.param.y;
			delete self.param.w;
			delete self.param.h;
		}
	}
	
	/**
	 * Returns an imgbit transcription in open annotation spec JSON
	 *
	 * @param { json } JSON with additional info 
	 *				   needed to construct a complete JSON LD object
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