# imgspect
**imgspect** is a plugin that will let you explore any image displayable by a browser by zooming and panning, but the most useful feature is the ability to highlight areas of interest and write little notes associated with the highlighted areas.

Also included is **imgbit**.

**imgbit** is a plugin that will display only a small area of a larger image.

## Used best for...
Why use **imgbit** instead of Photoshop or some other image editor for image cropping?

	Make your case, Adam.

## How to use...
### imgspect
	<html>
		<head>
			<!-- Load the imgspect stylesheet -->
			<link rel="stylesheet" href="imgspect/css/imgspect.css">
		</head>
		<body>
			<img id="butterfly" src="/img/morpho_butterfly.jpg" />
		</body>
		
		<!-- Required third-party libraries -->
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
		
		<!-- Load the imgspect javascript -->
		<script src="imgspect/imgspect.js"></script>
		
		<script type="text/javascript">
			$(window).load( function(){
				$( '#butterfly' ).imgspect();
			});
		</script>
	</html>

### imgbit
	coming soon...

# Work Log... Brainstorming
2013-12-09

So right now my interface does not move highlighted areas in the viewport.
I was thinking that I should create a clear canvas to overlay over the image and just draw to that canvas.  
Problems arise though... It would make click handling a bit trickier.
Having the highlighted areas in the DOM seems more scalalbe.
I'm conflicted.