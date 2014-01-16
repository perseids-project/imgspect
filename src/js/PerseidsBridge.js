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
		
		/**
		 * Load imgspect
		 */
		self.load = function( _override ) {
			_override = ( _override == undefined ) ? false : _override;
			
			//------------------------------------------------------------
			//  Display the warning dialog
			//------------------------------------------------------------
			if ( self.imgspect != null && _override == false ) {
				self.warning.popup();
				return;
			}
			
            //------------------------------------------------------------
            // Load the image.
            //------------------------------------------------------------
			$('#imgspect').empty();
            $('#imgspect').append( self.img );
            self.imgspect = $('#imgspect img').imgspect().data('#imgspect img');
			self.urn = self.getUrn();
			
			//------------------------------------------------------------
			//  Everytime Imgspect changes update the output.
			//------------------------------------------------------------
            $( self.imgspect.elem ).on( 'IMGSPECT-UPDATE', function() {
				var tags = self.getTags();
				$('#' + self.output ).val( tags.join("\n") );
            });
			
			//------------------------------------------------------------
			//  Build the warning.
			//------------------------------------------------------------
			self.buildWarning();
		};
		
		/**
		 * Get the FACS you need
		 */
		self.getTags = function() {
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
					You will lose your highlights and captions \
					if you have have not copied them to your main XML document.\
					</p>\
					<div id="imgspectButtons">\
						<a id="imgspectWarningOk" href="">OK</a>\
						<a id="imgspectWarningCancel" href="">Cancel</a>\
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
		 * Retreive CITE urn
		 */
		self.getUrn = function() {
			var obj = self.imgspect.src.params();
			return obj['urn'];
		};
		
		return {
			
			/**
			 * Build imgspect links
			 *
			 * @ param { obj } _elem
			 * @ param { obj } _results
			 */
			buildLinks: function( _elem, _results ) {
				var url = "http://services.perseus.tufts.edu/sparqlimg/api?request=GetBinaryImage&urn=";
				for ( var i=0, ii=_results.length; i<ii; i++ ) {
					var imgUrn = '<a class="imgUrn" rel="' + url + _results[i] + '&w=3000"><img src="'+ url + _results[i] + '&w=100"/></a>';
					jQuery( _elem ).append( imgUrn );
				}
				jQuery( document ).trigger( 'IMGSPECT-LINKS_LOADED' );
			},
			
			/**
			 * See self.load() function declaration above.
			 */
			load: self.load,
			
			/**
			 * Once imgspect links are loaded add some event listeners
			 *
			 * @param { string } The id of the textarea for imgspect output
			 */
			start: function( _output ) {
				self.output = _output;
				
			    //------------------------------------------------------------
			    // Images have been loaded.
			    //------------------------------------------------------------
			    $(document).on( 'IMGSPECT-LINKS_LOADED', function() {	
			      	//------------------------------------------------------------
			      	// Once an image is clicked.
			      	//------------------------------------------------------------
			      	$('.imgUrn').click( function( _e ) {
			          self.img = new Image();
			          self.img.onload = function() {
        				  self.load();
			          }
			          var src = $(this).attr('rel');
			          self.img.src = src;
			          _e.preventDefault();
				  });
			  	});
			}
		}
	};
	//--------------------------
	//	There can only be one!	
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