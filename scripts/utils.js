
/**
 * parsing functions
 *
 * */

function parseDate( dateString ){

    if(dateString instanceof Date)
        return dateString;

	yearFormat = d3.time.format("%Y");
	var date = yearFormat.parse(dateString);

	if(date != null) return date;

	dateFormat = d3.time.format("%Y-%m");
	date = dateFormat.parse(dateString);

	if(date != null) return date;

	if( dateString.length == 8 )
		date = yearFormat.parse( dateString.substring(0, 4) );

	if(date != null) return date;

	if(dateString.contains("c "))
		date = yearFormat.parse( dateString.substring(2, 6) );

	if(date != null) return date;
	return yearFormat.parse('2014');
}



function toYear(date){

	formatYear = d3.time.format("%Y");
	var year = formatYear(date);
	//if(year != null)
		return year;
	//return "0";
}





/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * String prototype
 *
 * */

String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
};


String.prototype.toBool = function() {
    return (this == "true");
};

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.isAllUpperCase = function() {
    return this.valueOf().toUpperCase() === this.valueOf();
};

String.prototype.clean = function(){
    var text = this;
    // Clean strings separated by -. E.g. deve- lopment -> development
    if(text.match(/\w+-\s/g)){
        var textArray = [],
            splitText = text.split(' ');
        for(var i = 0; i < splitText.length; ++i) {
            if(splitText[i].match(/\w+-$/)){
                textArray.push(splitText[i].replace('-', '') + splitText[i+1]);
                ++i;
            }
            else
                textArray.push(splitText[i]);
        }
        text = textArray.join(' ');
    }
    return text;
};


String.prototype.removeUnnecessaryChars = function() {
    return this.replace(/[-=’‘\']/g, ' ').replace(/[()\"“”]/g,'');
};


/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Number prototype gunctionto parse milliseconds to minutes:seconds format
 *
 * */

Number.prototype.toTime = function(){
    var min = (this/1000/60) << 0;
    var sec = Math.floor((this/1000) % 60);
    if (min.toString().length == 1) min = '0' + min.toString();
    if (sec.toString().length == 1) sec = '0' + sec.toString();
    return min + ':' + sec;
};


Number.prototype.round = function(places) {
    return +(Math.round(this + "e+" + places)  + "e-" + places);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * jQuery functions (for DOM elements)
 *
 * */


$.fn.outerHTML = function() {
    return $(this).clone().wrap('<div></div>').parent().html();
 };




$.fn.scrollTo = function( target, options, callback ){

	if(typeof options == 'function' && arguments.length == 2){
		callback = options;
		options = target;
	}

	var settings =
		$.extend({
			scrollTarget  : target,
			offsetTop     : 50,
			duration      : 500,
			easing        : 'swing'
		}, options);

	return this.each(function(){
		var scrollPane = $(this);

		var scrollTarget;
		if( typeof settings.scrollTarget == "number" ){
			scrollTarget = settings.scrollTarget;
		}
		else{
			if( settings.scrollTarget == "top" ){
				scrollTarget = 0;
			}
			else{
				scrollTarget = $(settings.scrollTarget);
                settings.offsetTop = scrollPane.offset().top;
			}
		}

		//var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
		var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollPane.scrollTop() + scrollTarget.offset().top - settings.offsetTop;

		scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
            if (typeof callback == 'function') { callback.call(this); }
		});
	});
};







/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * hex to RGB converter
 *
 * */

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}


/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * format gradient string
 *
 * */

function getGradientString(color, shadeDiff) {

/*    var rgb = (color.contains('#')) ? (hexToR(color) + ", " + hexToG(color) + ", " +hexToB(color)) : color;

    var gradient = "-webkit-linear-gradient(top";
    shades.forEach(function(s){
        gradient += ", rgba(" + rgb + ", " + s + ")"
    });

    gradient += ")";
    return gradient;*/

    var r = parseInt(hexToR(color));
    var g = parseInt(hexToG(color));
    var b = parseInt(hexToB(color));

    var original = 'rgb('+r+','+g+','+b+')';
    var lighter = 'rgb('+(r+shadeDiff)+','+(g+shadeDiff)+','+(b+shadeDiff)+')';

    return '-webkit-linear-gradient(top, ' + original + ', ' + lighter + ', ' + original + ')';
}

















