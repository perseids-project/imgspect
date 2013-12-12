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

## 2013-12-12
### imgspect
Feedback:

		Some thoughts
		* maybe it would be nice to position the imgbit snippets overlayed on top of the base image, 
		with the ability to toggle its visibility?
		
		* love the undo feature - needs to apply to the 'nav' image and the imgbit snippets too
		
		* can we enable the zoom on the imgbit snippets too?
		
		* how are you planning on handling the urn? Maybe if a data-urn attribute is specified on the 
		
		img src tag it could trigger CITE URN specific functionality? 
		(Namely, the creation of a new URN with the coordinates of the ROI when the drag event ends).
		
		* was thinking it would be really nice if we could enable something like the following: 
		user types facs="" in the editing area, and clicks in the middle of the "" - this triggers 
		the start of an event pointing at those coordinates on the page - then the user selects a 
		roi on the image - the newly created URN is displayed and when they click on it it gets copied 
		to the coordinates of the original click.  What do you think? I would want the behavior that 
		triggers the start of the whole event to be a plugin class that could be applied to any element.		

I improved the undo features.
Lites now have ids which will make zeroing in on them easy / possible.
I might breakout lites into their own class if they get any more complex.
Added the goTo and showLite methods which will make it possible to find the context of an imgbit.
I need to a proof of concept on that in the basics example.  I'll do that now.