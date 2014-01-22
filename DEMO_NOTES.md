# imgspect demo

So I want to show you a little web-application I built which will make transcribing text from images a bit easier.
	It's called imgspect... image and inspect mushed together.
	
So here's how it works.
So you go to a page like this one.
Notice this gray strip with image thumbnails.
To start imgspect just click the image you want to load.
That strip gets darker and imgspect will open.
So there's three areas.

1. The magnified area.
2. The tool and output area.
3. And the navigation area.

## first load
When you first load up imgspect the output area will display a little HOW-TO guide.

## magnifier
This semi-transparent white rectangle in the navigation area is your magnifying glass.
Click and drag it over the area you want to magnify.
You can use the "+" and "-" buttons to change the zoom level.

## highlight
So what you'll want to do is click and drag over the magnified area to highlight the area you want to transcribe.
If you've ever used Photoshop's crop tool this should be familiar.

I'll highlight another area.  This time I'll make it magenta.
So if you goof up your selection you can click the back arrow.
That back arrow removes the last highlighted area.

So when I highlight areas the interface changes a little bit.
The output area displays some cryptic looking text, and a number appears here next to this triangle pointing down.

## drop-down
Click the number and this drop down reveals all of your highlighted areas.
I call these isolated highlighted areas imgbits.
So each of these has a hash mark.

## hash mark
Click the hash mark and you'll get a text area.  
So now you can transcribe or caption this imgbit.
When you're done just click away or press "Enter"

Click the x in the corner of an imgbit to remove it.
If you forgot where in the larger image the imgbit is located just click on the image itself and imgspect will find it for you.

So that's basically how you proceed.

Pretty simple.

## output
Okay so what is happening in this output box...
So as you're highlighting and transcribing, imgspect is building XML.
You need to copy this XML into the main epidoc XML.
It would be nice to automate this part but I don't know how to do that without causing any side-effects just yet.

So let's look at the output.
	<w facs="urn:cite:perseus:epifacsimg.79@0.1984,0.4142,0.1334,0.0654">OET</w>
	<w facs="urn:cite:perseus:epifacsimg.79@0.5138,0.4222,0.1541,0.0614">#</w>
	<w facs="urn:cite:perseus:epifacsimg.79@0.0627,0.5113,0.1037,0.0488">HAIPAT</w>
	<w facs="urn:cite:perseus:epifacsimg.79@0.1711,0.5224,0.0480,0.0377">EDO</w>
	
It's four XML tags, which makes sense because we have four highlighted areas.
So let me decode this for you.

## xml
It's a w tag.  w is short for word.  XML tags need to be opened and closed so this w opens and this /w closes.

## urn
This part facs="" holds all the information to uniquely identify a highlighted area on an image.
So this part urn:cite:perseus:epifacsimg is the name of a collection of images.
.79 means this is the 79th image in the collection.

So that's all we need to identify the source image...
What's the rest of this?

## 4 numbers
Well this is an at symbol with four numbers separated by commas.
These four numbers define the highlighted area at any scale.

Here's how they do that.  
So each of these numbers is going to be between 0 and 1.

Point 0,0 is the top left corner
Point 1,1 is the lower right corner
The first number defines the x location of the upper left corner of the highlighted area.
and the second number is the y location of that point.

So if the first number is 0.2045 I know the beginning of the highlighted area begins about 20% or 1/5th across the image.
the second number works the same way except along the y-axis, 
so if the second number is 0.3308 that means the area begins about 1/3rd the way down the image.

The third number is the width.
And the fourth number is the height.

## transcription text
So you may have noticed the transcribed text here already.
So we have an identifier for the source image, we have the highlight area coordinates, and the transcribed text.
That's all the information we need to define a portion of an image transcription

## copy - paste and clean up
So now when need to copy and paste from this output area into the main XML document.

	... more here.
 
## switching between images
So clicking another thumbnail will open up a pop-up window letting you know if you switch images imgspect resets and you'll lose any highlighted areas and transcriptions you haven't copied to the main XML document.

# END
That's it really.
If you run into any problems...
