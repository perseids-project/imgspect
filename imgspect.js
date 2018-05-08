/*
 * jQuery UI Touch Punch 0.2.2
 *
 * Copyright 2011, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
(function(b){b.support.touch="ontouchend" in document;if(!b.support.touch){return;}var c=b.ui.mouse.prototype,e=c._mouseInit,a;function d(g,h){if(g.originalEvent.touches.length>1){return;}g.preventDefault();var i=g.originalEvent.changedTouches[0],f=document.createEvent("MouseEvents");f.initMouseEvent(h,true,true,window,1,i.screenX,i.screenY,i.clientX,i.clientY,false,false,false,false,0,null);g.target.dispatchEvent(f);}c._touchStart=function(g){var f=this;if(a||!f._mouseCapture(g.originalEvent.changedTouches[0])){return;}a=true;f._touchMoved=false;d(g,"mouseover");d(g,"mousemove");d(g,"mousedown");};c._touchMove=function(f){if(!a){return;}this._touchMoved=true;d(f,"mousemove");};c._touchEnd=function(f){if(!a){return;}d(f,"mouseup");d(f,"mouseout");if(!this._touchMoved){d(f,"click");}a=false;};c._mouseInit=function(){var f=this;f.element.bind("touchstart",b.proxy(f,"_touchStart")).bind("touchmove",b.proxy(f,"_touchMove")).bind("touchend",b.proxy(f,"_touchEnd"));e.call(f);};})(jQuery);
/**
 * Extend jQuery
 */
jQuery.fn.cursorToEnd = function() {
	return this.each( function() {
		jQuery( this ).focus();
		
		//------------------------------------------------------------
		//   If this function exists...
		//------------------------------------------------------------
		if ( this.setSelectionRange ) {
			//------------------------------------------------------------
			// ... then use it ( Doesn't work in IE )
			// Double the length because Opera is inconsistent 
			// about whether a carriage return is one character or two.
			//------------------------------------------------------------
			var len = jQuery( this ).val().length * 2;
			this.setSelectionRange( len, len );
		} 
		else {
			//------------------------------------------------------------
			// ... otherwise replace the contents with itself
			// ( Doesn't work in Google Chrome )
			//------------------------------------------------------------
			jQuery( this ).val( jQuery( this ).val() );
		}
		//------------------------------------------------------------
		// Scroll to the bottom, in case we're in a tall textarea
		// ( Necessary for Firefox and Google Chrome )
		//------------------------------------------------------------
		this.scrollTop = 999999;
	});
};

/**
 *  Remove whitespace
 *  Copied from
 *  http://stackoverflow.com/questions/1539367/remove-whitespace-and-line-breaks-between-html-elements-using-jquery
 */
jQuery.fn.noSpace = function() {
	textNodes = this.contents().filter(
		function() { 
			return ( this.nodeType == 3 && !/\S/.test( this.nodeValue ) );
		}
	).remove();
	return this;
}

/**
 *  Get an element's html
 */
jQuery.fn.myHtml = function() {
	return jQuery( this ).clone().wrap( '<div>' ).parent().html();
}

/**
 *  Get transition time in milliseconds
 *
 *  @return { Number } Time in milliseconds
 */
jQuery.fn.transLength = function() {
	var trans = jQuery( this ).css( 'transition' );
	var res = trans.match( / [\d|\.]+s/g );
	var sec = Number( res[0].replace( 's','' ) );
	return sec*1000;
}
/**
 * Remove newlines and tabs
 */
String.prototype.smoosh = function() {
	return this.replace(/(\r\n+|\n+|\r+|\t+)/gm,'');
}

/**
 * Splice in a string at a specified index
 *
 * @param { string } _string
 * @param { int } _index The position in the string
 */
String.prototype.splice = function( _string, _index ) {
    return ( this.slice( 0, Math.abs( _index ) ) + _string + this.slice( Math.abs( _index )));
};

/**
 * Strip html tags
 */
String.prototype.stripTags = function() {
	return this.replace(/<\/?[^>]+(>|$)/g, '' );
}

/**
 * Remove extra spaces
 */
String.prototype.oneSpace = function() {
	return this.replace(/\s{2,}/g, ' ');
}

/**
 * Alpha-numeric and spaces only
 */
String.prototype.alphaSpaceOnly = function() {
	return this.replace(/[^\w\s]/gi, '');
}

/**
 * Alpha-numeric characters only
 */
String.prototype.alphaOnly = function() {
	return this.replace(/[^\w]/gi, '');
}

/**
 * Capitalize the first letter of a string
 */
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Repeat a string n times
 *
 * @param {string} _n How many times you want to repeat a string
 */
String.prototype.repeat = function( _n ) {
	return new Array( _n + 1 ).join( this );
}

/**
 * Count the occurences of a string in a larger string
 *
 * @parm {string} _sub : The search string
 * @param {boolean} _overlap : Optional. Default: false
 * @return {int} : The count
 */
String.prototype.occurs = function( _search, _overlap ) {
	var string = this;
	//------------------------------------------------------------
	//  If _search is null just return a char count
	//------------------------------------------------------------
	if ( _search == undefined ) {
		return string.length;
	}
	//------------------------------------------------------------
	//  Make sure _search is a string
	//------------------------------------------------------------
	_search+="";
	//------------------------------------------------------------
	//  If no search term is past just return a character count
	//------------------------------------------------------------
	if ( _search.length <= 0 ) {
		return string.length;
	}
	//------------------------------------------------------------
	//  Otherwise start counting.
	//------------------------------------------------------------
	var n=0;
	var pos=0;
	var step = ( _overlap ) ? 1 : _search.length;
	while ( true ) {
		pos = string.indexOf( _search, pos );
		if ( pos >= 0 ) {
			n++;
			pos += step;
		}
		else {
			break;
		}
	}
	return n;
}

/**
 * Find the positions of occurences of a substring
 *
 * @parm {string} _sub : The search string
 * @param {boolean} _overlap : Optional. Default--false.
 * @param {boolean} _ignoreXML : Optional. Check to see if string is inside XML/HTML element.
 * @param {boolean} _onlyWords : Optional. Make sure string is a discrete word.
 * @return {Array} : An array of integers.
 */
String.prototype.positions = function( _search, _overlap, _ignoreXML, _onlyWords ) {
//	console.log( '----------' );
//	console.log( _search );
	var string = this;
	//------------------------------------------------------------
	//  Make sure _search is a string
	//------------------------------------------------------------
	_search+="";
	//------------------------------------------------------------
	//  Otherwise start counting.
	//------------------------------------------------------------
	var pos=0;
	//------------------------------------------------------------
	//  String overlapping allowed?
	//------------------------------------------------------------
	var step = ( _overlap ) ? 1 : _search.length;
	var p = [];
	while ( true ) {
		var ok = true;
		pos = string.indexOf( _search, pos );
		if ( pos >= 0 ) {
			//------------------------------------------------------------
			//  Ignore if search string was found within an XML/HTML tag
			//------------------------------------------------------------
			if ( _ignoreXML == true ) {
				for ( var i=pos; i<string.length; i++ ) {
					if ( string[i] == '<' ) {
						break;
					}
					if ( string[i] == '>' ) {
						ok = false;
					}
				}
			}
			//------------------------------------------------------------
			//  Check to see if search string is an isolated word
			//------------------------------------------------------------
			if ( _onlyWords == true ) {
//				console.log( string.substr((pos-1),(pos+_search.length+1)) );
//				console.log( string.substr((pos-1),(pos+_search.length+1)).isAlphaNum() );
				if ( string.substr((pos-1),(pos+_search.length+1)).isAlphaNum() == true ) {
					ok = false;
				}
			}
			//------------------------------------------------------------
			//  If everything is good
			//------------------------------------------------------------
			if ( ok == true ) {
				p.push( pos );
			}
			pos += step;
		}
		else {
			break;
		}
	}
	return p;
}

/*
 * Insert a substring at a particular index
 *
 * @return { string } The modified string
 */
String.prototype.insertAt = function( _index, _string ) {
	return this.substr( 0, _index) + _string + this.substr( _index );
}

/*
 * Turn a string with HTTP GET style parameters to an object
 *
 * @return { obj } A collection of keys and values
 */
String.prototype.params = function() {
	var arr = this.split('?');
	var get = arr[1];
	arr = get.split('&');
	var out = {};
	for ( var i=0, ii=arr.length; i<ii; i++ ) {
		if ( arr[i] != undefined ) {
			var pair = arr[i].split('=');
			out[ pair[0] ] = pair[1];
		}
	}
	return out;
}

/*
 * Check for the existence of an upper-case letter
 *
 * @return { boolean }
 */
String.prototype.hasUpper = function() {
	return /[A-Z]/.test( this );
}

/*
 * Create a word frequency report object
 *
 * @return { obj } Report object
 */
String.prototype.report = function() {
	var words = this.toLowerCase().split(' ');
	var stats = {};
	for ( var i=0, ii=words.length; i<ii; i++ ) {
		var word = words[i];
		if ( ! ( word in stats ) ) {
			stats[word] = 1;
		}
		else {
			stats[word] += 1;
		}
	}
	return stats;
}

/*
 * Divide text into an array of lines by splitting on linebreaks
 *
 * @return { array } An array of lines
 */
String.prototype.lines = function() {
	return this.split("\n");
}

/*
 * Check to see if string is composed of only alphanumeric characters
 *
 * @return { boolean }
 */
String.prototype.isAlphaNum = function() {
	if ( /[^a-zA-Z0-9]/.test( this ) ) {
		return false;
	}
	return true;
}

/*
 * Divide text into an array of individual sentences
 * This is English-centric.  Forgive me.
 *
 * @return { array } An array of sentences
 */
String.prototype.sentences = function() {
	var check = this.match( /[^\.!\?]+[\.!\?]+/g );
	
	//------------------------------------------------------------
	//  Make sure characters aren't used for purposes other than
	//  sentences.
	//------------------------------------------------------------
	var vowels = [ 'a','e','i','o','u','y' ];
	var out = [];
	var carry = '';
	for ( var i=0; i<check.length; i++ ) {
		//------------------------------------------------------------
		//  Clean up.
		//------------------------------------------------------------
		var strCheck = carry + check[i];
		carry = '';
		//------------------------------------------------------------
		//  Check for the existence of a vowel, so we aren't
		//  accidentally thinking part of an abbreviation is its
		//  own sentence.
		//------------------------------------------------------------
		var merge = true;
		for ( var j=0; j<vowels.length; j++ ) {
			if ( strCheck.indexOf( vowels[j] ) != -1 ) {
				merge = false;
				break;
			}
		}
		//------------------------------------------------------------
		//  Also check for a capital letter on the first word.  
		//  Most sentences have those too.
		//------------------------------------------------------------
		var capTest = strCheck.trim();
		if ( ! capTest[0].hasUpper() ) {
			merge = true;
		}
		//------------------------------------------------------------
		//  If no vowel exists in the sentence you're probably
		//  dealing with an abbreviation.  Merge with last sentence.  
		//------------------------------------------------------------
		if ( merge ) {
			if ( out.length > 0 ) {
				out[ out.length-1 ] += strCheck;
			}
			else {
				carry = strCheck;
			}
			continue;
		}
		
		//------------------------------------------------------------
		//  Prepare output.
		//------------------------------------------------------------
		out.push( strCheck.smoosh().trim() );
	}
	return out;
}
/**
 * Version: 1.0 Alpha-1 
 * Build Date: 13-Nov-2007
 * Copyright (c) 2006-2007, Coolite Inc. (http://www.coolite.com/). All rights reserved.
 * License: Licensed under The MIT License. See license.txt and http://www.datejs.com/license/. 
 * Website: http://www.datejs.com/ or http://www.coolite.com/datejs/
 */
Date.CultureInfo={name:"en-US",englishName:"English (United States)",nativeName:"English (United States)",dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],abbreviatedDayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],shortestDayNames:["Su","Mo","Tu","We","Th","Fr","Sa"],firstLetterDayNames:["S","M","T","W","T","F","S"],monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],abbreviatedMonthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],amDesignator:"AM",pmDesignator:"PM",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"mdy",formatPatterns:{shortDate:"M/d/yyyy",longDate:"dddd, MMMM dd, yyyy",shortTime:"h:mm tt",longTime:"h:mm:ss tt",fullDateTime:"dddd, MMMM dd, yyyy h:mm:ss tt",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"MMMM dd",yearMonth:"MMMM, yyyy"},regexPatterns:{jan:/^jan(uary)?/i,feb:/^feb(ruary)?/i,mar:/^mar(ch)?/i,apr:/^apr(il)?/i,may:/^may/i,jun:/^jun(e)?/i,jul:/^jul(y)?/i,aug:/^aug(ust)?/i,sep:/^sep(t(ember)?)?/i,oct:/^oct(ober)?/i,nov:/^nov(ember)?/i,dec:/^dec(ember)?/i,sun:/^su(n(day)?)?/i,mon:/^mo(n(day)?)?/i,tue:/^tu(e(s(day)?)?)?/i,wed:/^we(d(nesday)?)?/i,thu:/^th(u(r(s(day)?)?)?)?/i,fri:/^fr(i(day)?)?/i,sat:/^sa(t(urday)?)?/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
Date.getMonthNumberFromName=function(name){var n=Date.CultureInfo.monthNames,m=Date.CultureInfo.abbreviatedMonthNames,s=name.toLowerCase();for(var i=0;i<n.length;i++){if(n[i].toLowerCase()==s||m[i].toLowerCase()==s){return i;}}
return-1;};Date.getDayNumberFromName=function(name){var n=Date.CultureInfo.dayNames,m=Date.CultureInfo.abbreviatedDayNames,o=Date.CultureInfo.shortestDayNames,s=name.toLowerCase();for(var i=0;i<n.length;i++){if(n[i].toLowerCase()==s||m[i].toLowerCase()==s){return i;}}
return-1;};Date.isLeapYear=function(year){return(((year%4===0)&&(year%100!==0))||(year%400===0));};Date.getDaysInMonth=function(year,month){return[31,(Date.isLeapYear(year)?29:28),31,30,31,30,31,31,30,31,30,31][month];};Date.getTimezoneOffset=function(s,dst){return(dst||false)?Date.CultureInfo.abbreviatedTimeZoneDST[s.toUpperCase()]:Date.CultureInfo.abbreviatedTimeZoneStandard[s.toUpperCase()];};Date.getTimezoneAbbreviation=function(offset,dst){var n=(dst||false)?Date.CultureInfo.abbreviatedTimeZoneDST:Date.CultureInfo.abbreviatedTimeZoneStandard,p;for(p in n){if(n[p]===offset){return p;}}
return null;};Date.prototype.clone=function(){return new Date(this.getTime());};Date.prototype.compareTo=function(date){if(isNaN(this)){throw new Error(this);}
if(date instanceof Date&&!isNaN(date)){return(this>date)?1:(this<date)?-1:0;}else{throw new TypeError(date);}};Date.prototype.equals=function(date){return(this.compareTo(date)===0);};Date.prototype.between=function(start,end){var t=this.getTime();return t>=start.getTime()&&t<=end.getTime();};Date.prototype.addMilliseconds=function(value){this.setMilliseconds(this.getMilliseconds()+value);return this;};Date.prototype.addSeconds=function(value){return this.addMilliseconds(value*1000);};Date.prototype.addMinutes=function(value){return this.addMilliseconds(value*60000);};Date.prototype.addHours=function(value){return this.addMilliseconds(value*3600000);};Date.prototype.addDays=function(value){return this.addMilliseconds(value*86400000);};Date.prototype.addWeeks=function(value){return this.addMilliseconds(value*604800000);};Date.prototype.addMonths=function(value){var n=this.getDate();this.setDate(1);this.setMonth(this.getMonth()+value);this.setDate(Math.min(n,this.getDaysInMonth()));return this;};Date.prototype.addYears=function(value){return this.addMonths(value*12);};Date.prototype.add=function(config){if(typeof config=="number"){this._orient=config;return this;}
var x=config;if(x.millisecond||x.milliseconds){this.addMilliseconds(x.millisecond||x.milliseconds);}
if(x.second||x.seconds){this.addSeconds(x.second||x.seconds);}
if(x.minute||x.minutes){this.addMinutes(x.minute||x.minutes);}
if(x.hour||x.hours){this.addHours(x.hour||x.hours);}
if(x.month||x.months){this.addMonths(x.month||x.months);}
if(x.year||x.years){this.addYears(x.year||x.years);}
if(x.day||x.days){this.addDays(x.day||x.days);}
return this;};Date._validate=function(value,min,max,name){if(typeof value!="number"){throw new TypeError(value+" is not a Number.");}else if(value<min||value>max){throw new RangeError(value+" is not a valid value for "+name+".");}
return true;};Date.validateMillisecond=function(n){return Date._validate(n,0,999,"milliseconds");};Date.validateSecond=function(n){return Date._validate(n,0,59,"seconds");};Date.validateMinute=function(n){return Date._validate(n,0,59,"minutes");};Date.validateHour=function(n){return Date._validate(n,0,23,"hours");};Date.validateDay=function(n,year,month){return Date._validate(n,1,Date.getDaysInMonth(year,month),"days");};Date.validateMonth=function(n){return Date._validate(n,0,11,"months");};Date.validateYear=function(n){return Date._validate(n,1,9999,"seconds");};Date.prototype.set=function(config){var x=config;if(!x.millisecond&&x.millisecond!==0){x.millisecond=-1;}
if(!x.second&&x.second!==0){x.second=-1;}
if(!x.minute&&x.minute!==0){x.minute=-1;}
if(!x.hour&&x.hour!==0){x.hour=-1;}
if(!x.day&&x.day!==0){x.day=-1;}
if(!x.month&&x.month!==0){x.month=-1;}
if(!x.year&&x.year!==0){x.year=-1;}
if(x.millisecond!=-1&&Date.validateMillisecond(x.millisecond)){this.addMilliseconds(x.millisecond-this.getMilliseconds());}
if(x.second!=-1&&Date.validateSecond(x.second)){this.addSeconds(x.second-this.getSeconds());}
if(x.minute!=-1&&Date.validateMinute(x.minute)){this.addMinutes(x.minute-this.getMinutes());}
if(x.hour!=-1&&Date.validateHour(x.hour)){this.addHours(x.hour-this.getHours());}
if(x.month!==-1&&Date.validateMonth(x.month)){this.addMonths(x.month-this.getMonth());}
if(x.year!=-1&&Date.validateYear(x.year)){this.addYears(x.year-this.getFullYear());}
if(x.day!=-1&&Date.validateDay(x.day,this.getFullYear(),this.getMonth())){this.addDays(x.day-this.getDate());}
if(x.timezone){this.setTimezone(x.timezone);}
if(x.timezoneOffset){this.setTimezoneOffset(x.timezoneOffset);}
return this;};Date.prototype.clearTime=function(){this.setHours(0);this.setMinutes(0);this.setSeconds(0);this.setMilliseconds(0);return this;};Date.prototype.isLeapYear=function(){var y=this.getFullYear();return(((y%4===0)&&(y%100!==0))||(y%400===0));};Date.prototype.isWeekday=function(){return!(this.is().sat()||this.is().sun());};Date.prototype.getDaysInMonth=function(){return Date.getDaysInMonth(this.getFullYear(),this.getMonth());};Date.prototype.moveToFirstDayOfMonth=function(){return this.set({day:1});};Date.prototype.moveToLastDayOfMonth=function(){return this.set({day:this.getDaysInMonth()});};Date.prototype.moveToDayOfWeek=function(day,orient){var diff=(day-this.getDay()+7*(orient||+1))%7;return this.addDays((diff===0)?diff+=7*(orient||+1):diff);};Date.prototype.moveToMonth=function(month,orient){var diff=(month-this.getMonth()+12*(orient||+1))%12;return this.addMonths((diff===0)?diff+=12*(orient||+1):diff);};Date.prototype.getDayOfYear=function(){return Math.floor((this-new Date(this.getFullYear(),0,1))/86400000);};Date.prototype.getWeekOfYear=function(firstDayOfWeek){var y=this.getFullYear(),m=this.getMonth(),d=this.getDate();var dow=firstDayOfWeek||Date.CultureInfo.firstDayOfWeek;var offset=7+1-new Date(y,0,1).getDay();if(offset==8){offset=1;}
var daynum=((Date.UTC(y,m,d,0,0,0)-Date.UTC(y,0,1,0,0,0))/86400000)+1;var w=Math.floor((daynum-offset+7)/7);if(w===dow){y--;var prevOffset=7+1-new Date(y,0,1).getDay();if(prevOffset==2||prevOffset==8){w=53;}else{w=52;}}
return w;};Date.prototype.isDST=function(){console.log('isDST');return this.toString().match(/(E|C|M|P)(S|D)T/)[2]=="D";};Date.prototype.getTimezone=function(){return Date.getTimezoneAbbreviation(this.getUTCOffset,this.isDST());};Date.prototype.setTimezoneOffset=function(s){var here=this.getTimezoneOffset(),there=Number(s)*-6/10;this.addMinutes(there-here);return this;};Date.prototype.setTimezone=function(s){return this.setTimezoneOffset(Date.getTimezoneOffset(s));};Date.prototype.getUTCOffset=function(){var n=this.getTimezoneOffset()*-10/6,r;if(n<0){r=(n-10000).toString();return r[0]+r.substr(2);}else{r=(n+10000).toString();return"+"+r.substr(1);}};Date.prototype.getDayName=function(abbrev){return abbrev?Date.CultureInfo.abbreviatedDayNames[this.getDay()]:Date.CultureInfo.dayNames[this.getDay()];};Date.prototype.getMonthName=function(abbrev){return abbrev?Date.CultureInfo.abbreviatedMonthNames[this.getMonth()]:Date.CultureInfo.monthNames[this.getMonth()];};Date.prototype._toString=Date.prototype.toString;Date.prototype.toString=function(format){var self=this;var p=function p(s){return(s.toString().length==1)?"0"+s:s;};return format?format.replace(/dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?/g,function(format){switch(format){case"hh":return p(self.getHours()<13?self.getHours():(self.getHours()-12));case"h":return self.getHours()<13?self.getHours():(self.getHours()-12);case"HH":return p(self.getHours());case"H":return self.getHours();case"mm":return p(self.getMinutes());case"m":return self.getMinutes();case"ss":return p(self.getSeconds());case"s":return self.getSeconds();case"yyyy":return self.getFullYear();case"yy":return self.getFullYear().toString().substring(2,4);case"dddd":return self.getDayName();case"ddd":return self.getDayName(true);case"dd":return p(self.getDate());case"d":return self.getDate().toString();case"MMMM":return self.getMonthName();case"MMM":return self.getMonthName(true);case"MM":return p((self.getMonth()+1));case"M":return self.getMonth()+1;case"t":return self.getHours()<12?Date.CultureInfo.amDesignator.substring(0,1):Date.CultureInfo.pmDesignator.substring(0,1);case"tt":return self.getHours()<12?Date.CultureInfo.amDesignator:Date.CultureInfo.pmDesignator;case"zzz":case"zz":case"z":return"";}}):this._toString();};
Date.now=function(){return new Date();};Date.today=function(){return Date.now().clearTime();};Date.prototype._orient=+1;Date.prototype.next=function(){this._orient=+1;return this;};Date.prototype.last=Date.prototype.prev=Date.prototype.previous=function(){this._orient=-1;return this;};Date.prototype._is=false;Date.prototype.is=function(){this._is=true;return this;};Number.prototype._dateElement="day";Number.prototype.fromNow=function(){var c={};c[this._dateElement]=this;return Date.now().add(c);};Number.prototype.ago=function(){var c={};c[this._dateElement]=this*-1;return Date.now().add(c);};(function(){var $D=Date.prototype,$N=Number.prototype;var dx=("sunday monday tuesday wednesday thursday friday saturday").split(/\s/),mx=("january february march april may june july august september october november december").split(/\s/),px=("Millisecond Second Minute Hour Day Week Month Year").split(/\s/),de;var df=function(n){return function(){if(this._is){this._is=false;return this.getDay()==n;}
return this.moveToDayOfWeek(n,this._orient);};};for(var i=0;i<dx.length;i++){$D[dx[i]]=$D[dx[i].substring(0,3)]=df(i);}
var mf=function(n){return function(){if(this._is){this._is=false;return this.getMonth()===n;}
return this.moveToMonth(n,this._orient);};};for(var j=0;j<mx.length;j++){$D[mx[j]]=$D[mx[j].substring(0,3)]=mf(j);}
var ef=function(j){return function(){if(j.substring(j.length-1)!="s"){j+="s";}
return this["add"+j](this._orient);};};var nf=function(n){return function(){this._dateElement=n;return this;};};for(var k=0;k<px.length;k++){de=px[k].toLowerCase();$D[de]=$D[de+"s"]=ef(px[k]);$N[de]=$N[de+"s"]=nf(de);}}());Date.prototype.toJSONString=function(){return this.toString("yyyy-MM-ddThh:mm:ssZ");};Date.prototype.toShortDateString=function(){return this.toString(Date.CultureInfo.formatPatterns.shortDatePattern);};Date.prototype.toLongDateString=function(){return this.toString(Date.CultureInfo.formatPatterns.longDatePattern);};Date.prototype.toShortTimeString=function(){return this.toString(Date.CultureInfo.formatPatterns.shortTimePattern);};Date.prototype.toLongTimeString=function(){return this.toString(Date.CultureInfo.formatPatterns.longTimePattern);};Date.prototype.getOrdinal=function(){switch(this.getDate()){case 1:case 21:case 31:return"st";case 2:case 22:return"nd";case 3:case 23:return"rd";default:return"th";}};
(function(){Date.Parsing={Exception:function(s){this.message="Parse error at '"+s.substring(0,10)+" ...'";}};var $P=Date.Parsing;var _=$P.Operators={rtoken:function(r){return function(s){var mx=s.match(r);if(mx){return([mx[0],s.substring(mx[0].length)]);}else{throw new $P.Exception(s);}};},token:function(s){return function(s){return _.rtoken(new RegExp("^\s*"+s+"\s*"))(s);};},stoken:function(s){return _.rtoken(new RegExp("^"+s));},until:function(p){return function(s){var qx=[],rx=null;while(s.length){try{rx=p.call(this,s);}catch(e){qx.push(rx[0]);s=rx[1];continue;}
break;}
return[qx,s];};},many:function(p){return function(s){var rx=[],r=null;while(s.length){try{r=p.call(this,s);}catch(e){return[rx,s];}
rx.push(r[0]);s=r[1];}
return[rx,s];};},optional:function(p){return function(s){var r=null;try{r=p.call(this,s);}catch(e){return[null,s];}
return[r[0],r[1]];};},not:function(p){return function(s){try{p.call(this,s);}catch(e){return[null,s];}
throw new $P.Exception(s);};},ignore:function(p){return p?function(s){var r=null;r=p.call(this,s);return[null,r[1]];}:null;},product:function(){var px=arguments[0],qx=Array.prototype.slice.call(arguments,1),rx=[];for(var i=0;i<px.length;i++){rx.push(_.each(px[i],qx));}
return rx;},cache:function(rule){var cache={},r=null;return function(s){try{r=cache[s]=(cache[s]||rule.call(this,s));}catch(e){r=cache[s]=e;}
if(r instanceof $P.Exception){throw r;}else{return r;}};},any:function(){var px=arguments;return function(s){var r=null;for(var i=0;i<px.length;i++){if(px[i]==null){continue;}
try{r=(px[i].call(this,s));}catch(e){r=null;}
if(r){return r;}}
throw new $P.Exception(s);};},each:function(){var px=arguments;return function(s){var rx=[],r=null;for(var i=0;i<px.length;i++){if(px[i]==null){continue;}
try{r=(px[i].call(this,s));}catch(e){throw new $P.Exception(s);}
rx.push(r[0]);s=r[1];}
return[rx,s];};},all:function(){var px=arguments,_=_;return _.each(_.optional(px));},sequence:function(px,d,c){d=d||_.rtoken(/^\s*/);c=c||null;if(px.length==1){return px[0];}
return function(s){var r=null,q=null;var rx=[];for(var i=0;i<px.length;i++){try{r=px[i].call(this,s);}catch(e){break;}
rx.push(r[0]);try{q=d.call(this,r[1]);}catch(ex){q=null;break;}
s=q[1];}
if(!r){throw new $P.Exception(s);}
if(q){throw new $P.Exception(q[1]);}
if(c){try{r=c.call(this,r[1]);}catch(ey){throw new $P.Exception(r[1]);}}
return[rx,(r?r[1]:s)];};},between:function(d1,p,d2){d2=d2||d1;var _fn=_.each(_.ignore(d1),p,_.ignore(d2));return function(s){var rx=_fn.call(this,s);return[[rx[0][0],r[0][2]],rx[1]];};},list:function(p,d,c){d=d||_.rtoken(/^\s*/);c=c||null;return(p instanceof Array?_.each(_.product(p.slice(0,-1),_.ignore(d)),p.slice(-1),_.ignore(c)):_.each(_.many(_.each(p,_.ignore(d))),px,_.ignore(c)));},set:function(px,d,c){d=d||_.rtoken(/^\s*/);c=c||null;return function(s){var r=null,p=null,q=null,rx=null,best=[[],s],last=false;for(var i=0;i<px.length;i++){q=null;p=null;r=null;last=(px.length==1);try{r=px[i].call(this,s);}catch(e){continue;}
rx=[[r[0]],r[1]];if(r[1].length>0&&!last){try{q=d.call(this,r[1]);}catch(ex){last=true;}}else{last=true;}
if(!last&&q[1].length===0){last=true;}
if(!last){var qx=[];for(var j=0;j<px.length;j++){if(i!=j){qx.push(px[j]);}}
p=_.set(qx,d).call(this,q[1]);if(p[0].length>0){rx[0]=rx[0].concat(p[0]);rx[1]=p[1];}}
if(rx[1].length<best[1].length){best=rx;}
if(best[1].length===0){break;}}
if(best[0].length===0){return best;}
if(c){try{q=c.call(this,best[1]);}catch(ey){throw new $P.Exception(best[1]);}
best[1]=q[1];}
return best;};},forward:function(gr,fname){return function(s){return gr[fname].call(this,s);};},replace:function(rule,repl){return function(s){var r=rule.call(this,s);return[repl,r[1]];};},process:function(rule,fn){return function(s){var r=rule.call(this,s);return[fn.call(this,r[0]),r[1]];};},min:function(min,rule){return function(s){var rx=rule.call(this,s);if(rx[0].length<min){throw new $P.Exception(s);}
return rx;};}};var _generator=function(op){return function(){var args=null,rx=[];if(arguments.length>1){args=Array.prototype.slice.call(arguments);}else if(arguments[0]instanceof Array){args=arguments[0];}
if(args){for(var i=0,px=args.shift();i<px.length;i++){args.unshift(px[i]);rx.push(op.apply(null,args));args.shift();return rx;}}else{return op.apply(null,arguments);}};};var gx="optional not ignore cache".split(/\s/);for(var i=0;i<gx.length;i++){_[gx[i]]=_generator(_[gx[i]]);}
var _vector=function(op){return function(){if(arguments[0]instanceof Array){return op.apply(null,arguments[0]);}else{return op.apply(null,arguments);}};};var vx="each any all".split(/\s/);for(var j=0;j<vx.length;j++){_[vx[j]]=_vector(_[vx[j]]);}}());(function(){var flattenAndCompact=function(ax){var rx=[];for(var i=0;i<ax.length;i++){if(ax[i]instanceof Array){rx=rx.concat(flattenAndCompact(ax[i]));}else{if(ax[i]){rx.push(ax[i]);}}}
return rx;};Date.Grammar={};Date.Translator={hour:function(s){return function(){this.hour=Number(s);};},minute:function(s){return function(){this.minute=Number(s);};},second:function(s){return function(){this.second=Number(s);};},meridian:function(s){return function(){this.meridian=s.slice(0,1).toLowerCase();};},timezone:function(s){return function(){var n=s.replace(/[^\d\+\-]/g,"");if(n.length){this.timezoneOffset=Number(n);}else{this.timezone=s.toLowerCase();}};},day:function(x){var s=x[0];return function(){this.day=Number(s.match(/\d+/)[0]);};},month:function(s){return function(){this.month=((s.length==3)?Date.getMonthNumberFromName(s):(Number(s)-1));};},year:function(s){return function(){var n=Number(s);this.year=((s.length>2)?n:(n+(((n+2000)<Date.CultureInfo.twoDigitYearMax)?2000:1900)));};},rday:function(s){return function(){switch(s){case"yesterday":this.days=-1;break;case"tomorrow":this.days=1;break;case"today":this.days=0;break;case"now":this.days=0;this.now=true;break;}};},finishExact:function(x){x=(x instanceof Array)?x:[x];var now=new Date();this.year=now.getFullYear();this.month=now.getMonth();this.day=1;this.hour=0;this.minute=0;this.second=0;for(var i=0;i<x.length;i++){if(x[i]){x[i].call(this);}}
this.hour=(this.meridian=="p"&&this.hour<13)?this.hour+12:this.hour;if(this.day>Date.getDaysInMonth(this.year,this.month)){throw new RangeError(this.day+" is not a valid value for days.");}
var r=new Date(this.year,this.month,this.day,this.hour,this.minute,this.second);if(this.timezone){r.set({timezone:this.timezone});}else if(this.timezoneOffset){r.set({timezoneOffset:this.timezoneOffset});}
return r;},finish:function(x){x=(x instanceof Array)?flattenAndCompact(x):[x];if(x.length===0){return null;}
for(var i=0;i<x.length;i++){if(typeof x[i]=="function"){x[i].call(this);}}
if(this.now){return new Date();}
var today=Date.today();var method=null;var expression=!!(this.days!=null||this.orient||this.operator);if(expression){var gap,mod,orient;orient=((this.orient=="past"||this.operator=="subtract")?-1:1);if(this.weekday){this.unit="day";gap=(Date.getDayNumberFromName(this.weekday)-today.getDay());mod=7;this.days=gap?((gap+(orient*mod))%mod):(orient*mod);}
if(this.month){this.unit="month";gap=(this.month-today.getMonth());mod=12;this.months=gap?((gap+(orient*mod))%mod):(orient*mod);this.month=null;}
if(!this.unit){this.unit="day";}
if(this[this.unit+"s"]==null||this.operator!=null){if(!this.value){this.value=1;}
if(this.unit=="week"){this.unit="day";this.value=this.value*7;}
this[this.unit+"s"]=this.value*orient;}
return today.add(this);}else{if(this.meridian&&this.hour){this.hour=(this.hour<13&&this.meridian=="p")?this.hour+12:this.hour;}
if(this.weekday&&!this.day){this.day=(today.addDays((Date.getDayNumberFromName(this.weekday)-today.getDay()))).getDate();}
if(this.month&&!this.day){this.day=1;}
return today.set(this);}}};var _=Date.Parsing.Operators,g=Date.Grammar,t=Date.Translator,_fn;g.datePartDelimiter=_.rtoken(/^([\s\-\.\,\/\x27]+)/);g.timePartDelimiter=_.stoken(":");g.whiteSpace=_.rtoken(/^\s*/);g.generalDelimiter=_.rtoken(/^(([\s\,]|at|on)+)/);var _C={};g.ctoken=function(keys){var fn=_C[keys];if(!fn){var c=Date.CultureInfo.regexPatterns;var kx=keys.split(/\s+/),px=[];for(var i=0;i<kx.length;i++){px.push(_.replace(_.rtoken(c[kx[i]]),kx[i]));}
fn=_C[keys]=_.any.apply(null,px);}
return fn;};g.ctoken2=function(key){return _.rtoken(Date.CultureInfo.regexPatterns[key]);};g.h=_.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2]|[1-9])/),t.hour));g.hh=_.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2])/),t.hour));g.H=_.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3]|[0-9])/),t.hour));g.HH=_.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3])/),t.hour));g.m=_.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/),t.minute));g.mm=_.cache(_.process(_.rtoken(/^[0-5][0-9]/),t.minute));g.s=_.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/),t.second));g.ss=_.cache(_.process(_.rtoken(/^[0-5][0-9]/),t.second));g.hms=_.cache(_.sequence([g.H,g.mm,g.ss],g.timePartDelimiter));g.t=_.cache(_.process(g.ctoken2("shortMeridian"),t.meridian));g.tt=_.cache(_.process(g.ctoken2("longMeridian"),t.meridian));g.z=_.cache(_.process(_.rtoken(/^(\+|\-)?\s*\d\d\d\d?/),t.timezone));g.zz=_.cache(_.process(_.rtoken(/^(\+|\-)\s*\d\d\d\d/),t.timezone));g.zzz=_.cache(_.process(g.ctoken2("timezone"),t.timezone));g.timeSuffix=_.each(_.ignore(g.whiteSpace),_.set([g.tt,g.zzz]));g.time=_.each(_.optional(_.ignore(_.stoken("T"))),g.hms,g.timeSuffix);g.d=_.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1]|\d)/),_.optional(g.ctoken2("ordinalSuffix"))),t.day));g.dd=_.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1])/),_.optional(g.ctoken2("ordinalSuffix"))),t.day));g.ddd=g.dddd=_.cache(_.process(g.ctoken("sun mon tue wed thu fri sat"),function(s){return function(){this.weekday=s;};}));g.M=_.cache(_.process(_.rtoken(/^(1[0-2]|0\d|\d)/),t.month));g.MM=_.cache(_.process(_.rtoken(/^(1[0-2]|0\d)/),t.month));g.MMM=g.MMMM=_.cache(_.process(g.ctoken("jan feb mar apr may jun jul aug sep oct nov dec"),t.month));g.y=_.cache(_.process(_.rtoken(/^(\d\d?)/),t.year));g.yy=_.cache(_.process(_.rtoken(/^(\d\d)/),t.year));g.yyy=_.cache(_.process(_.rtoken(/^(\d\d?\d?\d?)/),t.year));g.yyyy=_.cache(_.process(_.rtoken(/^(\d\d\d\d)/),t.year));_fn=function(){return _.each(_.any.apply(null,arguments),_.not(g.ctoken2("timeContext")));};g.day=_fn(g.d,g.dd);g.month=_fn(g.M,g.MMM);g.year=_fn(g.yyyy,g.yy);g.orientation=_.process(g.ctoken("past future"),function(s){return function(){this.orient=s;};});g.operator=_.process(g.ctoken("add subtract"),function(s){return function(){this.operator=s;};});g.rday=_.process(g.ctoken("yesterday tomorrow today now"),t.rday);g.unit=_.process(g.ctoken("minute hour day week month year"),function(s){return function(){this.unit=s;};});g.value=_.process(_.rtoken(/^\d\d?(st|nd|rd|th)?/),function(s){return function(){this.value=s.replace(/\D/g,"");};});g.expression=_.set([g.rday,g.operator,g.value,g.unit,g.orientation,g.ddd,g.MMM]);_fn=function(){return _.set(arguments,g.datePartDelimiter);};g.mdy=_fn(g.ddd,g.month,g.day,g.year);g.ymd=_fn(g.ddd,g.year,g.month,g.day);g.dmy=_fn(g.ddd,g.day,g.month,g.year);g.date=function(s){return((g[Date.CultureInfo.dateElementOrder]||g.mdy).call(this,s));};g.format=_.process(_.many(_.any(_.process(_.rtoken(/^(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?)/),function(fmt){if(g[fmt]){return g[fmt];}else{throw Date.Parsing.Exception(fmt);}}),_.process(_.rtoken(/^[^dMyhHmstz]+/),function(s){return _.ignore(_.stoken(s));}))),function(rules){return _.process(_.each.apply(null,rules),t.finishExact);});var _F={};var _get=function(f){return _F[f]=(_F[f]||g.format(f)[0]);};g.formats=function(fx){if(fx instanceof Array){var rx=[];for(var i=0;i<fx.length;i++){rx.push(_get(fx[i]));}
return _.any.apply(null,rx);}else{return _get(fx);}};g._formats=g.formats(["yyyy-MM-ddTHH:mm:ss","ddd, MMM dd, yyyy H:mm:ss tt","ddd MMM d yyyy HH:mm:ss zzz","d"]);g._start=_.process(_.set([g.date,g.time,g.expression],g.generalDelimiter,g.whiteSpace),t.finish);g.start=function(s){try{var r=g._formats.call({},s);if(r[1].length===0){return r;}}catch(e){}
return g._start.call({},s);};}());Date._parse=Date.parse;Date.parse=function(s){var r=null;if(!s){return null;}
try{r=Date.Grammar.start.call({},s);}catch(e){return null;}
return((r[1].length===0)?r[0]:null);};Date.getParseFunction=function(fx){var fn=Date.Grammar.formats(fx);return function(s){var r=null;try{r=fn.call({},s);}catch(e){return null;}
return((r[1].length===0)?r[0]:null);};};Date.parseExact=function(s,fx){return Date.getParseFunction(fx)(s);};

/**
 * Get a quality timestamp
 * @requires datejs ../third_party/datejs.date.js [ http://www.datejs.com/ ]
 */
function TimeStamp() {}

/**
 * Return a timestamp with a UTC offset
 *
 * @param { boolean } _milli include milliseconds
 * @return { string } timestamp with UTC offset
 */
TimeStamp.prototype.withUtc = function( _milli ) {
	var d = new Date();
	var yyyy = d.getFullYear();
	var mm = ('0' + (d.getMonth()+1)).slice(-2);
	var dd = ('0' + d.getDate()).slice(-2);
	var hh = d.getHours();
	var min = ('0' + d.getMinutes()).slice(-2);
	var sec = ('0' + d.getSeconds()).slice(-2);
	var mil = ('0' + d.getMilliseconds()).slice(-3);
	var diff = d.getTimezoneOffset();
	
	//------------------------------------------------------------
	//  Include milliseconds?
	//------------------------------------------------------------
	var time = '';
	if ( _milli ) {
		time = yyyy+'-'+mm+'-'+dd+'T'+hh+":"+min+":"+sec+":"+mil+"UTC";
	}
	else {
		time = yyyy+'-'+mm+'-'+dd+'T'+hh+":"+min+":"+sec+"UTC";		
	}
	
	//------------------------------------------------------------
	//  Get the timezone offset
	//------------------------------------------------------------
	if ( diff > 0 ) {
		time = time+"+"+diff;
	}
	else {
		time = time+"-"+diff;
	}
	return time;
}

/**
 * Return unix time
 *
 * @return { int } unix time
 */
TimeStamp.prototype.unix = function() {
	return new Date().getTime();
}

/**
 * Return millisecond unix time from UTC string
 *
 * @param { string } _string timestamp with UTC offset
 * @return { int } unix time
 */
TimeStamp.prototype.toUnix = function( _string ) {
	//------------------------------------------------------------
	// Kill the UTC offset
	//------------------------------------------------------------
	var cleanTime = _string.replace( /UTC.*/, '' );
	var milli = 0;
	//------------------------------------------------------------
	// Grab the milliseconds if they exist
	//------------------------------------------------------------
	if ( cleanTime.match( /:\d{3}/ ) ) {
		milli = cleanTime.slice( -4 );
		cleanTime = cleanTime.replace( /:\d+$/, '' );
		milli = parseInt( milli.replace(':','') );
	}
	return Date.parse( cleanTime ).getTime() + milli;
}
ObjectExt = function() {}

/**
 * Take number values from one object and numerically add values 
 * from another object if the key names match.
 *
 * @param { obj } _obj1 An Object
 * @param { obj } _obj2 An Object
 */
ObjectExt.prototype.mergeAdd = function( _obj1, _obj2 ) {
	for ( var key in _obj1 ) {
		if ( ! ( key in _obj2 ) ) {
			_obj2[key] = 1;
			continue;
		}
		_obj2[key] += _obj1[key];
	}
}

/**
 * Count the characters of all values in an object
 *
 * @param { obj } _obj An Object
 * @return { int } character count
 */
ObjectExt.prototype.totalChars = function( _obj, _totalRoll, _depth ) {
	_totalRoll = ( _totalRoll == undefined ) ? 0 : _totalRoll;
	_depth = ( _depth == undefined ) ? 0 : _depth;
	for ( var i=0, ii=_obj.length; i<ii; i++ ) {
		var type = typeof _obj[i];
		if ( type == 'object' ) {
			_depth++;
			return this.totalChars( _obj[i], _totalRoll, _depth );
		}
		_totalRoll += _obj[i].toString().length;
	}
	return _totalRoll;
}

/**
 * Count the characters of all values in an object
 *
 * @param { obj } _obj An Object
 * @return { array } character count, array of character counts by column
 */
ObjectExt.prototype.totalKeys = function( _obj ) {
   var total = 0;
   for ( var i in _obj ) {
		if ( _obj.hasOwnProperty( i ) ) {
			total++;
		}
	}
	return total;
}

/**
 * Wrap each value of an object with strings of your choice
 *
 * @param { obj } _obj An Object
 * @param { obj } _str1 Prefix string
 * @param { obj } _str2 Suffix string
 * @return { obj } An Object of wrapped string values
 */
ObjectExt.prototype.wrap = function( _obj, _str1, _str2 ) {
	_str2 = ( _str2 == undefined ) ? _str1: _str2;
	var wrapped = [];
	for ( var i=0, ii=_obj.length; i<ii; i++  ) {
		wrapped[i] = _str1.toString() + _obj[i] + _str2.toString();
	}
	return wrapped;
}

/**
 * src: http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
 *	by A. Levy
 *
 * Clone an object.
 *
 * @param { obj } _obj An Object
 * @return { obj } _obj Cloned Object
*/
ObjectExt.prototype.clone = function( _obj ) {
	//------------------------------------------------------------
	// Handle the 3 simple types, and null or undefined
	//------------------------------------------------------------
	if ( null == _obj || "_object" != typeof _obj ) return _obj;
	//------------------------------------------------------------
	// Handle Date
	//------------------------------------------------------------
	if ( _obj instanceof Date ) {
		var copy = new Date();
		copy.setTime( _obj.getTime() );
		return copy;
	}
	//------------------------------------------------------------
	// Handle Array
	//------------------------------------------------------------
	if ( _obj instanceof Array ) {
		var copy = [];
		for ( var i=0, ii=_obj.length; i<ii; i++ ) {
			copy[i] = this.clone( _obj[i] );
		}
		return copy;
	}
	//------------------------------------------------------------
	// Handle Object
	//------------------------------------------------------------
	if ( _obj instanceof Object ) {
		var copy = {};
		for ( var attr in _obj ) {
			if ( _obj.hasOwnProperty( attr ) ) copy[attr] = this.clone( _obj[attr] );
		}
		return copy;
	}
	throw new Error( "Unable to copy obj! Its type isn't supported." );
}

/**
 * src: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
 *	by Alnitak
 *
 * Use a string as a nested object selector
 *
 * @param { obj } _obj An Object
 * @param { obj } _str Nested selector string
 * @return { ??? } The value stored in _obj referenced by _str
 */
ObjectExt.prototype.byString = function( _obj, _str ) {
	if ( _str == undefined ) {
		return _obj;
	}
	_str = _str.replace(/\[['|"]*(\w+)['|"]*\]/g, '.$1' );
	_str = _str.replace(/^\./, '');
	var a = _str.split('.');
	while ( a.length ) {
		var n = a.shift();
		if ( n in _obj ) {
			_obj = _obj[n];
		}
		else {
			return;
		}
	}
	return _obj;
}
/**
 * A smarter way to control colors
 */
function Culuh( _color ) {
	this.r=0; // red
	this.g=0; // blue
	this.b=0; // green
	this.h=0; // hue
	this.s=0; // saturation
	this.v=0; // value
	if ( _color != undefined ) {
		this.original = _color;
		this.reset();
		this.hsvUpdate();
	}
}

/**
 * Reset the color to the original color 
 * declared in the constructor.
 */
Culuh.prototype.reset = function( ) {
	var self = this;
	var color = this.original;
	
	//------------------------------------------------------------
	//  Check if it's RGB
	//------------------------------------------------------------
	color = color.toUpperCase();
	if ( color.indexOf( 'RGB' ) > -1 ) {
		var vals = color.match( /\d+\.?\d*/g );
		this.r = parseInt( vals[0] );
		this.g = parseInt( vals[1] );
		this.b = parseInt( vals[2] );
	}
	
	//------------------------------------------------------------
	//  No... then it's a hex
	//------------------------------------------------------------
	else {
		var vals = color.match( /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i );
		this.r = this.hexToInt( vals[1] );
		this.g = this.hexToInt( vals[2] );
		this.b = this.hexToInt( vals[3] );
	}
}

/**
 * Builds HSV ( Hue, Saturation, and Value ) from RGB
 * ported from http://lodev.org/cgtutor/color.html
 */
Culuh.prototype.hsvUpdate = function() {
	var h; 
	var s;
	var v;
	
	var r = this.r / 255;
	var g = this.g / 255;
	var b = this.b / 255;
	
	//------------------------------------------------------------
	//  Find the value
	//------------------------------------------------------------
	var min = Math.min( r, g, b );
	var max = Math.max( r, g, b );
	var delta = max-min;
	v = max;
	
	//------------------------------------------------------------
	//  If black well... saturation is easy
	//------------------------------------------------------------
	if ( max == 0 ) {
		s = 0;
	}
	else {
		s = delta / max;
	}
	if ( s == 0 ) {
		h = 0;
	}
	else {
		if ( r == max ) {
			h = ( g-b ) / delta;
		}
		else if ( g == max ) {
			h = 2 + ( b-r ) / delta;
		}
		else {
			h = 4 + ( r-g ) / delta;
		}
		
		if ( isNaN( h ) ) {
			h = 0;
		}
		h /= 6;
		if ( h < 0 ) {
			h++;
		}

	}
	this.h = h * 255;
	this.s = s * 255;
	this.v = v * 255;
}

/**
 * Builds RGB from HSV
 * ported from http://lodev.org/cgtutor/color.html
 */
Culuh.prototype.rgbUpdate = function() {
	var r;
	var g;
	var b;
	
	var h = this.h / 255;
	var s = this.s / 255;
	var v = this.v / 255;
	
	//------------------------------------------------------------
	// No saturation means achromatic aka 'gray'
	//------------------------------------------------------------
	if ( s == 0 ) {
		r = g = b = v;
	}
	
	//------------------------------------------------------------
	// If there is saturation things get messy 
	//------------------------------------------------------------
	else {
		h *= 6;
		var i = Math.floor( h );
		var frac = h % 1;
		var p = v * ( 1 - s );
		var q = v * ( 1 - ( s * frac ));
		var t = v * ( 1 - ( s * ( 1 - frac )));

		switch( i ) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			case 5:
				r = v;
				g = p;
				b = q;
				break;
		}
	}
	this.r = parseInt( r * 255 );
	this.g = parseInt( g * 255 );
	this.b = parseInt( b * 255 );	
}

/**
 * Builds hexadecimal color value
 *
 * @param { string } _pre hexadecimal prefix typically '#' or '0x'
 * @return { string } hexadecimal color value
 */
Culuh.prototype.hex = function( _pre ) {
	_pre = ( _pre == undefined ) ? '' : _pre;
	return _pre + this.rHex() + this.gHex() + this.bHex();
}

/**
 * Returns RGB color value
 *
 * @return { string } rgb color value
 */
Culuh.prototype.rgb = function() {
	return 'rgb('+this.r+','+this.g+','+this.b+')';
}

/**
 * Returns red hex value
 *
 * @return { string } red hex value
 */
Culuh.prototype.rHex = function() {
	return this.intToHex( this.r );
}

/**
 * Returns green hex value
 *
 * @return { string } green hex value
 */
Culuh.prototype.gHex = function() {
	return this.intToHex( this.g );
}

/**
 * Returns blue hex value
 *
 * @return { string } blue hex value
 */
Culuh.prototype.bHex = function() {
	return this.intToHex( this.b );
}

/**
 * Returns red integer value 0-255
 *
 * @return { int } red int value
 */
Culuh.prototype.rInt = function() {
	return this.r;
}

/**
 * Returns green integer value 0-255
 *
 * @return { int } green int value
 */
Culuh.prototype.gInt = function() {
	return this.g;
}

/**
 * Returns blue integer value 0-255
 *
 * @return { int } blue int value
 */
Culuh.prototype.bInt = function() {
	return this.b;
}

/**
 * Converts hex to integer value
 *
 * @return { int } integer value
 */
Culuh.prototype.hexToInt = function( _hex ) {
	return parseInt( _hex, 16 );
}

/**
 * Converts integer to hex value
 *
 * @return { string } hexadecimal value
 */
Culuh.prototype.intToHex = function( _int ) {
	var hex = _int.toString(16);
	if ( hex.length < 2 ) {
		hex = '0'+hex;
	}
	return hex.toUpperCase();
}

/**
 * Change the saturation of the color
 *
 * @param { float } _sat saturation multiplier
 * @param { boolean: false } _new return new Culuh
 *		and don't change the current Culuh values
 * @return { Culuh }
 */
Culuh.prototype.sat = function( _sat, _out ) {
	var sat = this.s;
	sat *= _sat;
	if ( _out != true ) {
		this.s = sat;
		this.rgbUpdate();
	}
	else {
		var out = new Culuh( this.rgb() );
		out.sat( _sat );
		return out;
	}
}

/**
 * Return rgba string with specified alpha value
 *
 * @param { float } _float A number between 0 and 1
 * @return { string }
 */
Culuh.prototype.toAlpha = function( _float ) {
	_float = parseFloat( _float );
	_float = ( _float < 0 ) ? 0 : _float;
	_float = ( _float > 1 ) ? 1 : _float;
	return 'rgba('+this.r+','+this.g+','+this.b+','+_float+')';
}

/**
 * Invert the color
 *
 * @param { boolean: false } _new return new Culuh
 *		and don't change the current Culuh values
 * @return { Culuh }
 */
Culuh.prototype.invert = function( _out ) {
	if ( _out != true ) {
		this.r = 255 - this.r;
		this.g = 255 - this.g;
		this.b = 255 - this.b;
		this.hsvUpdate();
	}
	else {
		var out = new Culuh( this.rgb() );
		out.invert();
		return out;
	}
}
/*!
 * menumucil
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The element that becomes the root of the plugin
	 * @param { obj } _options Configuration options
	 * @param { string } _id The id of the root element 
	 */
	function menumucil( elem, options, id ) {
		var self = this;
		self.elem = elem;
		self.id = id;
		self.init( elem, options );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The element that becomes the root of the plugin
	 * @param { obj } _options Configuration options
	 */
	menumucil.prototype.init = function( elem, options ) {
		var self = this;
		
		//---------------
		//	User options 
		//---------------
		self.options = $.extend({
			closed: "&#9660;",
			open: "&#9650;",
			button_classes: null,
			up: false,
			cover: false
		}, options);
		
		self.events = {
			open: 'MENUMUCIL-OPEN',
			closed: 'MENUMUCIL-CLOSED'
		};
		
		//-----------------------------------
		//	Shared instance method variables
		//-----------------------------------
		self.menu = null;
		self.pane = null;
		self.clicker = null;
		
		//-------------------------
		//	Get the party started  
		//-------------------------
		self.build();
	}
	
	/**
	 * Build the DOM elements needed by the plugin
	 */
	menumucil.prototype.build = function() {
		var self = this;
		self.menu = $( self.elem );
		
		self.menu.addClass( 'menumucil' );
		
		//------------------------------------------------------------
		//  Cover mode?
		//------------------------------------------------------------
		if ( self.options['cover'] || self.options['up'] ) {
			self.menu.css({
				position: 'absolute',
				'z-index': 5000
			});
		}
		self.menu.wrapInner( '<div class="inner" />');
		self.menu.wrapInner( '<div class="pane" />');
		
		self.pane = $( '.pane', self.elem );
		self.pane.addClass( 'closed' );
		
		//------------------------------------------------------------
		//	Create clicker
		//------------------------------------------------------------
		self.clicker = $( document.createElement( 'a' ) );
		self.clicker.attr( 'href', '#' );
		self.clicker.addClass( 'clicker' );
		if ( self.options['button_classes'] != null ) {
		    self.clicker.addClass( self.options['button_classes'] );
		}
		self.menu.append( self.clicker );
		
		//------------------------------------------------------------
		//  The main clicker icon
		//------------------------------------------------------------
		self.icon = $( document.createElement( 'span' ) );
		self.icon.addClass( 'icon' );
		self.clicker.append( self.icon );
		self.icon.html( self.options['closed'] );
		
		
		//------------------------------------------------------------
		//  Extra content that needs to be written to the clicker.
		//  Content counts and that sort of thing.
		//------------------------------------------------------------
		self.extra = $( document.createElement( 'span' ) );
		self.extra.addClass( 'extra' );
		self.clicker.append( self.extra );
		
		//---------------------------------
		//	Register transition listeners  
		//---------------------------------
		self.pane.on( 'transitionEnd webkitTransitionEnd transitionend oTransitionEnd msTransitionEnd', function( _e ) {
			if ( self.pane.hasClass( 'open' ) ) {
				self.pane.css('max-height', 9999);
			}
		});
		
		//------------------------------------------------------------
		//  Cover mode?
		//------------------------------------------------------------
		if ( self.options['cover'] || self.options['up'] ) {
			var height = self.clicker.height();
			self.menu.after( '<div style="height:'+height+'px;clear:both"></div>')
		}
		
		//-----------------------------
		//	Close the menu by default  
		//-----------------------------
		self.closeNow();
		
		//------------------------
		//	Register click event  
		//------------------------
		$( self.clicker ).on( 'click touchstart', function( _e ) {
			if ( self.isOpen() ) {
				self.close();
			}
			else if ( self.pane.hasClass('closed') ) {
				self.open();
			}
			_e.preventDefault();
		})
	}
	
	/**
	 * Check to see if the menu is open.
	 *
	 * @return { boolean }
	 */
	menumucil.prototype.isOpen = function() {
		var self = this;
		if ( self.pane.hasClass('open') ) {
			return true;
		}
		return false;
	}
	
	/**
	 * Check to see if the menu is closed.
	 *
	 * @return { boolean }
	 */
	menumucil.prototype.isClosed = function() {
		var self = this;
		if ( self.pane.hasClass('closed') ) {
			return true;
		}
		return false;
	}
	
	/**
	 * Open the menu.
	 */
	menumucil.prototype.open = function() {
		var self = this;
		self.pane.contentHeight = self.pane.outerHeight();
		self.pane.contentHeight += $( '.inner', self.elem ).outerHeight();
		self.pane.css({
			'max-height': self.pane.contentHeight
		});
		if ( self.options['up'] ) {
			self.menu.css({
				'top': self.menu.position().top - self.pane.contentHeight
			});
		}
		self.pane.removeClass( 'closed' );
		self.pane.addClass( 'open' );
		self.icon.html( self.options['open'] );
		self.pane.trigger( self.events['open'], [self.id] );
	}
	
	/**
	 * Close the menu.
	 */
	menumucil.prototype.close = function() {
		var self = this;
		self.pane.contentHeight = self.pane.outerHeight();
		self.pane.removeClass('transitions').css( 'max-height', self.pane.contentHeight );
		
		//------------------------------------------------------------
		//	This delay is needed for quick close animation
		//------------------------------------------------------------
		setTimeout( function() {
			self.closeNow();
			self.pane.removeClass('open');
			self.pane.addClass('closed');
			self.icon.html( self.options['closed'] );
			self.menu.trigger( self.events['closed'], [self.id] );
		}, 10 );
	}
	
	/**
	 * Close the menu bypassing animations
	 */
	menumucil.prototype.closeNow = function() {
		var self = this;
		self.pane.addClass('transitions').css({
			'max-height': 0
		});
	}

	//----------------
	//	Extend JQuery 
	//----------------
	jQuery(document).ready( function($) {
		jQuery.fn.menumucil = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new menumucil( this, options, id ) );
			});
		};
	})
})(jQuery);
/**
 * Sort arrays
 * @requires ObjectExt.js
 */
function Sorted() {}

/**
 * Sort an array of rectangular objects into rows and columns
 *
 * @{ param } _array (required)
 * @{ param } _x (required)
 * @{ param } _y1 (required)
 * @{ param } _y2 (required)
 * @{ param } _rollover
 * @{ param } _depth
 * @{ return } A sorted two dimensional array of the rectangular objects
 */
Sorted.prototype.areaSort = function( _array, _x, _y1, _y2, _rollover, _depth ) {
	var objExt = new ObjectExt();
	//------------------------------------------------------------
	//  Set some default values
	//------------------------------------------------------------
	_rollover = ( _rollover == undefined ) ? [] : _rollover;
	_depth = ( _depth == undefined ) ? 0 : _depth;
	_x = ( _x == undefined ) ? 'x' : _x;
	_y1 = ( _y1 == undefined ) ? 'y1' : _y1;
	_y2 = ( _y2 == undefined ) ? 'y2' : _y2;
	if ( _rollover.length-1 < _depth ) {
		_rollover[ _depth ] = [];
	}
	//------------------------------------------------------------
	//  Check to make sure _array is an array of objects.
	//------------------------------------------------------------
	if ( typeof _array[0] !== 'object' ) {
		throw "Sorted.areaSort() -- First parameter must be an array of objects";
		return null;
	}
	//------------------------------------------------------------
	//  Find the lowest Y
	//------------------------------------------------------------
	var lowestIndex = 0;
	var lowestY = parseInt( objExt.byString( _array[ lowestIndex ], _y1 ) );
	for ( var i=1, ii=_array.length; i<ii; i++ ) {
		var check = parseInt( objExt.byString( _array[i], _y1 ) );
		if ( check < lowestY ) {
			lowestY = check;
			lowestIndex = i;
		}
	}
	//------------------------------------------------------------
	//  Find other rectangles in row
	//------------------------------------------------------------
	var lowest = _array.splice( lowestIndex, 1 );
	lowest = lowest[0];
	_rollover[ _depth ].push( lowest );
	var min = parseInt( objExt.byString( lowest, _y1 ) );
	var max = parseInt( objExt.byString( lowest, _y2 ) );
	i = _array.length
	while ( i-- ) {
		var y1 = parseInt( objExt.byString( _array[i], _y1 ) );
		var y2 = parseInt( objExt.byString( _array[i], _y2 ) );
		var height = y2-y1;
		var check = y1+height/2;
		if ( check >= min && check <= max ) {
			var splice = _array.splice( i,1 );
			splice = splice[0];
			_rollover[ _depth ].push( splice );
		}
	}
	//------------------------------------------------------------
	//  Done sorting?
	//------------------------------------------------------------
	if ( _array.length == 0 ) {
		//------------------------------------------------------------
		//  Now sort each row by each element's x value
		//------------------------------------------------------------
		for ( var i=0, ii=_rollover.length; i<ii; i++ ) {
			_rollover[i] = this.numSort( _rollover[i], _x );
		}
		return _rollover;
	}
	//------------------------------------------------------------
	//  Nope... well then do it again.
	//------------------------------------------------------------
	else {
		_depth+=1;
		return this.areaSort( _array, _x, _y1, _y2, _rollover, _depth );
	}
}

/**
 * Sort an array of objects ascending numerically by a key's value
 * Keys representing nested arrays can be used.
 *
 * @{ param } _array An array
 * @{ param } _key A selection key string
 */
Sorted.prototype.numSort = function( _array, _key ) {
	var objExt = new ObjectExt();
	function sortKeyNum( _a, _b ) {
		var a = Number( objExt.byString( _a, _key ) );
		var b = Number( objExt.byString( _b, _key ) );
		return  a - b;
	}
	return _array.sort( sortKeyNum );
}

/*!
 * plopup - plopup
 * http://adamtavares.com
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
;(function($) {
	function plopup( _elem, _options, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _options );
	}
	
	plopup.prototype.init = function( _elem, _options ) {
		var self = this;
		self.elem = _elem;
		
		//----------------------
		//	Set default options 
		//----------------------
		self.options = jQuery.extend({
			button:'close'
		}, _options);
		
		//----------------------------------------
		//	Instance scalar variables & constants
		//----------------------------------------
		self.obj = {
			id: null,
			HIDDEN: '-9999px'
		};
		
		self.create();
	}
	
	plopup.prototype.position = function() {
		var self = this;
		var left = ( $(window).width() - $( self.elem ).width() ) / 2;
		var top = ( $(window).height() - $( self.elem ).height() ) / 2;
		$( self.elem ).css({ 
			'display':'block',
			'position':'absolute',
			'z-index':'9999',
			'top':top+'px',
			'left':left+'px'
		});
	}
	
	plopup.prototype.popup = function() {
		var self = this;
		self.position();
		
		//---------------------------------------------------
		//	Broadcast pop-up event to all plopup instances
		//---------------------------------------------------
		$(document).trigger( 'PLOPUP-POPPED', self.obj['id'] );
		$(window).resize( function(){
			//------------------------------------------------------------
			//	Only resize if the popup is visible... duh...
			//------------------------------------------------------------
			if ( $(self.elem).css('display') == 'block' && $(self.elem).css('top') != self.obj['HIDDEN'] ) {
				self.position();
			}
		});
	}
	
	plopup.prototype.hide = function() {
		var self = this;
		$(self.elem).css({'top': self.obj['HIDDEN']});
	}
	
	plopup.prototype.create = function() {
		var self = this;
		
		//---------------
		//	Stash the id 
		//---------------
		self.obj['id'] = $( self.elem ).attr('id');
		
		//---------------------------------
		//	Make sure the element's hidden 
		//---------------------------------
		$( self.elem ).css({'display':'none'});
		
		//------------------------
		//	Create a close button 
		//------------------------
		//----------------------------------------
		//	Create a clear below the close button 
		//----------------------------------------
		var clear = $(document.createElement('div'));
		clear.css({'clear':'both'});
		$(self.elem).prepend(clear);
		
		//------------------------------------------------------------
		//  Create the close button
		//------------------------------------------------------------
		var close = $(document.createElement('a'));
		close.html(self.options['button']);
		close.attr('href', '#'+self.obj['id']+'-close');
		close.addClass('plopup');
		close.addClass('close');
		
		//----------------------------------
		//	Add the close button to the DOM 
		//----------------------------------
		$(self.elem).prepend(close);
		close.css({'clear':'both'});
		
		//--------------------------------------
		//	Click the button and hide the popup 
		//--------------------------------------
		close.click( function( _e ) {
			self.hide();
			_e.preventDefault();
		});
		
		//-------------------------------------------
		//	Register pause event listener for popups 
		//-------------------------------------------
		$(document).bind( 'PLOPUP-POPPED', function( _e, _href ) {
			//------------------------------------
			//	Only one pop-up at a time please. 
			//------------------------------------
			if ( _href != self.obj['id'] ) {
				if ( $(self.elem).css('display') == 'block' && $(self.elem).css('top') != self.obj['HIDDEN'] ) {
					$(self.elem).css({'top': self.obj['HIDDEN']});
				}
			}
		});
		
		//-------------------
		//	Intercept clicks 
		//-------------------
		$('a', document).click( function( _e ) {
			var href = $(this).attr('href');
			if (href == undefined) {
				return;
			}
			href = href.replace('#','');
			
			//--------------------------------------------------------
			//	If an anchor with element id hash has been clicked 
			//	show content in the center 
			//--------------------------------------------------------
			if ( href == self.obj['id'] ) {
				self.popup();
				_e.preventDefault();
			}
		});
	}

	//----------------
	//	Extend JQuery 
	//----------------
	jQuery(document).ready( function($) {
		jQuery.fn.plopup = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new plopup( this, options, id ) );
			});
		};
	})
})(jQuery);
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
		self.w_tags = {};
				
		/**
		 * Load imgspect
		 */
		self.load = function( _override ) {
			_override = ( _override == undefined ) ? false : _override;
			
			//------------------------------------------------------------
			// Display the warning dialog if new thumbnail is clicked
			//------------------------------------------------------------
			if ( self.imgspect != null && _override == false ) {
				self.buildWarning();
				self.warning.popup();
				return;
			}
			
			//------------------------------------------------------------
			//	Build the wait screen
			//------------------------------------------------------------
			self.buildWait();
			self.warning.popup();
			
			//------------------------------------------------------------
			// Visually id the selected thumbnail
			//------------------------------------------------------------
			$('.imgUrn').removeClass('selected');
			$('.imgUrn[rel="'+self.img.src+'"]').addClass('selected');
			
			//------------------------------------------------------------
			// Load the image.
			//------------------------------------------------------------
			$('#imgspect').empty();
			$('#imgspect').append( self.img );
			self.imgspect = $('#imgspect img').imgspect().data('#imgspect img');
			self.urn = self.getUrn();
			
			//------------------------------------------------------------
			// Update the background color of the thumbnail area
			//------------------------------------------------------------
			$('#ict_tool').addClass( 'imgspectLoaded' );
			
			//------------------------------------------------------------
			// Everytime imgspect changes update the output.
			//------------------------------------------------------------
			$( self.imgspect.elem ).on( 'IMGSPECT-UPDATE', function() {
				var tags = self.buildTags();
				$('.imgspect .output' ).val( tags.join("\n\n") );
			});
		};
		
		/**
		 * Get the FACS you need
		 */
		self.buildTags = function() {
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
					</p>\
					<p>\
						You will lose your highlights and captions \
						if you have have not copied them to your main XML document.\
					</p>\
					<p>\
						Do you want to CONTINUE?\
					</p>\
					<div id="imgspectButtons">\
						<a id="imgspectWarningOk" href="">CONTINUE</a>\
						<a id="imgspectWarningCancel" href="">CANCEL</a>\
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
		 * Build the wait screen
		 */
		self.buildWait = function() {
			$('#imgspectWarning').remove();
			$('body').append( '\
				<div id="imgspectWarning">\
					<p>\
						Loading hi-res image.\
					</p>\
					<p>\
						This may take a while.\
					</p>\
					<div class="space"><img src="/javascripts/imgspect/src/img/ajax-loader.gif" /></div>\
				</div>' );
			self.warning = $('#imgspectWarning').plopup({ button:'x' }).data('#imgspectWarning');
			
			//------------------------------------------------------------
			//	When imgspect is ready the warning gets removed... natch
			//------------------------------------------------------------
			$( document ).on( 'IMGSPECT-READY', function() {
				$('#imgspectWarning').remove();
			});
		};
		
		/**
		 * Retreive CITE urn
		 */
		self.getUrn = function() {
			var obj = self.imgspect.src.params();
			return obj['urn'];
		};
		
		/**
		 * Retreive ImgBit coordinates from XML string
		 *
		 * @ param { string } _xml An XML string
		 */
		self.getTags = function( _xml ) {
			var self = this;
			var xmlDoc = $.parseXML( _xml.smoosh() );
			var xml = $( xmlDoc );
			xml.find( "w" ).each( function() {
				//------------------------------------------------------------
				//	Extract the info you need to build an imgbit from the XML
				//------------------------------------------------------------
				var caption = this.innerHTML;
				var facs = $(this).attr('facs');
				var info = facs.split('@');
				var urn = info[0];
				var nums = info[1];
				var coords = nums.split(',');
				
				//------------------------------------------------------------
				//	Store the info in a handy format.
				//------------------------------------------------------------
				if ( !( urn in self.w_tags ) ) {
					self.w_tags[urn] = [];
				}
				self.w_tags[urn].push( {
					caption: caption,
					coords: coords
				});
			});
		};
		
		/**
		 * Add a click event listener
		 *
		 * @ param { string } _selector jQuery selector string
		 */
		self.clickListen = function( _selector ) {
			var self = this;
			//------------------------------------------------------------
			// Once an image is clicked.
			//------------------------------------------------------------
			$( '#'+_selector ).click( function( _e ) {
				_e.preventDefault();
				//------------------------------------------------------------
				//	Check to see if the clicked image has currently been
				//	loaded.
				//------------------------------------------------------------
				var src = $(this).attr('href');
				if ( self.imgspect != null && self.imgspect.src == src ) {
					return;
				}
				//------------------------------------------------------------
				// Load the new image
				//------------------------------------------------------------
				self.img = new Image();
				self.img.onload = function() {
					self.load();
				}
				self.img.src = src;
			});
		};
		
		/**
		 * Turn self.w_tags into Imgspect highlights and imgbits
		 *
		 * @ param { string } _xml An XML string
		 */
		self.loadTags = function () {
			var self = this;
			
			//------------------------------------------------------------
			//	Check to see if src has w_tags associated with it
			//------------------------------------------------------------
			if ( self.w_tags != undefined && !( self.imgspect.src in self.w_tags ) ) {
				return;
			}
			
			//------------------------------------------------------------
			//	Hey there are w_tags!  Let's convert some coordinates.
			//------------------------------------------------------------
			var src = self.imgspect.src;
			var width = self.imgspect.orig_w;
			var height = self.imgspect.orig_h;
			for ( var i=0, ii=self.w_tags[ src ].length; i<ii; i++ ) {
				var coords = self.w_tags[src][i].coords;
				var x1 = Math.floor( coords[0] * width );
				var y1 = Math.floor( coords[1] * height );
				var x2 = Math.floor( coords[2] * width ) + x1;
				var y2 = Math.floor( coords[3] * height ) + y1;
				self.imgspect.liteAdd( x1, y1, x2, y2 );
				self.imgspect.imgbits[i].setCaption( self.w_tags[src][i].caption );
			}
			
			//------------------------------------------------------------
			//	Update the location of all the highlights
			//------------------------------------------------------------
			self.imgspect.resize();
		};
		
		return {
			//------------------------------------------------------------
			//	Revealed properties
			//------------------------------------------------------------
			imgspect: self.imgspect,
			w_tags: self.w_tags,
			
			/**
			 * Build imgspect links
			 *
			 * @ param { obj } _elem
			 * @ param { obj } _results
			 */
			buildLinks: function( _elem, _results ) {
				var url = "http://services.perseus.tufts.edu/sparqlimg/api?request=GetBinaryImage&urn=";
				for ( var i=0, ii=_results.length; i<ii; i++ ) {
					var imgUrn = '<a id="imgUrn_'+i+'"class="imgUrn" href="' + url + _results[i] + '&w=3000"><img src="'+ url + _results[i] + '&w=100"/></a>';
					jQuery( _elem ).append( imgUrn );
					self.clickListen( imgUrn.attr('id'))
				}
			},
			
			/**
			 * See self.getTags() function declaration above.
			 */			
			getTags: self.getTags,
			
			/**
			 * See self.buildTags() function declaration above.
			 */			
			buildTags: self.buildTags,
			
			/**
			 * See self.loadTags() function declaration above.
			 */			
			loadTags: self.loadTags,
			
			/**
			 * See self.load() function declaration above.
			 */
			load: self.load,
			
			clickListen: self.clickListen,
			
			/**
			 * Once imgspect links are loaded add some event listeners
			 */
			start: function() {
				$( document ).on('IMGSPECT-LINK_LOADED', function( _e, _id ) {
					self.clickListen( _id );
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
/*!
 * imgbit
 *
 * The format of the <a> tag needed by imgbit
 * <a href="path.to/your/img.jpg?imgbit=x1=0%y1=0%x2=100%y2=100">Display text or markup!</a>
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The <a> tag holding your urn and display text.
	 * @param { obj } _options Configuration options
	 * @param { string } _id The id of the anchor element 
	 */
	function imgbit( _elem, _options, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _options );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The <a> tag holding your urn and display text.
	 * @param { obj } _options Configuration options
	 */
	imgbit.prototype.init = function( _elem, _options ) {
		var self = this;
		
		//------------------------------------------------------------
		//	User options 
		//------------------------------------------------------------
		self.options = $.extend({
			style: 'full',
			closable: false
		}, _options);
		
		//------------------------------------------------------------
		//	Events
		//------------------------------------------------------------
		self.events = {
			change: 'IMGBIT-CHANGE',
			closed: 'IMGBIT-CLOSED',
			frame: 'IMGBIT-FRAME'
		}
		
		//------------------------------------------------------------
		//	Store original element in plain text
		//------------------------------------------------------------
		self.original = $( self.elem ).myHtml();
		
		//------------------------------------------------------------
		//	Separate the image source and clipping coordinates
		//------------------------------------------------------------
		self.href = $( self.elem ).attr( 'href' );
		self.caption = $( self.elem ).text();
		
		//------------------------------------------------------------
		//	Store the images original height and width
		//------------------------------------------------------------
		self.imgWidth = null;
		self.imgHeight = null;
		
		//------------------------------------------------------------
		//	Time created with UTC offset
		//------------------------------------------------------------
		var timeStamp = new TimeStamp();
		self.timeCreated = timeStamp.withUtc( true );
		
		//------------------------------------------------------------
		//	Get the imgbit parameters
		//------------------------------------------------------------
		var arr = self.href.split('imgbit=');
		self.src = self.href;
		self.param = {};
		if ( arr.length > 1 ) {
			self.src = arr[0].substring( 0, arr[0].length-1 );
			self.param = self.getToJson( arr[1] );
		}
		
		//------------------------------------------------------------
		//  Check for special class options
		//------------------------------------------------------------
		self.specClass();
		
		//------------------------------------------------------------
		//	Check to see if img is in album
		//------------------------------------------------------------
		self.build();
	}
	
	/**
	 * Check for special classes
	 */
	imgbit.prototype.specClass = function() {
		var self = this;
		
		//------------------------------------------------------------
		//	Check to see if special style classes have been passed
		//------------------------------------------------------------
		if ( $( self.elem ).hasClass('min') ) {
			self.options['style'] = null;
		}
		if ( $( self.elem ).hasClass('edit') ) {
			self.options['style'] = 'edit';
		}
		if ( $( self.elem ).hasClass('closable') ) {
			self.options['closable'] = true;
		}
	}
	
	/**
	 * Build the imgbit DOM elements
	 */
	imgbit.prototype.fixParams = function() {
		var self = this;
		
		//------------------------------------------------------------
		//	Explicit width?
		//------------------------------------------------------------
		if ( self.param.w != undefined ) {
			self.param.z = self.param.w / ( self.param.x2 - self.param.x1 );
		}
		
		//------------------------------------------------------------
		//	Explicit height?
		//------------------------------------------------------------
		if ( self.param.h != undefined ) {
			self.param.z = self.param.h / ( self.param.y2 - self.param.y1 );
		}
		
		//------------------------------------------------------------
		//	Color?
		//------------------------------------------------------------
		if ( self.param.c != undefined ) {
			self.culuh = new Culuh( self.param.c );
		}
		
		//------------------------------------------------------------
		//	Zoom?
		//------------------------------------------------------------
		self.param.z = ( self.param.z == undefined ) ? 1 : self.param.z;
	}
	
	/**
	 * Build the imgbit DOM elements
	 */
	imgbit.prototype.build = function() {
		var self = this;
		
		//------------------------------------------------------------
		//	Store the id
		//------------------------------------------------------------
		var id = $( self.elem ).attr('id');
		
		//------------------------------------------------------------
		//	Change anchor tag to div
		//------------------------------------------------------------
		$( self.elem ).after( '<div class="imgbit">' );
		self.elem = $( self.elem ).next();
		
		//------------------------------------------------------------
		//	Add the id
		//------------------------------------------------------------
		$( self.elem ).attr( 'id', id );
		
		//------------------------------------------------------------
		//	Remove the original anchor tag.
		//------------------------------------------------------------
		var a = $( self.elem ).prev();
		var html = a.html();
		a.remove();
		
		//------------------------------------------------------------
		//	Add the style class if it is not null
		//------------------------------------------------------------
		if ( self.options['style'] != null ) {
			$( self.elem ).addClass( self.options['style'] );
		}
		
		//------------------------------------------------------------
		//	Create the viewport
		//------------------------------------------------------------
		$( self.elem ).append( '<div class="view">' );
		
		//------------------------------------------------------------
		//	Store the a tag text
		//------------------------------------------------------------
		$( self.elem ).append( '<div class="text">'+ html +'</div>' );
		$( '.text', self.elem ).hide();
		if ( self.options['style'] != null ) {
			$( '.text', self.elem ).show();
		}
		
		//------------------------------------------------------------
		//	Load the image
		//------------------------------------------------------------
		var img = new Image();
		img.onload = function() {
			$( this ).addClass('star');
			
			//------------------------------------------------------------
			//	Store the orignal size of the image
			//------------------------------------------------------------
			self.imgWidth = img.width;
			self.imgHeight = img.height;
			
			//------------------------------------------------------------
			//  Relative to explicit
			//------------------------------------------------------------
			self.toExplicit();
			self.fixParams();
			
			//------------------------------------------------------------
			//	Add the image to the view
			//------------------------------------------------------------
			$( '.view', self.elem ).append( this )
			
			//------------------------------------------------------------
			//	Crop the view to the area dimensions
			//------------------------------------------------------------
			self.viewCrop();
		
			//------------------------------------------------------------
			//	Move the image into place and scale it
			//------------------------------------------------------------
			self.imgMove();
		
			//------------------------------------------------------------
			//	Add a clear
			//------------------------------------------------------------
			$( self.elem ).prepend( '<div style="clear:both"></div>' );
		
			//------------------------------------------------------------
			//	Add a link to the source image
			//------------------------------------------------------------
			if ( self.options['style'] != null && self.options['style'] != 'edit' ) {
				$( self.elem ).prepend( '<a class="source" href="'+ self.src +'">source</a>' );
			}
			
			//------------------------------------------------------------
			//	Scale imgbit container to size of image
			//------------------------------------------------------------
			$( self.elem ).css({
				width: $( '.view', self.elem ).width()
			});
			
			//------------------------------------------------------------
			//	If the edit tag is set, create the edit dom elements
			//------------------------------------------------------------
			self.editStart();
			
			//------------------------------------------------------------
			//	If the imgbit is closable add the close button
			//------------------------------------------------------------
			if ( self.options['closable'] == true ) {
				self.closeBuild();
			}
			
			//------------------------------------------------------------
			//	If the color has been set... set the color
			//------------------------------------------------------------
			if ( self.param.c != undefined ) {
				$( self.elem ).css({
					'background-color': '#'+self.param.c
				});
				$( '.close', self.elem ).css({
					'background-color': '#'+self.param.c
				})
			}
			
			//------------------------------------------------------------
			//	Let the world know you've changed
			//------------------------------------------------------------
			$( self.elem ).trigger( self.events['change'] );
		}
		img.src = self.src;
	}

	/**
	 * Build the close button and start the click listener
	 */ 
	imgbit.prototype.closeBuild = function() {
		var self = this;
		$( self.elem ).prepend( '<a href="" class="close">x</a>' );
		$( '.close', self.elem ).click( function( _e ) {
			$( self.elem ).trigger( self.events['closed'] );
			$( self.elem ).trigger( self.events['change'] );
			_e.preventDefault();
		});
	}
	
	/**
	 * Resize caption textarea to match static caption
	 */
	imgbit.prototype.captionResize = function() {
		var self = this;
		var text = $( '.text', self.elem );
		
		//------------------------------------------------------------
		//	jQuery's height() method returns incorrect values if
		//	the targeted element is hidden.	 So we have to do a
		//	a little show and hide voodoo to get an accurate height
		//	value.	Hopefully it won't cause any strobing.
		//------------------------------------------------------------
		var hide = false;
		if ( text.is(':visible') == false ) {
			hide = true;
		}
		text.show();
		var textHeight = text.height();
		if ( hide == true ) {
			text.hide();
		}
		var fontSize = parseInt( text.css( 'font-size' ).replace( 'px', '' ) );
		var height = ( textHeight > fontSize ) ? textHeight : fontSize;
		$( '.caption', self.elem ).height( height )
	}
	
	/**
	 * Build DOM elements needed for edit style
	 *
	 * @param { imgbit } _self There are weird scopr
	 */
	imgbit.prototype.editStart = function() {
		var self = this;
		if ( self.options['style'] == 'edit' ) {
			
			//------------------------------------------------------------
			//	Build the edit DOM elements.
			//------------------------------------------------------------
			self.editBuild();
			
			//------------------------------------------------------------
			//	Resize the caption as neeeded.
			//------------------------------------------------------------
			self.captionResize();
			
			//------------------------------------------------------------
			//	Listen for return key.	
			//------------------------------------------------------------
			$( '.caption', self.elem ).keypress( function( _e ) {
				if ( _e.which == 13) {
					self.editSwitch();
				};
			});
			
			//------------------------------------------------------------
			//	Keep editable and static caption synched.
			//------------------------------------------------------------
			$( '.caption', self.elem ).bind( 'input propertychange', function() {
				self.setCaption( $( '.caption', self.elem ).val() );
			});
		}
	}
	
	/**
	 * Remove the imgbit from the DOM
	 */
	imgbit.prototype.remove = function() {
		var self = this;
		$( self.elem ).remove();
	}
	
	/**
	 * Update the caption
	 */
	imgbit.prototype.setCaption = function( _caption ) {
		var self = this;
		self.caption = _caption;
		$( '.text', self.elem ).text( self.caption );
		self.captionResize();
		//------------------------------------------------------------
		//	Let the application know you've changed.
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['change'] );
	}
	
	/**
	 * Change the ids
	 */
	imgbit.prototype.idUpdate = function( _id ) {
		var self = this;
		$( self.elem ).attr( 'id', _id );
	}
	
	/**
	 * Build the edit DOM elements
	 */
	imgbit.prototype.editBuild = function() {
		var self = this;
		//------------------------------------------------------------
		//	Build a caption
		//------------------------------------------------------------
		var textarea = '<textarea class="caption">'+$( '.text', self.elem ).text()+'</textarea>';
		$( '.text', self.elem ).after( textarea );
		
		//------------------------------------------------------------
		//	Set the width of the caption textarea to the size of the 
		//	image and the height of the static caption.
		//------------------------------------------------------------
		 $( '.caption', self.elem ).css({ 
			width: $( '.view', self.elem).width()
		});
		
		//------------------------------------------------------------
		//	If a color has been set desaturate the color.
		//------------------------------------------------------------
		if ( self.culuh != undefined ) {
			$( '.caption', self.elem ).css({
				'background-color': self.culuh.sat( 0.35, true ).hex()
			});
		}
		$( '.caption', self.elem ).hide();
		
		//------------------------------------------------------------
		//	Switch between editable and static captions
		//------------------------------------------------------------
		$( '.text', self.elem ).on( 'touchstart click', function( _e ) {
			_e.preventDefault();
			self.editSwitch();
		});
		
		//------------------------------------------------------------
		//  Clicking outside a focused imgbit will uneditify them.
		//------------------------------------------------------------
		$( document ).on( 'touchstart click', function( _e ) {
			if ( $( _e.target ).html() == $( '.caption', self.elem ).html() ||
				 $( _e.target ).html() == $( '.text', self.elem ).html() ) {
				return;
			}
			self.editHide();
		});
	}
	
	/**
	 * Switch between static caption and textarea caption
	 */
	imgbit.prototype.editSwitch = function() {
		var self = this;
		if ( $( '.caption', self.elem ).is(":visible") ) {
			self.editHide();
		}
		else {
			//------------------------------------------------------------
			//	There can only be one imgbit caption editor
			//	Calling editHide() on the prototype object will
			//	call that method for all instances.
			//------------------------------------------------------------
			imgbit.prototype.editHide();
			self.editShow();
		}
	}
	
	/**
	 * Hide caption textarea
	 */
	imgbit.prototype.editHide = function() {
		var self = this;
		$( '.caption', self.elem ).hide();
		$( '.text', self.elem ).show();
	}
	
	/**
	 * Show caption textarea
	 */
	imgbit.prototype.editShow = function() {
		var self = this;
		$( '.text', self.elem ).hide();
		$( '.caption', self.elem ).show();
		$( '.caption', self.elem ).cursorToEnd();
	}
	
	/**
	 * Crop the view window
	 */
	imgbit.prototype.viewCrop = function() {
		var self = this;
		$( '.view', self.elem ).css({
			width: ( self.param.x2 - self.param.x1 ) * self.param.z,
			height: ( self.param.y2 - self.param.y1 ) * self.param.z
		});
		$( self.elem ).css({
			width: ( self.param.x2 - self.param.x1 ) * self.param.z
		});
	}
	
	/**
	 * Move the image into place
	 */
	imgbit.prototype.imgMove = function() {
		var self = this;
		$( 'img.star', self.elem ).css({
			width: self.imgWidth * self.param.z,
			height: self.imgHeight * self.param.z,
			left: self.param.x1*-1*self.param.z,
			top: self.param.y1*-1*self.param.z
		});
	}
	
	/**
	 * Show an imgbit sequence
	 *
	 * @param { obj } The sequence config.  See examples/imgbit/sequence
	 * @param { bool } Loop the sequence?
	 * @param { int } Current index of sequence
	 */
	imgbit.prototype.sequence = function( _sequence, _loop, _i ) {
		var self = this;
		//------------------------------------------------------------
		//  Default values
		//------------------------------------------------------------
		_i = ( _i != undefined ) ? _i : 0;
		_loop = ( _loop == undefined ) ? false : _loop;
		//------------------------------------------------------------
		//  Looping logic...
		//------------------------------------------------------------
		if ( _sequence.length <= _i ) {
			if ( _loop == true ) {
				self.sequence( _sequence, _loop, 0 );
			}
			return;
		}
		//------------------------------------------------------------
		//  Put sequence config in place
		//------------------------------------------------------------
		self.param.x1 = _sequence[ _i ]['coords'][0];
		self.param.y1 = _sequence[ _i ]['coords'][1];
		self.param.x2 = _sequence[ _i ]['coords'][2] + self.param.x1;
		self.param.y2 = _sequence[ _i ]['coords'][3] + self.param.y1;
		self.param.z = _sequence[ _i ]['coords'][4];
		var wipe = ( _sequence[ _i ]['wipe'] == undefined ) ? 1 : _sequence[ _i ]['wipe'];
		var stay = ( _sequence[ _i ]['stay'] == undefined ) ? 5 : _sequence[ _i ]['stay'];
		//------------------------------------------------------------
		//  Animate Transitions
		//------------------------------------------------------------
		$( 'img.star, .view', self.elem ).css({
			transition: "all " + wipe + "s",
			'-webkit-transition': "all " + wipe + "s"
		});
		$( self.elem ).css({
			transition: "all " + wipe + "s",
			'-webkit-transition': "all " + wipe + "s"
		});
		self.imgMove();
		self.viewCrop();
		//------------------------------------------------------------
		//  Captions, Captions, Captions
		//------------------------------------------------------------
		$( '.caption', self.elem ).hide();
		var caption = null;
		if ( 'caption' in _sequence[ _i ] ) {
			caption = _sequence[ _i ]['caption'];
			if ( self.options['style'] != 'min' || self.options['style'] != null ) {
				$( '.caption', self.elem ).show();
				self.setCaption( caption );
			}
		}
		//------------------------------------------------------------
		//  Next Frame!
		//------------------------------------------------------------
		_i++;
		setTimeout( function() {  
			self.sequence( _sequence, _loop, _i );
		}, (stay+wipe) * 1000 );
		//------------------------------------------------------------
		//  Alert the DOM of what you're doing.
		//  Passing along the caption for custom display.
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['frame'], { 'caption': caption } );
	}
	
	/**
	 * Turn GET parameter string into a JSON object
	 *
	 * @param { string } HTTP Get style string
	 * @return { obj } JSON
	 */
	imgbit.prototype.getToJson = function( _get ) {
		if ( _get == "" || _get == undefined ) return {};
		var json = {};
		var key_vals = _get.split('%');
		for ( var i=0, ii=key_vals.length; i<ii; i++ ) {
			var param = key_vals[i].split('=');
			if ( param.length != 2 ) {
				continue;
			}
			json[ param[0] ] = decodeURIComponent( param[1].replace( /\+/g, "" ) );
		}
		return json;
	}
	
	/**
	 * Turn imgbit into imgbit constructor HTML
	 * You know the markup you need to start imgbit
	 *
	 * @return { string } HTML representation
	 */
	imgbit.prototype.html = function() {
		var self = this;
		var questAnd = ( self.src.indexOf('?') == -1 ) ? '?' : '&';
		var html = '<a class="imgbit" \
						href="'+self.src+'\
						'+questAnd+'imgbit=\
						x1='+self.param['x1']+'\
						%y1='+self.param['y1']+'\
						%x2='+self.param['x2']+'\
						%y2='+self.param['y2']+'\
						%c='+self.param['c']+'\
						%z='+self.param['z']+'">\
						'+self.caption+'\
					<a>';
		return html.smoosh();
	}
	
	/**
	 * Turn imgbit into imgbit constructor HTML
	 * You know the markup you need to start imgbit
	 *
	 * @return { string } HTML representation
	 */
	imgbit.prototype.sequenceFormat = function() {
		var self = this;
		var x1 = parseInt( self.param.x1 );
		var y1 = parseInt( self.param.y1 );
		var width = parseInt( self.param.x2 ) - parseInt( self.param.x1 );
		var height = parseInt( self.param.y2 ) - parseInt( self.param.y1 );
		var zoom = self.param.z;
		var output = {
			coords: [ x1, y1, width, height, zoom ],
			caption: self.caption
		};
		return output;
	}
	
	/**
	 * Returns coordinates for cite urns.
	 * All coordinates are stored as ratios to the original height and width
	 * 
	 * @return { array } [ top-left-x, top-left-y, width, height ]
	 */
	imgbit.prototype.relative = function() {
		return this.citeCoords();
	}
	imgbit.prototype.citeCoords = function() {
		var self = this;
		var output = [];
		output[0] = self.param.x1 / self.imgWidth;
		output[1] = self.param.y1 / self.imgHeight;
		output[2] = ( self.param.x2 - self.param.x1 ) / self.imgWidth;
		output[3] = ( self.param.y2 - self.param.y1 ) / self.imgHeight;
		for( var i=0, ii=output.length; i<ii; i++ ) {
			output[i] = output[i].toFixed(4);
		}
		return output;
	}
	
	/**
	 * @return { boolean }
	 */
	imgbit.prototype.toExplicit = function() {
		var self = this;
		if ( self.param.w <= 1 && self.param.h <= 1 && self.param.x <= 1 && self.param.y <= 1 ) {
			self.param.x1 = self.param.x * self.imgWidth;
			self.param.y1 = self.param.y * self.imgHeight;
			self.param.x2 = self.param.x1 + self.param.w * self.imgWidth;
			self.param.y2 = self.param.y1 + self.param.h * self.imgHeight;
			delete self.param.x;
			delete self.param.y;
			delete self.param.w;
			delete self.param.h;
		}
	}
	
	/**
	 * Returns an imgbit transcription in open annotation spec JSON
	 *
	 * @param { json } JSON with additional info 
	 *				   needed to construct a complete JSON LD object
	 *
	 *		"@id": "http://perseids.org/collections/urn:cite:perseus:annsimp.1.1",
	 *		"annotatedBy": {
	 *			"@id": "http://data.perseids.org/people/1",
	 *			"mbox": {
	 *				"@id": "mailto:name@email.com"
	 *			}
	 *			"name": "Name"
	 *		}
	 *		"hasBody": "http://perseids.org/collections/urn:cite:perseus:lci.1",
	 *		"hasTarget": "http://perseids.org/citations/urn:cts:greekLit:tlg0008.tlg001.perseus-grc1:6.103"
	 *
	 *
	 * @return { json } JSON LD http://www.openannotation.org/spec/core/
	 */
	imgbit.prototype.toJsonLD = function( _info ) {
		var self = this;
		return {
			"@context": "http://www.w3.org/ns/oa-context-20130208.json",
			"@type": "oa:Annotation",
			"annotatedAt": self.timeCreated,
			"annotatedBy": {
				"@type": "foaf:Person"
			},
			"motivatedBy": "perseus:transcribing",
			"label": "isQuotationOf"
		}
	}
	
	/**
	 * "Register" this plugin with jQuery
	 */
	jQuery(document).ready( function($) {
		jQuery.fn.imgbit = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new imgbit( this, options, id ) );
			});
		};
	})
})(jQuery);
/*!
 * imgspect
 */
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The img element you want to inspect
	 * @param { obj } _options Configuration options
	 * @param { string } _id The id of the img element 
	 */
	function imgspect( _elem, _options, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _options );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The image DOM element you want to inspect
	 * @param { obj } _options Configuration options
	 */
	imgspect.prototype.init = function( _elem, _options ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Lite colors
		//------------------------------------------------------------
		self.colors = {
			'YELLOW': '#FFFF00',
			'MAGENTA': '#FF00FF',
			'CYAN': '#00FFFF'
		}
		
		//------------------------------------------------------------
		// 	User options 
		//------------------------------------------------------------
		self.options = $.extend({
			zoom_unit: .1,
			lite_color: new Culuh( self.colors['YELLOW'] ),
			lite_opacity: .4,
			secs: .5, // default number of seconds it takes for goTo() animations
			load: null, // object to load at startup to build lites and imgbits
			info: null
		}, _options);
		
		//------------------------------------------------------------
		//  Events
		//------------------------------------------------------------
		self.events = {
			change: 'IMGSPECT-CHANGE',
			undo: 'IMGSPECT-UNDO',
			error: 'IMGSPECT-ERROR',
			update: 'IMGSPECT-UPDATE',
			ready: 'IMGSPECT-READY'
		}
		
		//------------------------------------------------------------
		//  Plugin properties
		//------------------------------------------------------------
		self.lites = [];
		self.imgbits = [];
		self.zoom_n = 1;
		self.zoom_shift = null;
		self.pan = { x:0, y:0 };
		self.c_lite = null;
		
		//------------------------------------------------------------
		//  Original height and width
		//------------------------------------------------------------
		self.orig_w = $( self.elem ).width();
		self.orig_h = $( self.elem ).height();
		
		//------------------------------------------------------------
		//  Nav scaling factor
		//------------------------------------------------------------
		self.nav_scale = 1;
		
		//------------------------------------------------------------
		//  Drag nav x distance difference
		//------------------------------------------------------------
		self.dragDiff = { top: 0, left: 0 };
		
		//------------------------------------------------------------
		//  Will store the source of the img
		//------------------------------------------------------------
		self.src = null;
		
		//------------------------------------------------------------
		//	Build the application and get ready for interactivity
		//------------------------------------------------------------
		self.build();
		self.resize();
		
		//------------------------------------------------------------
		//  Create the output window after the nav resize
		//------------------------------------------------------------
		self.outputBuild();
		self.start();
		
		//------------------------------------------------------------
		//  Let everything listening know imgspect is ready
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['ready'] );
	}
	/**
	 * Return a jsonLD object
	 */
	imgspect.prototype.toJsonLD = function() {
		var self = this;
		var jsonLD = [];
		for ( var i=0, ii=self.imgbits.length; i<ii; i++ ) {
			jsonLD[i] = self.imgbits[i].toJsonLD( self.options['info'] );
		}
		return jsonLD;
	}
	
	/**
	 * Dump an imgspect object to the console
	 */	
	imgspect.prototype.dump = function() {
		console.log( this );
	}
	
	/**
	 * Build the imgspect DOM elements
	 */
	imgspect.prototype.build = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Wrap the image in the imgspect class.
		//------------------------------------------------------------
		$( self.elem ).wrap( '<div class="imgspect">' );
		self.elem = $( self.elem ).parent();
		
		//------------------------------------------------------------
		//  Create the navigation window aka the 'nav'
		//------------------------------------------------------------
		$( 'img', self.elem ).wrap( '<div class="nav">' );
		
		//------------------------------------------------------------
		//  Create the navigation dragger aka the 'drag'
		//------------------------------------------------------------
		$( '.nav', self.elem ).prepend( '<div class="drag">' );
		
		//------------------------------------------------------------
		//  Wrap containers so nav and tools can be center aligned
		//------------------------------------------------------------
		$( '.nav', self.elem ).wrap( '<div class="ui">' );
		$( '.ui', self.elem ).wrap( '<div class="center">' );
		
		//------------------------------------------------------------
		//  Create the viewport aka the 'view
		//------------------------------------------------------------
		$( self.elem ).prepend( '<div class="view">' );
		
		//------------------------------------------------------------
		//  Create the drawing area aka the 'drawable image'
		//------------------------------------------------------------
		$( '.view', self.elem ).prepend( '<div class="draw">' );
		
		//------------------------------------------------------------
		//  Set image as drawing area background
		//------------------------------------------------------------
		self.src = $( '.nav img', self.elem ).attr('src');
		$( '.draw', self.elem ).css({ 
			'background-image': "url('"+self.src+"')"
		});
		
		//------------------------------------------------------------
		//  Create the tool buttons
		//------------------------------------------------------------
		self.toolsBuild();
		
		//------------------------------------------------------------
		//  Create the dropdown
		//------------------------------------------------------------
		self.dropBuild();
		
		//------------------------------------------------------------
		//  Clear element so no unexpected wrapping occurs
		//------------------------------------------------------------
		$( self.elem ).append( '<div style="clear:both">' );
	}
	
	/**
	 * Add the DOM elements that make up the tools
	 */
	imgspect.prototype.toolsBuild = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Build the tool area
		//------------------------------------------------------------
		$( '.ui', self.elem ).append( '<div class="tools">' );
		
		//------------------------------------------------------------
		//  Create the zoom buttons
		//------------------------------------------------------------
		$( '.tools', self.elem ).append('\
			<a href="#" class="tool zoom in">+</a>\
			<a href="#" class="tool zoom out">-</a>\
		');
		
		//------------------------------------------------------------
		//  Build the color
		//------------------------------------------------------------
		$( '.tools', self.elem ).append( '<div class="colors">' );
		for ( var i in self.colors ) {
			var name = i.toLowerCase();
			$( '.colors', self.elem ).append( '<a href="#" class="tool color '+ name + '">&nbsp;<a>' );
			$( '.color.'+name, self.elem ).css({
				'background-color': self.colors[i]
			});
		}
		$( '.tools', self.elem ).append( '<a href="#" class="tool undo">&larr;</a>' );
		$( '.tools', self.elem ).append( '<div style="clear:both">' );
	}
	
	/**
	 * Build the dropdown
	 */	
	imgspect.prototype.dropBuild = function() {
		var self = this;
		var drop = '\
			<div id="drop">\
				<div class="sortBits">\
					<a href="" id="time" class="sort">Time</a>\
					<a href="" id="space" class="sort">Space</a>\
				</div>\
				<div class="imgbits"></div>\
			</div>';
		$( self.elem ).before( drop.smoosh() );
		$( '#drop .sortBits' ).hide();
		self.drop = $( '#drop' ).menumucil({ 
			cover: true,
			closed: '&#9660',
			open: '&#9650'
		 }).data( '#drop' );
		self.dropStart();
	}
	
	/**
	 * Update the dropdown counter
	 */	
	imgspect.prototype.dropCount = function() {
		var self = this;
		var count = self.lites.length;
		$( '#drop .extra' ).text( count );
	}
	
	/**
	 * Start the dropdown listener
	 */	
	imgspect.prototype.dropStart = function() {
		var self = this;
		$( self.elem ).on( self.events['change'], function( _e ) {
			var id = self.liteLast().id;
			self.imgbitAdd( id );
			self.dropCount();
		});
		
		//------------------------------------------------------------
		//  Sort listeners
		//------------------------------------------------------------
		$( '#drop .sort' ).on( 'touchstart click', function( _e ) {
			_e.stopPropagatin();
			_e.preventDefault();
			var type = $( this ).attr('id');
			self.imgbitsSort( type );
		})
	}
	
	/**
	 * Add an imgbit to the drop-down
	 *
	 * @param { int } _id Lite id
	 */	
	imgspect.prototype.imgbitAdd = function( _id ) {
		var self = this;
		var imgbit = self.liteToImgbit( _id );
		$( '#drop .imgbits' ).append( imgbit );
		
		//------------------------------------------------------------
		//  Start the imgbit and store a reference to it
		//------------------------------------------------------------
		var id = '#drop #imgbit-'+_id;
		self.imgbits.push( $( id ).imgbit().data( id ) );
		self.imgbitStart( _id );
	}
	
	/**
	 * Sort the imgbits in the drop-down menu.
	 *
	 * @param { string } _method string time, space
	 */
	imgspect.prototype.imgbitsSort = function( _method ) {
		var self = this;
		_method = ( _method == undefined ) ? 'time' : _method
		
		//------------------------------------------------------------
		//  Sort the imgbits
		//------------------------------------------------------------
		var timeStamp = new TimeStamp();
		var out = [];
		switch ( _method ) {
			case 'time':
				for ( var i=0, ii=self.imgbits.length; i<ii; i++ ) {
					var timeCreated = self.imgbits[i].timeCreated;
					var time = timeStamp.toUnix( timeCreated );
				}
				break;
			case 'space':
				var sorted = new Sorted();
				var imgbits = sorted.areaSort( self.imgbits, "param.x1", "param.y1", "param.y2" );
				break;
		}
	}
	
	/**
	 * Remove an imgbit from the DOM
	 *
	 * @param { int } _id imgbit id
	 * @param { bool } _imgbit Remove imgbit from the DOM
	 */
	imgspect.prototype.imgbitRemove = function( _id, _imgbit ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.imgbits.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
		self.imgbits[_id].remove();
		var imgbit = self.imgbits.splice( _id, 1 );
		
		//------------------------------------------------------------
		//  Reshuffle ids
		//------------------------------------------------------------
		for ( var i=0, ii=self.imgbits.length; i<ii; i++ ) {
			self.imgbits[i].idUpdate( 'imgbit-'+i );
			
			//------------------------------------------------------------
			//  Remove the listeners
			//------------------------------------------------------------
			self.imgbits[i].elem.off( 'IMGBIT-CHANGE' );
			self.imgbits[i].elem.off( 'IMGBIT-CLOSED' );
			
			//------------------------------------------------------------
			//  Reset the listeners
			//------------------------------------------------------------
			self.imgbitStart( i );
		}
				
		//------------------------------------------------------------
		//  Update the count
		//------------------------------------------------------------
		self.dropCount();
	}
	
	/**
	 * Start imgbit event listeners
	 *
	 * @param { int } _id Lite id
	 */
	imgspect.prototype.imgbitStart = function( _id ) {
		var self = this;
		//------------------------------------------------------------
		//  Clicking an imgbit will take you to its position in
		//  the original image.
		//------------------------------------------------------------
		$( '#drop #imgbit-'+_id+' .view' ).on( 'touchstart click', function( _e ) {
			_e.stopPropagation();
			_e.preventDefault();
			self.drop.close();
			var id = $(this).parent().attr('id');
			var i = parseInt( id.replace( 'imgbit-', '') );
			//------------------------------------------------------------
			//  Wait a bit before moving
			//------------------------------------------------------------
			setTimeout( function() {
				self.liteShow( i );
			}, 500 );
		});
		
		//------------------------------------------------------------
		//  Listen for any changes
		//------------------------------------------------------------
		$( '#drop #imgbit-'+_id ).on( 'IMGBIT-CHANGE', function() {
			self.outputUpdate();
		});
		
		//------------------------------------------------------------
		//  Listen for remove click
		//------------------------------------------------------------
		$( '#drop #imgbit-'+_id ).on( 'IMGBIT-CLOSED', function() {
			self.liteRemove( _id );
		});
	}

	/**
	 * Build the output area
	 */
	imgspect.prototype.outputBuild = function() {
		var self = this;
		$( '.tools', self.elem ).append( '<textarea readonly="readonly" id="imgspectOut" class="output"></textarea>' );
		$( '.output', self.elem ).css({
			'max-height': $( '.nav', self.elem ).innerHeight() - $( '.tool', self.elem ).outerHeight()
		});
		self.outputInitText();
	}
	
	/**
	 * Initial preformatted text for the output area
	 */
	imgspect.prototype.outputInitText = function() {
		var self = this;
		var output = '\
WELCOME TO IMGSPECT \n\
------------------- \n\
Imgspect is a tool for captioning or transcribing select areas of large images.\n\n\
Unique identifiers for your captioned areas will be written to this output window once you begin. \n\n\
\n\
HOW TO USE IMGSPECT \n\
------------------- \n\
Drag the see-through white rectangle over the area of the smaller image you want to inspect. \n\n\
Click and drag your mouse over the larger image to highlight areas you\'re interested in. \n\n\
Click the color squares to change the highlight color. \n\n\
Click the plus and minus buttons to zoom the larger image in and out. \n\n\
Click the back-arrow to remove the last highlight. \n\n\
Click the triangle to open a drop-down of just your highlighted areas. \n\n\
In the drop-down view click the hash tag to caption or transcribe the highlighted area.\n\n\
In the drop-down view click an img to find its original position in the larger image.\n\n\
';
		$( '.output', self.elem ).val( output.trim() );
	}
	
	/**
	 * Update the output area
	 */
	imgspect.prototype.outputUpdate = function() {
		var self = this;
		$( '.output', self.elem ).val('');
		var output = '';
		//------------------------------------------------------------
		//  Loop through all the imgbits and return their HTML
		//------------------------------------------------------------
		for ( var i=0, ii=self.imgbits.length; i<ii; i++ ) {
			output += self.imgbits[i].html() + "\n";
		}
		$( '.output', self.elem ).val( output );
		$( self.elem ).trigger( self.events['update'] );
	}
	
	/**
	 * Update the output area with a sequence
	 */
	imgspect.prototype.outputSequence = function() {
		var self = this;
		$( '.output', self.elem ).val('');
		//------------------------------------------------------------
		//  Loop through the imgbits and return a sequence object
		//------------------------------------------------------------
		var items = [];
		for ( var i=0, ii=self.imgbits.length; i<ii; i++ ) {
			items[i] = self.imgbits[i].sequenceFormat();
		}
		$( '.output', self.elem ).val( JSON.stringify( items ) );
	}
	
	/**
	 * Resize imgspect
	 */
	imgspect.prototype.resize = function() {
		var self = this;
		self.navResize();
		self.viewResize();
		self.drawResize();
		self.dragResize();
		self.liteResize();
	}
	
	/**
	 * Store location difference of nav window and dragger
	 * for more accurate placement during window resizes.
	 */
	imgspect.prototype.dragNavDiff = function() {
		var self = this;
		var dleft = $( '.nav .drag', self.elem ).offset().left;
		var nleft = $( '.nav', self.elem ).offset().left;
		var dtop = $( '.nav .drag', self.elem ).offset().top;
		var ntop = $( '.nav', self.elem ).offset().top;
		self.dragDiff['left'] = dleft-nleft;
		self.dragDiff['top'] = dtop-ntop;
	}
	
	/**
	 * Start imgspect
	 */
	imgspect.prototype.start = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Start event listeners
		//------------------------------------------------------------
		self.zoomStart();
		self.undoStart();
		self.liteStart();
		self.dragStart();
		self.scrollStart();
		self.sizeStart();
		self.colorStart();
	}
	
	/**
	 * Start the color
	 */
	imgspect.prototype.colorStart = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Select the first color
		//------------------------------------------------------------
		var first = $( '.color:first', self.elem );
		first.addClass( 'selected' );
		
		//------------------------------------------------------------
		//  Select the clicked color
		//------------------------------------------------------------
		$( '.color', self.elem ).on( 'touchstart click', function( _e ) {
			_e.stopPropagation();
			_e.preventDefault();
			$( '.color', self.elem ).removeClass( 'selected' );
			$( this ).addClass( 'selected' );
			self.liteColor( $( this ).css('background-color') );
		});
	}
	
	/**
	 * Listen for undo button click
	 */
	imgspect.prototype.undoStart = function() {
		var self = this;
		$( '.undo', self.elem ).on( 'touchstart click', function( _e ) {
			_e.stopPropagation();
			_e.preventDefault();
			//------------------------------------------------------------
			//  Remove the last lite
			//------------------------------------------------------------
			var id = self.lites.length - 1;
			self.liteRemove( id );
		});
	}
	
	/**
	 * Remove a lite
	 *
	 * @param { int } _id Lite id
	 */	
	imgspect.prototype.liteRemove = function( _id ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.imgbits.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
		//------------------------------------------------------------
		//  Remove the lite
		//------------------------------------------------------------
		var lite = self.lites.splice( _id, 1 );
		
		//------------------------------------------------------------
		//  Remove the imgbit
		//------------------------------------------------------------
		self.imgbitRemove( _id );
		
		//------------------------------------------------------------
		//  Redraw the lites
		//------------------------------------------------------------
		self.liteRedraw();
		
		//------------------------------------------------------------
		//  Update the lite preview
		//------------------------------------------------------------
		$( '.nav .lite:eq('+_id+')', self.elem ).remove();
		
		//------------------------------------------------------------
		//  Let the world know what happened here.
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['undo'], { id: lite.id } );
		
		//------------------------------------------------------------
		//  Update the output window
		//------------------------------------------------------------
		self.outputUpdate();
	}
	
	/**
	 * Start window resize event listener
	 */
	imgspect.prototype.sizeStart = function() {
		var self = this;
		var timer;
		$(window).resize( function(){
			timer && clearTimeout(timer);
			timer = setTimeout( function(){ self.resize(); }, 10 );
		});
	}
	
	/**
	 * Draw area mouse-down listener
	 */
	imgspect.prototype.drawMouseDown = function( _e ) {
		var self = this;
		//------------------------------------------------------------
		//  Create a new lite
		//------------------------------------------------------------
		self.c_lite = $( document.createElement('div') ).addClass( 'lite' );
		$( '.draw', self.elem ).append( self.c_lite );
		
		//------------------------------------------------------------
		//  Get the mouse and draw position
		//------------------------------------------------------------
		var mp = self.viewMousePos( _e );
		var dp = $( '.draw', self.elem ).position();
		
		//------------------------------------------------------------
		//  Stash the current coordinates in 'img' space
		//------------------------------------------------------------
		self.c_pos = {
			left: mp.left - dp.left,
			top: mp.top - dp.top
		};
		
		//------------------------------------------------------------
		//  Start drawing the highlight
		//------------------------------------------------------------
		self.c_lite.css({
			left: self.c_pos.left,
			top: self.c_pos.top,
			'background-color': '#'+self.options['lite_color'].hex(),
			opacity: self.options['lite_opacity']
		});
	}
	
	/**
	 * Draw area mouse-move listener
	 */
	imgspect.prototype.drawMouseMove = function( _e ) {
		var self = this;
		if ( self.c_lite != null ) {
			var cp = self.c_pos;
			var mp = self.viewMousePos( _e );
			var dp = $( '.draw', self.elem ).position();
			
			//------------------------------------------------------------
			//  Get mouse position coordinates in 'img' space
			//------------------------------------------------------------
			mp.left -= dp.left;
			mp.top -= dp.top;
			
			//------------------------------------------------------------
			//  This logic controls left-handed highlight support.
			//  The origin of the highlight will change to the mouse's
			//  current position if it's less than the original click
			//  position.
			//------------------------------------------------------------
			if ( cp.left > mp.left ) {
				self.c_lite.css({
					left: mp.left,
					width: cp.left - mp.left
				});
			}
			else {
				self.c_lite.css({
					left: cp.left,
					width: mp.left - cp.left
				});
			}
			if ( cp.top > mp.top ) {
				self.c_lite.css({
					top: mp.top,
					height: cp.top - mp.top
				});
			}
			else {
				self.c_lite.css({
					top: cp.top,
					height: mp.top - cp.top
				});
			}
		}
	}
	
	/**
	 * Draw area mouse-up listener
	 */
	imgspect.prototype.drawMouseUp = function( _e ) {
		var self = this;
		if ( self.c_lite == null ) {
			return;
		}
		//------------------------------------------------------------
		//  Check to see if the current lite is not just 
		//  a trivial mouse slip up.
		//------------------------------------------------------------
		if ( self.c_lite.width() == 0 || self.c_lite.height() == 0 ) {
			self.c_lite = null;
			return;
		}
		//------------------------------------------------------------
		//  Store lite position in relation to original
		//------------------------------------------------------------
		var cp = self.c_lite.position();
		var x1 = cp.left / self.zoom_n;
		var y1 = cp.top / self.zoom_n;
		var x2 = x1 + self.c_lite.width() / self.zoom_n;
		var y2 = y1 + self.c_lite.height() / self.zoom_n;
		self.liteAdd( x1, y1, x2, y2 );
	}
	
	/**
	 * Start the lite mouse event listeners
	 */
	imgspect.prototype.liteStart = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Mouse Down
		//------------------------------------------------------------
		$( '.view', self.elem ).mousedown( function( _e ) {
			_e.preventDefault();
			self.drawMouseDown( _e );
		});
		$( '.view', self.elem ).bind('touchstart', function( _e ) {
			_e.preventDefault();
			self.drawMouseDown( _e );
		});
		
		//------------------------------------------------------------
		//  Mouse Move
		//------------------------------------------------------------
		$( '.view', self.elem ).mousemove( function( _e ) {
			_e.preventDefault();
			self.drawMouseMove( _e );
		});
		$( '.view', self.elem ).bind( 'touchmove', function( _e ) {
			_e.preventDefault();
			self.drawMouseMove( _e );
		})
		
		//------------------------------------------------------------
		//  Mouse Up
		//------------------------------------------------------------
		$( self.elem ).mouseup( function( _e ) {
			_e.preventDefault();
			self.drawMouseUp( _e );
		});
		$( self.elem ).bind( 'touchend', function( _e ) {
			_e.preventDefault();
			self.drawMouseUp( _e );
		})
	}
	
	/**
	 * Add a lite
	 */
	imgspect.prototype.liteAdd = function( _x1, _y1, _x2, _y2 ) {
		var self = this;
		//------------------------------------------------------------
		//  Stash that lite
		//------------------------------------------------------------
		self.lites.push({ 
			x1: parseInt( _x1 ),
			y1: parseInt( _y1 ),
			x2: parseInt( _x2 ),
			y2: parseInt( _y2 ),
			zoom: self.zoom_n,
			color: self.options['lite_color'],
			opacity: self.options['lite_opacity'],
			id: self.lites.length
		});
		
		//------------------------------------------------------------
		//  Draw the lite on the nav image.
		//  ( Make this optional with a config option? )
		//------------------------------------------------------------
		self.navLiteDraw( self.liteLast().id );
		
		//------------------------------------------------------------
		//  Reset current lite
		//------------------------------------------------------------
		self.c_lite = null;
		self.c_pos = null;
		
		//------------------------------------------------------------
		//  Let the world know the app state has changed
		//------------------------------------------------------------
		$( self.elem ).trigger( self.events['change'] );
	}
	
	
	
	/**
	 * Build the DOM element for a lite
	 *
	 * @return { jQuery } A jQuery DOM element handle
	 */
	imgspect.prototype.liteDom = function() {
		return $( document.createElement('div') ).addClass( 'lite' );
	}
	
	/**
	 * Draw a lite in the nav
	 *
	 * @param { int } _id Lite id
	 */
	imgspect.prototype.navLiteDraw = function( _id ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.lites.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
		var lite = self.liteDom();
		var nav = $( '.nav', self.elem );
		nav.append( lite );
		var np = nav.position();
		var lp = self.lites[_id];
		lite.css({
			left: lp.x1 / self.nav_scale + np.left,
			top: lp.y1 / self.nav_scale + np.top,
			width: lp.x2 / self.nav_scale - lp.x1 / self.nav_scale,
			height: lp.y2 / self.nav_scale - lp.y1 / self.nav_scale,
			'background-color': '#'+lp.color.hex(),
			opacity: lp.opacity
		});
	}
	
	/**
	 * Returns the last lite
	 *
	 * @ return { lite } A lite object
	 */
	imgspect.prototype.liteLast = function() {
		return this.lites[ this.lites.length-1 ];
	}
	
	/**
	 * Resize the lites
	 */
	imgspect.prototype.liteResize = function() {
		this.liteRedraw();
	}
	
	/**
	 * Move the dragger so the selected lite is displayed
	 * in the center of draw area
	 *
	 * @ param { int } _id The lite id
	 */
	imgspect.prototype.liteShow = function( _id ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.lites.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
		var lite = self.lites[ _id ];
		
		//------------------------------------------------------------
		//  Start by finding the center of the lite
		//------------------------------------------------------------
		var x = lite.x1 + ( lite.x2 - lite.x1 )/2;
		var y = lite.y1 + ( lite.y2 - lite.y1 )/2;
		
		//------------------------------------------------------------
		//  Then subtract half the view area taking zoom level
		//  into consideration to center the lite
		//------------------------------------------------------------
		x = x - ( $( '.view', self.elem ).width()/2 )/self.zoom_n;
		y = y - ( $( '.view', self.elem ).height()/2 )/self.zoom_n;
		
		//------------------------------------------------------------
		//  But you also have to make sure you aren't moving beyond
		//  the edges of the image... Maybe not...
		//  I'm not convinced this is best.  If people complain
		//  here's where you can constrain the coordinates.
		//------------------------------------------------------------
		self.goTo( x, y );
	}
	
	/**
	 * Redraw the lites
	 */
	imgspect.prototype.liteRedraw = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Clear the existing lites
		//------------------------------------------------------------
		$( '.draw .lite', self.elem ).remove();
		
		//------------------------------------------------------------
		//  Redraw at different dimensions
		//------------------------------------------------------------
		var dp = $( '.draw', self.elem ).position();
		for ( var i=0, ii=self.lites.length; i<ii; i++ ) {
			var lite = self.liteDom();
			$( '.draw' ).append( lite );
			lite.css({
				left: self.lites[i].x1 * self.zoom_n,
				top: self.lites[i].y1 * self.zoom_n,
				width: ( self.lites[i].x2 - self.lites[i].x1 ) * self.zoom_n,
				height: ( self.lites[i].y2 - self.lites[i].y1 ) * self.zoom_n,
				'background-color': '#'+self.lites[i].color.hex(),
				opacity: self.lites[i].opacity
			});
		}
	}
	
	/**
	*  Remove all lites preview from the nav
	*/
	imgspect.prototype.navLiteClear = function() {
		var self = this;
		$( '.nav .lite', self.elem ).remove();
	}
	
	/**
	*  Remove all lites preview from the nav
	*/
	imgspect.prototype.navLiteRedraw = function() {
		var self = this;
		self.navLiteClear();
		for ( var i=0, ii=self.lites.length; i<ii; i++ ) {
			self.navLiteDraw( i );
		}
	}
	
	/**
	 * Change the color of future lites
	 *
	 * @param { string } _color CMYK name as defined in self.colors
	 *						    OR a hex color value
	 */
	imgspect.prototype.liteColor = function( _color ) {
		var self = this;
		_color = _color.toUpperCase();
		if ( _color in self.colors ) {
			self.options['lite_color'] = new Culuh( self.colors[ _color ] );
		}
		else {
			self.options['lite_color'] = new Culuh( _color );
		}
	}
	
	/**
	 * Turn a lite into an imgbit
	 *
	 * @param { int } _id Lite id
	 */
	imgspect.prototype.liteToImgbit = function( _id ) {
		var self = this;
		//------------------------------------------------------------
		//  Make sure id is in range.
		//------------------------------------------------------------
		try {
			if ( _id < 0 || _id >= self.lites.length ) throw "out of range"
		}
		catch ( _err ) {
			$( self.elem ).trigger( self.events['error'], { error: _err } );
			return
		}
		
		var lite = self.lites[_id];
		
		var color = lite.color;
		var questAnd = ( self.src.indexOf('?') == -1 ) ? '?' : '&'
		var tag = '<a id="imgbit-'+_id+'" class="imgbit edit closable" href="'+self.src+'\
				'+questAnd+'imgbit=\
				x1='+lite.x1+'\
				%y1='+lite.y1+'\
				%x2='+lite.x2+'\
				%y2='+lite.y2+'\
				%z='+lite.zoom+'\
				%c='+color.sat( 0.5, true ).hex()+'\
				">#</a>';
		return tag.smoosh();
	}
	
	/**
	 * Start the zoom event listeners
	 */
	imgspect.prototype.zoomStart = function() {
		var self = this;
		$( '.zoom', self.elem ).on( 'touchstart click', function( _e ) {
			_e.stopPropagation();
			_e.preventDefault();
			if ( $(this).hasClass('in') ) {
				self.zoomIn();
			}
			else {
				self.zoomOut();
			}
		});
	}
	
	/**
	 * Make drawable image larger
	 */
	imgspect.prototype.zoomIn = function() {
		var self = this;
		self.zoom('IN');
	}

	/**
	 * Make drawable image smaller
	 */
	imgspect.prototype.zoomOut = function() {
		var self = this;
		self.zoom('OUT');
	}
	
	/**
	 * Scale drawable image
	 *
	 * @param { string } _dir Either 'IN' or 'OUT'
	 */
	imgspect.prototype.zoom = function( _dir ) {
		var self = this;
		var old_zoom = self.zoom_n;
		switch( _dir.toUpperCase() ) {
			case 'IN':
				self.zoom_n += self.options['zoom_unit'];
				break;
			case 'OUT':
				self.zoom_n -= self.options['zoom_unit'];
				break;
		}
		
		//------------------------------------------------------------
		//  Calculate zoom shift
		//------------------------------------------------------------
		var top = $( '.draw', self.elem ).position().top;
		var left = $( '.draw', self.elem ).position().left;
		top = top / old_zoom - top / self.zoom_n;
		left = left / old_zoom - left / self.zoom_n;
		self.zoom_shift = { top: top, left: left };
		
		//------------------------------------------------------------
		//  Resize draw window & nav drag
		//------------------------------------------------------------
		self.resize();
	}
	
	/**
	 * Start drag listener
	 */
	imgspect.prototype.dragStart = function() {
		var self = this;
		$( '.drag', self.elem ).draggable({
			containment: 'parent',
			scroll: false,
			drag: function() {
				self.drawResize();
			},
			stop: function() {
				self.dragNavDiff();
			}
		});
		
		//------------------------------------------------------------
		//  Set the dragger to the nav's origin
		//------------------------------------------------------------
		var nav_pos = $( '.nav', this.elem ).offset();
		$( '.drag', self.elem ).css({
			left: nav_pos.left,
			top: nav_pos.top
		});
	}

	/**
	 * Start scroll listener
	 */
	imgspect.prototype.scrollStart = function() {
		var self = this;
		var nav = $( '.nav', self.elem );
		var drag = $( '.drag', self.elem );
		var view = $( '.view', self.elem );

		var callback = function(event) {
			var dX = event.originalEvent.deltaX / 4;
			var dY = event.originalEvent.deltaY / 4;
			var nav_pos = nav.position();
			var drag_pos = drag.position();

			var nav_width = nav.width();
			var nav_height = nav.height();
			var drag_width = drag.width();
			var drag_height = drag.height();

			var drag_max_x = nav_pos.left + nav_width - drag_width;
			var drag_max_y = nav_pos.top + nav_height - drag_height;

			var top = drag_pos.top + dY;
			var left = drag_pos.left + dX;

			top = ( top < nav_pos.top ) ? nav_pos.top : top;
			left = ( left < nav_pos.left ) ? nav_pos.left : left;
			top = ( top > drag_max_y ) ? drag_max_y : top;
			left = ( left > drag_max_x ) ? drag_max_x : left;

			drag.css("top", top + "px");
			drag.css("left", left  + "px");
			drag_pos = drag.position();

			self.dragHandler( nav_pos, drag_pos );
			self.dragNavDiff();

			event.preventDefault();
		};

		$(nav).on('wheel', callback);
		$(view).on('wheel', callback);
	}
	
	/**
	 * Moves the drawable image when the nav drag is moved
	 *
	 * @param { object } _nav_pos nav window position
	 * @param { object } _drag_pos drag position
	 */
	imgspect.prototype.dragHandler = function( _nav_pos, _drag_pos ) {
		var self = this;
		var x = _drag_pos.left - _nav_pos.left;
		var y = _drag_pos.top - _nav_pos.top;
		var left = x * -1 * self.zoom_n * self.nav_scale;
		var top = y * -1 * self.zoom_n * self.nav_scale;
		self.drawMove( left, top );
	}
	
	/**
	 * Resize and reposition dragger
	 */
	imgspect.prototype.dragResize = function() {
		var self = this;
		var view = $( '.view', self.elem );
		var draw = $( '.draw', self.elem );
		
		var w_ratio = view.width() / draw.width();
		w_ratio = ( w_ratio > 1 ) ? 1 : w_ratio;
		
		var h_ratio = view.height() / draw.height();
		h_ratio = ( h_ratio > 1 ) ? 1 : h_ratio;
		
		var img = $( '.nav img', self.elem );
		var width = img.width() * w_ratio; 
		var height = img.height() * h_ratio;
		var nav_left = $( '.nav', self.elem ).offset().left;
		var nav_top = $( '.nav', self.elem ).offset().top;
		$( '.drag', self.elem ).css({
			width: width,
			height: height,
			left: nav_left + self.dragDiff['left'],
			top: nav_top + self.dragDiff['top']
		});
		
		/*
		//------------------------------------------------------------
		//  Calculate zoom shift
		//------------------------------------------------------------
		if ( self.zoom_shift != null ) {
			var pos = $( '.draw', self.elem ).position();
			//------------------------------------------------------------
			//  Find the of the view
			//------------------------------------------------------------
			var sh = ( view.height()/2 ) * self.zoom_n;
			var sw = ( view.width()/2 ) * self.zoom_n;
			console.log( 'sh = ' + sh );
			console.log( 'sw = ' + sw );
			var top = Math.abs( Math.ceil( pos.top/self.zoom_n )) - sh;
			var left = Math.abs( Math.ceil( pos.left/self.zoom_n )) - sw;
			self.goTo( left, top, 0 );
		}
		*/
		self.zoom_shift = null;
	}
	
	/**
	 * Move the drawable image
	 *
	 * @param { float } _left new left css parameter
	 * @param { float } _top new top css parameter
	 */
	imgspect.prototype.drawMove = function( _left, _top ) {
		$( '.draw', this.elem ).css({
			left: _left,
			top: _top
		});
	}
	
	/**
	 * Resize drawable window when zoomed
	 */
	imgspect.prototype.drawResize = function() {
		var self = this;
		$( '.draw', self.elem ).css({
			width: self.orig_w * self.zoom_n,
			height: self.orig_h * self.zoom_n
		});
		
		//------------------------------------------------------------
		//  Call the dragHandler method to move.
		//  You have to pass the nav and drag position before calling.
		//
		//  Sorry it's clunky but the jQuery position() method 
		//  call is costly.
		//------------------------------------------------------------
		var nav_pos = $( '.nav', self.elem ).position();
		var drag_pos = $( '.drag', self.elem ).position();
		self.dragHandler( nav_pos, drag_pos );
	}
	
	/**
	 *  Resize the nav img and set the nav_scaling factor
	 */
	imgspect.prototype.navResize = function() {
		var self = this;
		var height = $( '.nav', self.elem ).height();
		self.nav_scale = self.orig_h / height;
		$( '.nav img', self.elem ).css({
			height: height
		});
		self.navLiteRedraw();
	}
	
	/**
	 *  Resize the view element to fit the empty space
	 */
	imgspect.prototype.viewResize = function() {
		var self = this;
		var app_width = $( self.elem ).width();
		$( '.view', self.elem ).css({
			width: app_width
		});
	}
	
	/**
	 * Retrieve the mouse position in relation to the view
	 *
	 * @param { Event } _e the mouse event object
	 */
	imgspect.prototype.viewMousePos = function( _e ) {
		var vp = $( '.view', this.elem ).position();
		//------------------------------------------------------------
		//  Clicks and touches have different event objects.
		//  Deal with it.
		//------------------------------------------------------------
		var x = ( _e.clientX != undefined ) ? _e.clientX + $(window).scrollLeft() : _e.originalEvent.pageX;
		var y = ( _e.clientY != undefined ) ? _e.clientY + $(window).scrollTop() : _e.originalEvent.pageY;
		var left = x - vp.left;
		var top = y - vp.top;
		return { 'left':left, 'top':top }
	}
	
	/**
	 * Positions the view origin to the passed coordinates.
	 * AKA it GOES to the coordinates.
	 *
	 * It will center the coordinates within the dragger but
	 * constrain the edges of the dragger to the nav box
	 *
	 * @param { float } _x x coordinate
	 * @param { float } _y y coordinate
	 * @param { float } _sec number of seconds the dragger movement takes
	 */
	imgspect.prototype.goTo = function( _x, _y, _sec ) {
		var self = this;
		
		//------------------------------------------------------------
		//  Set defaults
		//------------------------------------------------------------
		_x = ( _x == undefined ) ? 0 : _x;
		_y = ( _y == undefined ) ? 0 : _y;
		_sec = ( _sec == undefined ) ? self.options['secs'] : _sec;
		
		//------------------------------------------------------------
		//  Start the drag animation
		//------------------------------------------------------------
		var nav_pos = $( '.nav', this.elem ).position();
		var nav_width = $( '.nav', this.elem ).width();
		var nav_height = $( '.nav', this.elem ).height();
		var drag_width = $( '.drag', this.elem ).width();
		var drag_height = $( '.drag', this.elem ).height();
		
		var left = _x / self.nav_scale + nav_pos.left;
		var top = _y / self.nav_scale + nav_pos.top;
		
		//------------------------------------------------------------
		//  Constrain the dragger
		//------------------------------------------------------------		
		left = ( left < nav_pos.left ) ? nav_pos.left : left;
		top = ( top < nav_pos.top ) ? nav_pos.top : top;
		var drag_max_x = nav_pos.left + nav_width - drag_width;
		var drag_max_y = nav_pos.top + nav_height - drag_height;
		left = ( left > drag_max_x ) ? drag_max_x : left;
		top = ( top > drag_max_y ) ? drag_max_y : top;
		
		//------------------------------------------------------------
		//  Start the drag animation
		//------------------------------------------------------------
		$( '.drag', self.elem ).animate({
			left: left,
			top: top
		},
		{
			duration: _sec * 1000, // to milliseconds
			
			//------------------------------------------------------------
			//  Reuse the drag handler function...
			//------------------------------------------------------------
			step: function() {
				var drag_pos = $( '.drag', this.elem ).position();
				self.dragHandler( nav_pos, drag_pos );
			}
		});
	}
	
	/**
	 * Load an imgspect object
	 */	
	imgspect.prototype.load = function( items ) {
		var self = this;
		for ( var i=0; i<items.length; i++ ) {
			coords = self.relToExp( items[i] );
			self.liteAdd( coords.x1, coords.y1, coords.x2, coords.y2 );				
		}
	}
	
	/**
	 * Turn relative coordinates into explicit ones
	 */
	imgspect.prototype.relToExp = function( item ) {
		var self = this;
		var out = { x1:null, x2:null, y1:null, y2:null }	;
		out.x1 = Math.round( item.x * self.orig_w );
		out.y1 = Math.round( item.y * self.orig_h );
		out.x2 = Math.round( out.x1 + item.width * self.orig_w );
		out.y2 = Math.round( out.y1 + item.height * self.orig_h );
		return out
	}
	
	/**
	 * Export an imgspect object TODO
	 */	
	imgspect.prototype.export = function() {
		var self = this;
	}
	
	/**
	 * "Register" this plugin with jQuery
	 */
	jQuery(document).ready( function($) {
		jQuery.fn.imgspect = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new imgspect( this, options, id ) );
			});
		};
	})
})(jQuery);

