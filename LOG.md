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

## 2013-12-18

### imgspect

Just tried to clean-up the layout and improve the user experience today.
I'm a sucker for aesthetics.
It's in a good place.
I just need to button up a few things.
Like imgbit colors.
Being able to delete imgbits from the drop-down.
Maybe have the imgbits in the drop-down record zoom levels too.

And output events, naturally.
That's still broken.

And I need to add CITE URN support.
And roll the whole thing into Perseids.

It's a great prototype I'd say.
I might refactor.
Breakout the nav, draw area, drop-down, and tools and output into their own modules, imgspect.js is getting to be a bit of a beast.

## 2013-12-23

### imgspect

I haven't begun the integration into sosol or other perseids services yet.
That's going to be challenging and I've delayed taking the plunge until after the holiday when I can have enough uninterrupted time to do it properly.
It's not something I can pick up and put down easily.

Today I decided to start fixing up some minor issues that would have eventually reared their ugly head.
So I added "left-handed" highlighting.

In the near future I should fix issues with the zoom.
	Let me list those issues to begin...

* When zooming in the center of the view should be the focus.  Right now it's the upper-left corner.
* Drag rectangle should stay constrained in the nav preview.  It's an eyesore to see it pop-out of it's cage.

## 2013-12-30

### imgspect

* Drag rectangle should stay constrained in the nav preview.  It's an eyesore to see it pop-out of it's cage.

Fixed!

* When zooming in the center of the view should be the focus.  Right now it's the upper-left corner.

Mostly fixed.  There are some issues... there is slight shifting at high zoom levels.  I don't know what's causing it just yet.

There are more important problems I need to work out.  The first problem I should tackle is creating x buttons on the imgbits to delete them.

## 2014-01-06

### imgspect

So let me reiterate my tasks.

1. Fix the imgbit removal bug.
2. Fix the zoom.
3. Roll into perseids.

12:55 - So I think I just fixed the imgbit removal bug.

Rolling into perseids... 
That's where things get tricky...  
Let's do a little research first... 
Development begins on sosol-test

ubuntu@sosol-test:~$ cd /usr/local/sosol/
ubuntu@sosol-test:/usr/local/sosol$ jruby -S script/server 
http://sosol-test.perseids.org:3000/

//------------------------------------------------------------
//  So let's get adjusted.
//  Log output is here.
//  What files are these associated with?
//------------------------------------------------------------
Processing EpiCtsIdentifiersController#editxml
Rendering template within layouts/perseus >> ./app/views/layouts/perseus.haml

sudo vim ./app/views/layouts/perseus.haml

	So this is the main wrapper template I believe.

So where is the #editxml content

	./app/controllers/epi_cts_identifiers_controller.rb

	sudo vim ./app/controllers/epi_cts_identifiers_controller.rb

    def editxml
      find_identifier
      @identifier[:xml_content] = @identifier.xml_content
      @is_editor_view = true
      render :template => 'epi_cts_identifiers/editxml'
    end

find . | grep editxml

	sudo vim ./app/views/epi_cts_identifiers/editxml.haml
		render :partial => 'identifiers/edit_commit'

Edit commit

	sudo vim ./app/views/identifiers/_edit_commit.haml

This is what needs to change.

    %iframe{:id => 'ict_frame'}

So let's add imgspect as a submodule in this directory.

	/usr/local/sosol/public/javascripts
	git submodule add https://github.com/PerseusDL/imgspect public/javascripts/imgspect
	git submodule update --init --recursive

So everything needed is working.

	http://sosol-test.perseids.org:3000/javascripts/imgspect/examples/imgspect/basics/index.html

Ok so let's just load the example imgspect app. I need to load these files in the HAML template.


	<link rel="stylesheet" href="../../../third_party/menumucil/css/menumucil.css">
	<link rel="stylesheet" href="../../../css/imgspect.css">
	<link rel="stylesheet" href="../../../css/imgbit.css">
		
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
	<script src="../../../third_party/jslib/src/js/StringExt.js"></script>
	<script src="../../../third_party/jslib/src/js/Culuh.js"></script>
	<script src="../../../third_party/menumucil/menumucil.js"></script>
	<script src="../../../imgspect.js"></script>
	<script src="../../../imgbit.js"></script>

	%link{:rel => "stylesheet", :type => "text/css", :href => "/javascripts/imgspect/third_party/menumucil/css/menumucil.css"}
	%link{:rel => "stylesheet", :type => "text/css", :href => "/javascripts/imgspect/css/imgspect.css"}
	%link{:rel => "stylesheet", :type => "text/css", :href => "/javascripts/imgspect/css/imgbit.css"}
	%script{:src => "/javascripts/imgspect/third_party/jslib/src/js/StringExt.js"}
	%script{:src => "/javascripts/imgspect/third_party/jslib/src/js/Culuh.js"}
	%script{:src => "/javascripts/imgspect/third_party/menumucil/menumucil.js"}
	%script{:src => "/javascripts/imgspect/imgspect.js"}
	%script{:src => "/javascripts/imgspect/imgbit.js"}

Add the imgspect source image

	%img{:src => "/javascripts/imgspect/examples/img/the-garden-of-earthly-delights.jpg" :id => "bosch"}

HAML format is very touchy when it comes to whitespace.

So I need to come up with a decent workflow.  I'll just scp the files to the server and refresh I suppose.  Not ideal but it will work.

	scp /var/www/imgspect/imgspect.js sosol-test:/usr/local/sosol/public/javascripts/imgspect/imgspect.js

Links I'll need.

	http://sosol-test.perseids.org:3000/
	http://sosol-test.perseids.org:3000/publications/4/epi_cts_identifiers/6/editxml
	http://sosol-test.perseids.org:3000/javascripts
	http://sosol-test.perseids.org:3000/javascripts/imgspect/examples/imgspect/basics/index.html


## 2014-01-07

So I've been getting some nasty errors.
I think they have to do with prototype.js

	[each: function, eachSlice: function, all: function, any: function, collect: function…]

What library extends a base class so you can't even iterate over the array reliably?!
Who wrote this crap?
Break everybody else's code that don't fit your pet paradigm.
Arghghghghggh!!!

	= render :partial => 'identifiers/header'

http://prototypejs.org/doc/latest/language/Array/
Don't use for..in loops because 
I hate these kinds of developers.  Purists.  Creating problems where they don't have to exist... 

God listen to these morons...

"This same standard explicitly defines that the for...in construct (§12.6.4) exists to enumerate the properties of the object appearing on the right side of the in keyword. Only properties specifically marked as non-enumerable are ignored by such a loop. By default, the prototype and length properties are so marked, which prevents you from enumerating over array methods when using for...in. This comfort led developers to use for...in as a shortcut for indexing loops, when it is not its actual purpose.

However, Prototype has no way to mark the methods it adds to Array.prototype as non-enumerable. Therefore, using for...in on arrays when using Prototype will enumerate all extended methods as well, such as those coming from the Enumerable module, and those Prototype puts in the Array namespace (listed further below)."

Okay

