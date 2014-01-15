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
		
		//------------------------------------------------------------
		// Store the imgspect instance
		//------------------------------------------------------------
		self.imgspect = null;
		self.load = function( _img ) {
            //------------------------------------------------------------
            // Load the image
            //------------------------------------------------------------
            $('#imgspect').append( _img );
            self.imgspect = $('#imgspect img').imgspect().data('#imgspect img');
			self.urn = self.getUrn();
            $( self.imgspect.elem ).on( 'IMGSPECT-UPDATE', function() {
                for ( var i=0, ii=self.imgspect.imgbits.length; i<ii; i++ ) {
					console.log( urn );
                    console.log( self.imgspect.imgbits[i].citeCoords() );
                }
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
			 */
			start: function() {
			    //------------------------------------------------------------
			    // Images have been loaded.
			    //------------------------------------------------------------
			    $(document).on( 'IMGSPECT-LINKS_LOADED', function() {	
			      	//------------------------------------------------------------
			      	// Once an image is clicked.
			      	//------------------------------------------------------------
			      	$('.imgUrn').click( function( _e ) {
			          $('#imgspect').empty();
			          var img = new Image();
			          img.onload = function() {
        				  self.load( this );
			          }
			          var src = $(this).attr('rel');
			          img.src = src;
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