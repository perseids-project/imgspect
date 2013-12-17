# imgspect
**imgspect** is a jQuery plugin for exploring images.  You can zoom, pan, and hi-lite areas of interest.  Use it in conjunction with imgbit for cropping and scaling images without Photoshop.

**imgbit** is the plugin that will display areas you hi-lite with imgspect.

## Requirements
* jQuery ( http://jquery.com )
* jQuery UI Draggable ( http://jqueryui.com/draggable )
* menumucil ( https://github.com/caesarfeta/menumucil )

## Install
	cd [javascript directory]
	git clone https://github.com/caesarfeta/menumucil.git menumucil
	cd menumucil
	git submodule update --init

## Use
### imgspect
	coming soon...

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
I need to a proof of concept on that in the basics example.  I'll do that now...

So I added the ability to find a lite in context.
In the example you can click an imgbit below the main app area and your draw area will find the corresponding lite.
The animation effect is eye-candy but it's useful to for getting a sense of where lites are positioned relative to one another.
JQuery's animate function can be a resource hawg.
Maybe they've improved it, or maybe my development laptop is too new and too fast.
I'll have to test it on a clunker.

Undo feature works now.  I'm going to move some of the code hacked together on the basics example page into the plugin itself once I wrap my head around a few things.

So let me think through some of the feedback.

	* maybe it would be nice to position the imgbit snippets overlayed on top of the base image, 
	with the ability to toggle its visibility?

So if I'm imagining this right the snippets would basically be floating over the view area, and you can show or hide them, instead of the grid of imgbits being appended to the bottom.  I can see that being visually confusing unless I add a semi transparent black background behind the imgbits and over the whole view area.  Right now appending the imgbits at the bottom is not ideal because depending on the height of your display they could be hidden.  I'll have to give this some thought.  If done well this could be attractive / easy to use.

	* love the undo feature - needs to apply to the 'nav' image and the imgbit snippets too

It should be fixed now...

	* can we enable the zoom on the imgbit snippets too?

There is something like a zoom.  You can set explicit scale, width, or height now.  But an interactive scale after the imgbit is created could be neat.  If the dimensions change it could really mess up page layouts though, and if the image gets clipped like in imgspect's view area I would need to come up with a UI to pan.  The nav dragger system in imgspect wouldn't really work. That could get tricky because the imgbit areas potentially can be really small.  The dimension changing approach could work if the max size could be set and could be accounted for in the layout.

	* how are you planning on handling the urn? Maybe if a data-urn attribute is specified on the 
	img src tag it could trigger CITE URN specific functionality? 
	(Namely, the creation of a new URN with the coordinates of the ROI when the drag event ends).

Change events are being triggered, so I could build a little module that could listen in and build the URNs of all the ROIS separate from the main imgspect app.  

When starting the app CITE URNs could be translated to the GET params system I'm using now.  It's javascript so all the data ends up in JSON.  GET params > JSON or CITE URN > GET params > JSON it shouldn't be hard to translate.

	* was thinking it would be really nice if we could enable something like the following: 
	user types facs="" in the editing area, and clicks in the middle of the "" - this triggers 
	the start of an event pointing at those coordinates on the page - then the user selects a 
	roi on the image - the newly created URN is displayed and when they click on it it gets copied 
	to the coordinates of the original click.  What do you think? I would want the behavior that 
	triggers the start of the whole event to be a plugin class that could be applied to any element.

I was thinking that the transcription could be done through the UI.
Each imgbit gets a text input box below it and people can do the transcription right there.
Then I could have another little widget that transforms the imgbit 
and transcription into an XML tag and displays the xml in a small textarea.
Then the user has to copy and paste the tags into the main epidoc text area and save.

### imgbit

Explicit heights can now be set.  This will make certain kinds of layouts possible, plus why not, right?  Low hanging fruit.

## 2013-12-13

11:00 - You can now select from three colors.
Not a trivial feature.
You never know what colors contrast best with the image you're working on.
I like semi transparent areas of color over just borders of color.
I think they're a lot simpler to use visually.
Plus they can be used for categorization and sorting later on if we want to add that feature.

Now I need to figure out how to layout the imgbit grid.
Below the main app area with explicit heights ain't cuttin' it for me.

3:32 - So I found my old menumucil project.  
I created a github repo for it.
imgspect will pull it in as a submodule now.
It will create a imgbit grid drop-down over the main app area.

## 2013-12-16

### imgbit

Added the ability to set colors with parameters.  Added caption editing functionality.

### imgspect

I think I should replace the drop down menu from the top with one that will rise from the bottom.
It makes more sense to cover the nav and tools than the main draw area.

I also need to roll some of the javascript code in the example page into the plug-in itself.
I will spend some time doing that tomorrow.
Other than that I need to work on displaying output.
By default I think that output should be imgbit constructors, but I'll add the ability to turn it into epidoc facs XML fragments with a constructor option.

## 2013-12-17

### imgspect

I'm realizing I should breakout lites into their own class.
Things are starting to get a bit unruly...
Started work on the output window.