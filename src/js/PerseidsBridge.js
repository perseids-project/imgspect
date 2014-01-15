var PerseidsBridge = PerseidsBridge || { REVISION: '1' };
PerseidsBridge.imgspect = ( function() {
	var instance;
	function _init() {
		var self = this;
		self.imgspect = null; // store the imgspect instance
		
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
        
			              //------------------------------------------------------------
			              // Load the image
			              //------------------------------------------------------------
			              $('#imgspect').append( this );
			              self.imgspect = $('#imgspect img').imgspect().data('#imgspect img');
			              $(self.imgspect.elem).on( 'IMGSPECT-UPDATE', function() {
			                  for ( var i=0, ii=self.imgspect.imgbits.length; i<ii; i++ ) {
			                      console.log( self.imgspect.imgbits[i].citeCoords() );
			                  }
			              });
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