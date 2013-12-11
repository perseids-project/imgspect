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

# Work Log and Brainstorming
## 2013-12-09

So right now my interface does not move highlighted areas in the viewport.
I was thinking that I should create a clear canvas to overlay over the image and just draw to that canvas.  
Problems arise though... It would make click handling a bit trickier.
Having the highlighted areas in the DOM seems more scalalbe.
I'm conflicted.

## 2013-12-10
### imgspect
I have a working solution for my problem yesterday.
Highlighted areas are still drawn in the DOM.
But they're all children of one container div.
This div is moved when the areas need to be translated.
Scaling requires that the highlighted areas be redrawn, because I couldn't reliably make the highlited areas percentages of the parent container.
So I'm redrawing them.
It shouldn't be too costly.
Zoom/scaling events aren't as granular as translations.

### imgbit
I thought I'd be clever and make an album area in the DOM so I wouldn't have to redownload images if several imgbit instances were created for a page, but really what browser doesn't do this already.  
I'm going to scrap it.
That should simplify things.

## 2013-12-11
### imgspect
So I made it so hi-res images can be navigated.
I feel good about that.

I would like to make the nav and draw areas resizable by the user.  
Maybe just a draggable button in the lower right corner of the draw area.
The nav will resize just to fit the width of the browser?
I think that could work pretty well.

Also the ability to change the hilite color and opacity would be useful.
Multiple hilite colors?
I dunno...