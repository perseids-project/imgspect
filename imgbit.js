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
			closed: 'IMGBIT-CLOSED'
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
		
		//------------------------------------------------------------
		//	Check to see if img is in album
		//------------------------------------------------------------
		self.build();
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
		_i = ( _i != undefined ) ? _i : 0;
		_loop = ( _loop == undefined ) ? false : _loop;
		if ( _sequence.length <= _i ) {
			if ( _loop == true ) {
				self.sequence( _sequence, _loop, 0 );
			}
			return;
		}
		self.param.x1 = _sequence[ _i ]['coords'][0];
		self.param.y1 = _sequence[ _i ]['coords'][1];
		self.param.x2 = _sequence[ _i ]['coords'][2];
		self.param.y2 = _sequence[ _i ]['coords'][3];
		self.param.z = _sequence[ _i ]['coords'][4];
		var wipe = _sequence[ _i ]['wipe'];
		var stay = _sequence[ _i ]['stay']
		//------------------------------------------------------------
		//  animate transitions
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
		$( '.text', self.elem ).hide();
		if ( 'caption' in _sequence[ _i ] ) {
			$( '.text', self.elem ).show();
			self.setCaption( _sequence[ _i ]['caption'] );
		}
		_i++;
		setTimeout( function() {  
			self.sequence( _sequence, _loop, _i );
		},(stay+wipe)*1000 );
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
