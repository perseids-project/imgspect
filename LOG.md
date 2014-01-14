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
Break all code that doesn't fit your ideals.
Fascists!
Arghghghghggh!!!

	= render :partial => 'identifiers/header'

http://prototypejs.org/doc/latest/language/Array/
Don't use for..in loops because...

"This same standard explicitly defines that the for...in construct (§12.6.4) exists to enumerate the properties of the object appearing on the right side of the in keyword. Only properties specifically marked as non-enumerable are ignored by such a loop. By default, the prototype and length properties are so marked, which prevents you from enumerating over array methods when using for...in. This comfort led developers to use for...in as a shortcut for indexing loops, when it is not its actual purpose.

However, Prototype has no way to mark the methods it adds to Array.prototype as non-enumerable. Therefore, using for...in on arrays when using Prototype will enumerate all extended methods as well, such as those coming from the Enumerable module, and those Prototype puts in the Array namespace (listed further below)."

I can't stand this kind of attitude.
Purists.
Idealogues.
Hmmmmm... No wonder everyone is using jQuery instead...

## 2014-01-07 (BALMAS FEEDBACK)

Requirements/Ideas for Perseids integration:

### CITE URN Functionality
This could be triggered in a general way by either of the following on the image element for which imgspect() is triggered:
* @src URL value which references urn:cite:.... as the last path element
    * this would be the case if we have proxy resolution of CITE served images e.g. at http://data.perseus.org/images/urn:cite:perseus:epifacsimg.1
* @resource value containing a CITE urn 

Imgspect and Imgbit would each have an non-null URN property if 
one of the above conditions is met. For imgbit, the coordinates of the selected ROI of interest would be appended to the URN

### Export/Serialization

Add Export option which creates an ordered JSON object of serialized imgbits (see below) and either:
* if a callback function specified as a parameter to the imgspect constructor, then the JSON object is sent as the first argument to that function
* if no callback is supplied, then the seraialized object is just offered for download

Serialization format:
* use OAC data module, JSON-LD output format (http://www.openannotation.org/spec/core/)
* perhaps the motivation could be an extension of oa:describing, defined as oa:transcribing?
* serializedBy provAgent identifying the imgspect tool and version #
* include serializedDate
* annotatedBy foaf:agent could be provided either by calling app in imgspec contructor or as an optional user-entered item (nice to support both but not essential at this stage)
* target URI is either the CITE URN or image url (both with properly configured ROI coordinates) depending upon construction options as above
* body is inline content item
    * either cntAsText or cntAsXML 
    * cntAsXML could be triggered on imgspec constructor configuration option
        * UI could ask user to select semantic tag of region highlighted as one of the options available from EpiDoc (w, c, gap, ..)
        * with targetURI (but see below notes on integration) inserted as @facs attribute value

### Perseids SoSOL Integration
Assuming the above functionality, then we could do something like:

* have an interface element that allows the user to scroll through the available images for a text (replacing the dropdown and  iframe of the ICT tool, but populated in the same way from the PerseidsLD Linked Data query)
* activate a double-click handler on the text input area of the Perseids edit interface that activates imgspect on the currently visible image and supplies a function as a callback which 
    * parses the text body(ies) from JSON-LD object of annotations 
    * inserts it at the X/Y coordinates of the doubleclick 

Note: Ultimately I'd like to  eliminate the use of the @facs attribute at all, and instead have the image mappings just kept as a separate related data file of annotations. This relies on some API functionality that isn't yet fully developed in SoSOL though so the above approach is provisional and the callback functionality would change to this when the Perseids SoSOL API is ready for it.

What do you think?

## 02:09:40 PM

## Reaction to ( BALMAS FEEDBACK )

Okay let me get my ducks in a row...

We need to serve up images to the imgspect tool.
Each of those images needs a unique id aka the CITE URN...

	http://data.perseus.org/images/urn:cite:perseus:epifacsimg.1

our data ( image ) server: 

	http://data.perseus.org/images/

the cite urn: 

	urn:cite:perseus:epifacsimg.1

Imgspect can accept a URN without any coordinates.
Imgbit needs coordinates otherwise it's just an image.
Here's what the urn will look like with coordinates

	urn:cite:perseus:epifacsimg.1 [coming soon!]

So we have images and associated URNs without ROIs defined.
So we need to get those images into imgspect.
Right now we have a drop-down with the URN name as the means of selection.
This is not optimal.
It would be best to have an image preview of each image associated with a text.
Clicking the image preview will open it inside of imgspect.
This will be trivial to implement really, as long as image previews are available...

So we need a serialized object to get data in and out of imgspect.
That object is essentially an array of JSON-LD objects in Open Annotation format.
So if I can define this object I will know how to proceed.

So I'm trying to piece this together from Bridget's notes...

	* body is inline content item
	    * either cntAsText or cntAsXML 
	    * cntAsXML could be triggered on imgspec constructor configuration option
	        * UI could ask user to select semantic tag of region highlighted as one of the options available from EpiDoc (w, c, gap, ..)
	        * with targetURI (but see below notes on integration) inserted as @facs attribute value

I really don't understand what she means.  
I'll have to ask her for clarification.

In the meantime I'll define to the best of my ability the complete JSON-LD export object.

	var citations=[
		{
			"@context": "",
			"@id": "",
			"@type": "",
			"serializedBy": "Imgspect-0.1"
			"annotatedAt": "",
			"annotatedBy": {
				"@id" : "",
				"@type": "foaf:Person",
				"name": "Person One"
			}
			"hasBody": {
			},
			"hasTarget": {
			}
		},
	];

Imgspect's dump method will help me to get a handle on its internal datastructure.
It just prints the plugins variables and structure to the console.
Once I get the JSON-LD object defined creating export and load methods should be easy.

The only thing I'm really concerned with is the imgbit.

	imgbit = {
		caption: "Pegasus cherries and some extra goodies.",
		elem: x.fn.x.init[1],
		events: Object,
		href: "../../img/the-garden-of-earthly-delights.jpg?x1=211&y1=81&x2=510&y2=273&c=FFFF7F",
		id: "#drop #imgbit-0",
		options: Object,
		original: "<a id="imgbit-0" class="imgbit edit closable" href="../../img/the-garden-of-earthly-delights.jpg?x1=211&amp;y1=81&amp;x2=510&amp;y2=273&amp;c=FFFF7F">#</a>",
		param: Object,
		src: "../../img/the-garden-of-earthly-delights.jpg"
	};

	imgbit.toJsonLd( _info )

I probably need to create some logic inside of the build method to handle Cite URNs.
A way of checking for the format...
The urn is included in the href attribute.

# 2014-01-08
Met with Bridget to work out some details.
Here's what needs to be done.

	imgbit.toJsonLd( _info )

	imgbit.citeCoord()

Coordinates...
Collect Width and Height of source
	1 = total width
	1 = total height
	all numbers must be 0 to 1
	@left-ratio,top-ratio,width,height

contentAsXML
Motivation - perseus:transcribing

# 2014-01-13
So I've been pretty good about making code reusable by breaking bits out into submodules and documenting things.  But that causes problems, especially in the Javascript world.  Looking at my installation documentation makes me realize that having developers import half a dozen or more scripts in the right sequence is only going to make them angry.  So I need to implement a build system.  I already have one in another project.  I just need to roll that build system into this one, and document everything.

# 2014-01-14
Brainstorm what needs to be done.
That way working prototype will be ready for presentation day. 
1-14 is today 1-22 is presentation day.
8 days!



		#ict_tool{:class=> 'perseidsld_query_obj_simple', 'data-sbj' => @identifier.work_urn, 'data-verb' => 'http://www.cidoc-crm.org/cidoc-crm/P138i_has_representation', 'data-formatter' => 'make_ICT_link'}

	perseidsld_query_obj_simple
	/usr/local/sosol/public/javascripts/perseids-ld.js
	
	# The XML edit template
	GET	scp sosol-test:/usr/local/sosol/app/views/epi_cts_identifiers/editxml.haml /var/www/imgspect/scratch/editxml.haml
	PUT scp /var/www/imgspect/scratch/editxml.haml sosol-test:/usr/local/sosol/app/views/epi_cts_identifiers/editxml.haml
	
	# PERSEIDS-LD -- Makes call to sparql server to get cite urns to images related to current document.
	GET scp sosol-test:/usr/local/sosol/public/javascripts/perseids-ld.js /var/www/imgspect/scratch/perseids-ld.js
	PUT scp /var/www/imgspect/scratch/perseids-ld.js sosol-test:/usr/local/sosol/public/javascripts/perseids-ld.js

	# PERSEIDS-TOOLS -- Formats data returned by PERSEIDS-LD
	GET scp sosol-test:/usr/local/sosol/public/javascripts/perseids-tools.js /var/www/imgspect/scratch/perseids-tools.js
	PUT scp /var/www/imgspect/scratch/perseids-tools.js sosol-test:/usr/local/sosol/public/javascripts/perseids-tools.js
	
	//------------------------------------------------------------
	// So I guess I need to figure out how the ICT tool works really.
	//------------------------------------------------------------
	PERSEIDS-TOOLS just builds an iframe passing along the cite URN to the image.

	//------------------------------------------------------------
	// So where does our ICT tool live?
	//------------------------------------------------------------
	http://perseids.org/tools/ict2/index.html
	
	Aha!  So I don't need to know where that code lives.
	I can just pass the URN on.
	So maybe I can get a thumbnail just by passing a different width.
	http://services.perseus.tufts.edu/sparqlimg/api?request=GetBinaryImage&amp;urn=urn:cite:perseus:epifacsimg.83&amp;w=100
	http://services.perseus.tufts.edu/sparqlimg/api?request=GetBinaryImage&amp;urn=urn:cite:perseus:epifacsimg.83&amp;w=1000
	
	//------------------------------------------------------------
	// IMG src
	//------------------------------------------------------------
	<img src="http://services.perseus.tufts.edu/sparqlimg/api?request=GetBinaryImage&amp;urn=urn:cite:perseus:epifacsimg.83&amp;w=100" />
	<img src="http://services.perseus.tufts.edu/sparqlimg/api?request=GetBinaryImage&amp;urn=urn:cite:perseus:epifacsimg.83&amp;w=1000" />


Okay I ran into a snag.
Imgbit made the assumption that an image would never have a question mark in the URL.
Well I just found out that isn't the case.
So I need to rewrite some code that will allow for source to have.
Where does that code reside?

* imgspect.liteToImgbit()
* imgbit.html()
* imgbit.init()



