/*!
 * PerseidsBridge
 *
 * Makes imgspect and Perseids/Sosol play nicely together.
 */
var PerseidsBridge = PerseidsBridge || { REVISION: '1' };
PerseidsBridge.imgspect = ( function() {
    var instance;
    function _init() {
        var self = this;
        
        self.imgspect = null;
        self.output = null;
        self.warning = null;
        self.img = null;
		self.w_tags = {};
		        
        /**
         * Load imgspect
         */
        self.load = function( _override ) {
            _override = ( _override == undefined ) ? false : _override;
            
            //------------------------------------------------------------
            // Display the warning dialog if new thumbnail is clicked
            //------------------------------------------------------------
            if ( self.imgspect != null && _override == false ) {
				self.buildWarning();
                self.warning.popup();
                return;
            }
			
			//------------------------------------------------------------
			//  Build the wait screen
			//------------------------------------------------------------
			self.buildWait();
			self.warning.popup();
            
            //------------------------------------------------------------
            // Visually id the selected thumbnail
            //------------------------------------------------------------
            $('.imgUrn').removeClass('selected');
            $('.imgUrn[rel="'+self.img.src+'"]').addClass('selected');
            
            //------------------------------------------------------------
            // Load the image.
            //------------------------------------------------------------
            $('#imgspect').empty();
            $('#imgspect').append( self.img );
            self.imgspect = $('#imgspect img').imgspect().data('#imgspect img');
            self.urn = self.getUrn();
            
            //------------------------------------------------------------
            // Update the background color of the thumbnail area
            //------------------------------------------------------------
            $('#ict_tool').addClass( 'imgspectLoaded' );
            
            //------------------------------------------------------------
            // Everytime imgspect changes update the output.
            //------------------------------------------------------------
            $( self.imgspect.elem ).on( 'IMGSPECT-UPDATE', function() {
                var tags = self.buildTags();
                $('.imgspect .output' ).val( tags.join("\n\n") );
            });
        };
        
        /**
         * Get the FACS you need
         */
        self.buildTags = function() {
            var tags = [];
            for ( var i=0, ii=self.imgspect.imgbits.length; i<ii; i++ ) {
                var fullUrn = self.urnCoords( i );
                var caption = self.imgspect.imgbits[i].caption;
                tags[i] = '<w facs="' + fullUrn + '">' + caption + '</w>';
            }
            return tags;
        };
        
        /**
         * Get the URN coordinates
         */
        self.urnCoords = function( _i ) {
            var coords = self.imgspect.imgbits[ _i ].citeCoords();
            return self.urn + '@' + coords.join(',');
        };
        
        /**
         * Build the warning
         */
        self.buildWarning = function() {
            $('#imgspectWarning').remove();
            $('body').append( '\
                <div id="imgspectWarning">\
                    <p>\
                        Switching images will reset imgspect. \
                    </p>\
                    <p>\
                        You will lose your highlights and captions \
                        if you have have not copied them to your main XML document.\
                    </p>\
                    <p>\
                        Do you want to CONTINUE?\
                    </p>\
                    <div id="imgspectButtons">\
                        <a id="imgspectWarningOk" href="">CONTINUE</a>\
                        <a id="imgspectWarningCancel" href="">CANCEL</a>\
                    </div>\
                </div>' );
            self.warning = $('#imgspectWarning').plopup({button:'x'}).data('#imgspectWarning');
            $( '#imgspectWarningOk' ).click( function( _e ) {
                self.load( true );
                _e.preventDefault();
            });
            $( '#imgspectWarningCancel' ).click( function( _e ) {
                self.warning.hide();
                _e.preventDefault();
            });
        };
		
        /**
         * Build the wait screen
         */
        self.buildWait = function() {
            $('#imgspectWarning').remove();
            $('body').append( '\
                <div id="imgspectWarning">\
                    <p>\
                        Loading hi-res image.\
                    </p>\
                    <p>\
						This may take a while.\
                    </p>\
					<div class="space"><img src="/javascripts/imgspect/src/img/ajax-loader.gif" /></div>\
                </div>' );
            self.warning = $('#imgspectWarning').plopup({ button:'x' }).data('#imgspectWarning');
			
			//------------------------------------------------------------
			//  When imgspect is ready the warning gets removed... natch
			//------------------------------------------------------------
			$( document ).on( 'IMGSPECT-READY', function() {
				$('#imgspectWarning').remove();
			});
        };
        
        /**
         * Retreive CITE urn
         */
        self.getUrn = function() {
            var obj = self.imgspect.src.params();
            return obj['urn'];
        };
		
        /**
         * Retreive ImgBit coordinates from XML string
		 *
		 * @ param { string } _xml An XML string
         */
		self.getTags = function( _xml ) {
			var self = this;
			var xmlDoc = $.parseXML( _xml.smoosh() );
			var xml = $( xmlDoc );
			xml.find( "w" ).each( function() {
				//------------------------------------------------------------
				//  Extract the info you need to build an imgbit from the XML
				//------------------------------------------------------------
				var caption = this.innerHTML;
				var facs = $(this).attr('facs');
				var info = facs.split('@');
				var urn = info[0];
				var nums = info[1];
				var coords = nums.split(',');
				
				//------------------------------------------------------------
				//  Store the info in a handy format.
				//------------------------------------------------------------
				if ( !( urn in self.w_tags ) ) {
					self.w_tags[urn] = [];
				}
				self.w_tags[urn].push( {
					caption: caption,
					coords: coords
				});
			});
		};
		
        /**
         * Add a click event listener
		 *
		 * @ param { string } _selector jQuery selector string
         */
		self.clickListen = function( _selector ) {
			var self = this;
            //------------------------------------------------------------
            // Once an image is clicked.
            //------------------------------------------------------------
            $( '#'+_selector ).click( function( _e ) {
                _e.preventDefault();
                //------------------------------------------------------------
                //  Check to see if the clicked image has currently been
                //  loaded.
                //------------------------------------------------------------
                var src = $(this).attr('href');
                if ( self.imgspect != null && self.imgspect.src == src ) {
                    return;
                }
                //------------------------------------------------------------
                // Load the new image
                //------------------------------------------------------------
                self.img = new Image();
                self.img.onload = function() {
                    self.load();
                }
                self.img.src = src;
			});
		};
		
        /**
         * Turn self.w_tags into Imgspect highlights and imgbits
		 *
		 * @ param { string } _xml An XML string
         */
		self.loadTags = function () {
			var self = this;
			
			//------------------------------------------------------------
			//  Check to see if src has w_tags associated with it
			//------------------------------------------------------------
			if ( self.w_tags != undefined && !( self.imgspect.src in self.w_tags ) ) {
				return;
			}
			
			//------------------------------------------------------------
			//  Hey there are w_tags!  Let's convert some coordinates.
			//------------------------------------------------------------
			var src = self.imgspect.src;
			var width = self.imgspect.orig_w;
			var height = self.imgspect.orig_h;
			for ( var i=0, ii=self.w_tags[ src ].length; i<ii; i++ ) {
				var coords = self.w_tags[src][i].coords;
				var x1 = Math.floor( coords[0] * width );
				var y1 = Math.floor( coords[1] * height );
				var x2 = Math.floor( coords[2] * width ) + x1;
				var y2 = Math.floor( coords[3] * height ) + y1;
				self.imgspect.liteAdd( x1, y1, x2, y2 );
				self.imgspect.imgbits[i].setCaption( self.w_tags[src][i].caption );
			}
			
			//------------------------------------------------------------
			//  Update the location of all the highlights
			//------------------------------------------------------------
			self.imgspect.resize();
		};
        
        return {
			//------------------------------------------------------------
			//  Revealed properties
			//------------------------------------------------------------
            imgspect: self.imgspect,
			w_tags: self.w_tags,
			
            /**
             * Build imgspect links
             *
             * @ param { obj } _elem
             * @ param { obj } _results
             */
            buildLinks: function( _elem, _results ) {
                var url = "http://services.perseus.tufts.edu/sparqlimg/api?request=GetBinaryImage&urn=";
                for ( var i=0, ii=_results.length; i<ii; i++ ) {
                    var imgUrn = '<a id="imgUrn_'+i+'"class="imgUrn" href="' + url + _results[i] + '&w=3000"><img src="'+ url + _results[i] + '&w=100"/></a>';
                    jQuery( _elem ).append( imgUrn );
					self.clickListen( imgUrn.attr('id'))
                }
            },
			
            /**
             * See self.getTags() function declaration above.
             */			
			getTags: self.getTags,
			
            /**
             * See self.buildTags() function declaration above.
             */			
			buildTags: self.buildTags,
			
            /**
             * See self.loadTags() function declaration above.
             */			
			loadTags: self.loadTags,
            
            /**
             * See self.load() function declaration above.
             */
            load: self.load,
			
			clickListen: self.clickListen,
            
            /**
             * Once imgspect links are loaded add some event listeners
             */
            start: function() {
           	 	$( document ).on('IMGSPECT-LINK_LOADED', function( _e, _id ) {
					self.clickListen( _id );
           	 	});
            }
        }
    };
    //--------------------------
    //  There can only be one!  
    //--------------------------
    return {
        init: function () {
            if ( ! instance ) {
                instance = _init();
            }
            return instance;
        }
    };
})();