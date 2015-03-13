

var ContentList = (function(){

    // Settings
    var s = {};
    // Classes
    var contentListContainerClass = 'urank-list-container',
        ulClass = 'urank-list-ul',
        liClass = 'urank-list-li',
        liHoverClass = 'urank-list-li-hover',
        liLightBackground = 'urank-list-li-lightbackground',
        liDarkBackground = 'urank-list-li-darkbackground',
        liMovingUpClass = 'urank-list-li-movingup',
        liMovingDownClass = 'urank-list-li-movingdown',
        liNotMovingClass = 'urank-list-li-notmoving',
        liRankingContainerClass = 'urank-list-li-ranking-container',
        rankingPosClass = 'urank-list-li-ranking-pos',
        rankingPosMovedClass = 'urank-list-li-ranking-posmoved',
        liTitleContainerClass = 'urank-list-li-title-container',
        liButtonsContainer = 'urank-list-li-buttons-container',
        faviconClass = 'urank-list-li-button-favicon',
        faviconOffClass = 'urank-list-li-button-favicon-off',
        faviconOnClass = 'urank-list-li-button-favicon-on',
        watchiconClass = 'urank-list-li-button-watchicon-on',
        watchiconOffClass = 'urank-list-li-button-watchicon-off',
        watchiconOnClass = 'urank-list-li-button-watchicon-on',
        liWatchedClass = 'urank-list-li-watched';
    // Ids
    var liItem = '#urank-list-li-';


    function ContentList(arguments) {

        s = $.extend({
            root: '',
            colorScale: function(){},
            onListItemClicked: function(d, i){},
            onListItemHovered: function(i){},
            onListItemUnhovered: function(i){},
            onFaviconClicked: function(d, i){},
            onWatchiconClicked: function(d, i){},
            getTextWithKeywordsHighlighted: function(text){ return text;}
        }, arguments);
    }



    var _build = function(data) {

        $(s.root).addClass();
        this.selectedIndex = STR_NO_INDEX;

        // Easier to build with d3 because it's data-driven
        d3.select(s.root).empty();
        var ul = d3.append('ul').attr('class', ulClass);
        ul.selectAll("li").data(data);

        var aListItem = ul.enter()
            .append('li')
            .attr('class', liClass)
            .attr('id', function(d, i){ return 'urank-list-li-'+i; })
            .attr('doc-id', function(d){ return d.id})
            .attr('pos', function(d, i){ return i; });

        var rankingDiv = aListItem.append('div').attr("class", liRankingContainerClass).style('visibility', 'hidden');
        rankingDiv.append('div').attr("class", rankingPosClass).text('');
        rankingDiv.append('div').attr("class", rankingPosMovedClass);

        var contentDiv = aListItem.append("div").attr("class", liTitleContainerClass);
        contentDiv.append("h3")
            .append("a")
            .attr('id', function(d, i){ return 'urank-list-li-tile' + i; })
            .attr("href", "#")
            .html(function(d){return this.getFormattedTitle(d.title); });

        // fav icon section on the right
        var iconSection = aListItem.append('div').attr('class', liButtonsContainer);
        iconSection.append("span")
            .attr("class", watchIconClass + ' ' + watchiconOffClass)
            .attr('title', 'Start watching');

        iconSection.append("span")
            .attr("class", favIconClass + ' ' + faviconOffClass)
            .attr('title', 'Mark as relevant');

        $(s.root).scrollTo('top');
        this.updateLiBackground(data),
        this.bindEvenHandlers();
    };



    var _sort = function(data){

        var liHtml = new Array();

        data.forEach(function(d, i){
            var index = d.originalIndex || i;
            var current = $( liItem +''+ index );
            current.css('top', 0);
            var outer = $(current).outerHTML();
            liHtml.push(outer);
            current.remove();
        });

        var oldHtml = "";
        for(var j = liHtml.length-1; j >= 0; j--){
            $(s.root).html(liHtml[j] + "" + oldHtml);
            oldHtml = $(contentList).html();
        }

        // Re-binds on click event to list item. Removing and re-appending DOM elements destroys the bindings to event handlers
        this.binEvenHandlers();
        this.selectedIndex = STR_NO_INDEX;
    }


    var _reset = function(data) {

        //rankingModel.reset();     do in controller

        $('.'+liRankingContainerClass).empty();
        this.sort(data);
        this.updateLiBackground();
        this.formatTitles();
        // LIST.animateContentList(RANKING_STATUS.reset);       call from controller
    };


    var _getformattedTitle = function(title) {
        title = (title.length > 60) ? (title.substring(0, 56) + '...') : title;
        return s.getTextWithKeywordsHighlighted(title);
    };



    var _formatTitles = function(data) {
        data.forEach(function(d, i){
            var index = d.originalIndex ||i;
            $(liItem +''+ index).find('a').html(this.getFormattedTitle(d.title));
        });
    }


    var _bindEventHandlers = function() {

        d3.selectAll('.'+liClass)
            .on("click", function(d, i){ s.onListItemClicked.call(this, i); })
            .on("mouseover", function(d, i){ s.onListItemHovered.call(this, i); })
            .on("mouseout", function(d, i){ s.onListItemUnhovered.call(this, i); });

        var iconSection = d3.selectAll('.'+liClass).select('.' + liButtonsContainer);
        iconSection.select('.'+faviconClass).on("click", function(d, i){ s.onFaviconClicked.call(this, i);})
        iconSection.select('.'+watchiconClass).on("click", function(d, i){ s.onWatchiconClicked.call(this, i);});
    };



    var _unbindEventHandlers = function() {
        d3.selectAll('.'+liClass).on("click", '').on("mouseover", '').on("mouseout", '');

        var iconSection = d3.selectAll('.'+liClass).select('.'+liButtonsContainer);
        iconSection.select('.'+faviconClass).on("click", '')
        iconSection.select('.'+watchiconClass).on("click", '');
    };



    var _updateLiBackground = function(data){
        $('.'+liClass).removeClass(liLightBackground).removeClass(liDarkBackground);

        data.forEach(function(d, i) {
            var index = d.originalIndex || i;
            var backgroundClass = (index % 2 == 0) ? liLightBackground : liDarkBackground;
            $(liItem +''+ index).addClass(backgroundClass);
        });
    };



    var _highlightListItem = function(index) {
        $('.'+liClass).css("opacity", "0.3");
        $(liItem + '' + index).css("opacity", "1");
    };


    var _undoHighlight = function() {
        $('.'+liClass).css("opacity", "1");
    };


    // receives actual index
    var _hover = function(index) {
        $(liItem +''+ index).addClass(liHoverClass);
    };


    var _unhover = function(index) {
        $(liItem +''+ index).removeClass(liHoverClass);
    };


    var _stopAnimation = function(){
        $('.'+liClass).stop(true, true);
        this.removeShadowEffect();
    };


    var _removeShadowEffect = function() {
        $('.'+liClass).removeClass(liMovingUpClass).removeClass(liMovingDownClass);
    };


    // Receives actual indices of unranked elements elements
    var _hideListItems = function(indices) {
        d3.selectAll('.'+liClass).style('display', function(d){
            var displayValue = (indices.indexOf(d.originalIndex) > -1) ? '' : 'none';
            return displayValue;
        });
    };



    var _showRankingPositions = function(data) {

        var color = function(d) {
            if(d.positionsChanged > 0) return "rgba(0, 200, 0, 0.8)";
            if(d.positionsChanged < 0) return "rgba(250, 0, 0, 0.8)";
            return "rgba(128, 128, 128, 0.8)";
        };

        var posMoved = function(d) {
            if(d.positionsChanged == 1000) return STR_JUST_RANKED;
            if(d.positionsChanged > 0) return "+" + d.positionsChanged;
            if(d.positionsChanged < 0) return d.positionsChanged;
            return "=";
        };

        data.forEach(function(d, i){
            if(d.overallScore > 0){
                var rankingDiv = d3.select(liItem + '' + d.originalIndex).select('.'+liRankingContainerClass);
                rankingDiv.style('visibility', 'visible');
                rankingDiv.select('.'+rankingPosClass).text(d.rankingPos);
                rankingDiv.select('.'+rankingPosMovedClass).style('color', color).text(posMoved);
            }
        });
    };


    var _clearAllFavicons = function(){
        $('.'+liClass + ' .'+ liButtonsContainer + ' .' + faviconClass).removeClass(faviconOnClass);//.addClass(faviconOffClass);
    };


    var _switchFaviconOnOrOff = function(index){
        var favIcon = $(liItem + '' + index +' .'+ liButtonsContainer + ' .' + faviconClass);
        var classToAdd = favIcon.hasClass(faviconOffClass) ? faviconOnClass : faviconOffClass;
        var classToRemove = classToAdd === faviconOnClass ? faviconOffClass : faviconOnClass;
        $(liItem + '' + index +' .'+ liButtonsContainer + ' .' + faviconClass).switchClass(classToRemove, classToAdd);
    };


    var _watchOrUnwatchListItem = function(index){
        var watchIcon = $(liItem + '' + index +' .'+ liButtonsContainer + ' .' + watchiconClass);
        var classToAdd = watchIcon.hasClass(watchiconOffClass) ? watchiconOnClass : watchiconOffClass;
        var classToRemove = classToAdd === watchiconOnClass ? watchiconOffClass : watchiconOnClass;
        watchIcon.switchClass(classToRemove, classToAdd);

        $(liItem + '' + index).toggleClass(liWatchedClass);
    };



    /**
    * @private     * Description
    * @param {type} data : current ranking
    * @param {type} status Description
    */
    var _animate = function(data, status) {

        this.stopAnimation();

        var accordionInitialDuration = 500,
            accordionTimeLapse = 50,
            accordionEasing = 'swing',
            resortingDuration = 1500,
            resortingEasing = 'swing',
            unchangedDuration = 1000,
            unchangedEasing = 'linear',
            removeDelay = 3000;

        switch(status) {
            case RANKING_STATUS.new:
                this.sort(data);
                this.animateAccordionEffect(data, accordionInitialDuration, accordionTimeLapse, accordionEasing);
                break;

            case RANKING_STATUS.update:
                this.unbindEventHandlers();
                this.animateResortEffect(data, resortingDuration, resortingEasing);
                setTimeout(function() {
                    this.sort(data);
                }, resortingDuration);
                break;

            case RANKING_STATUS.unchanged:
                this.animateUnchangedEffect(data, unchangedDuration, unchangedEasing);
                break;
            case RANKING_STATUS.reset:
                // resort items in original order
                //LIST.stopAnimation();
                break;
        }

        setTimeout(function() {
            this.removeShadowEffect();
        }, removeDelay);


    };




    var _animateAccordionEffect = function(data, initialDuration, timeLapse, easing) {

        initialDuration = initialDuration || 500;
        timeLapse = timeLapse || 50;
        easing = easing || 'swing';

        data.forEach(function(d, i){
            var item = $(liItem +''+ d.originalIndex);

            if( d.overallScore > 0 ){
                var shift = (i+1) * 5;
                var duration = initialDuration + timeLapse * i;

                item.addClass(liMovingUpClass);
                item.animate({'top': shift}, {
                    'complete': function(){
                        $(this).animate({"top": 0}, duration, easing);
                    }
                });
            }
        });
    };



    var _animateResortEffect = function(data, duration, easing) {

        duration = duration || 1500;
        easing = easing || 'swing';

        var acumHeight = 0;
        var listTop = $(s.root).position().top;

        data.forEach(function(d, i){

            if(d.rankingPos > 0) {
                var item = $(liItem +''+ d.originalIndex);
                var itemTop = $(item).position().top;
                var shift = listTop +  acumHeight - itemTop;
                var movingClass = (d.positionsChanged > 0) ? liMovingUpClass : ((d.positionsChanged < 0) ? liMovingDownClass : '');

                item.addClass(movingClass);
                item.animate({"top": '+=' + shift+'px'}, duration, easing);

                acumHeight += $(item).height();
            }
        });
    };




    var _animateUnchangedEffect = function (data, duration, easing) {

        duration = duration || 1000;
        easing = easing || 'linear';

        data.forEach(function(d, i) {

            var item = $(liItem +""+ d.originalIndex);
            var startDelay = i * 30;

            setTimeout(function() {
                item.addClass(liNotMovingClass);
                item.removeClass(liNotMovingClass, duration, easing);
            }, startDelay);
        });
    };



    ContentList.prototype = {

        build: _build,
        sort: _sort,
        reset: _reset,
        getformattedTitle: _getformattedTitle,
        bindEvenHandlers: _bindEventHandlers,
        unbindEventHandlers: _unbindEventHandlers,
        updateLiBackground: _updateLiBackground,
        highlighListItem: _highlightListItem,
        undoHighlight: _undoHighlight,
        stopAnimation: _stopAnimation,
        removeShadowEffect: _removeShadowEffect,
        hideListItems: _hideListItems,
        hover: _hover,
        unhover: _unhover,
        showRankingPositions: _showRankingPositions,
        clearAllFavicons: _clearAllFavicons,
        switchFaviconOnOrOff: _switchFaviconOnOrOff,
        watchOrUnwatchListItem: _watchOrUnwatchListItem,
        animate: _animate,
        animateAccordionEffect: _animateAccordionEffect,
        animateResortEffect: _animateResortEffect,
        animateUnchangedEffect: _animateUnchangedEffect,
        formatTitles: _formatTitles
    };

    return ContentList;
})();







/*

var LIST = {};

LIST.internal = {


    getFormattedTitle: function(title){ }

};




LIST.selectededListIndex = STR_NO_INDEX;


LIST.buildContentList = function(){ };


LIST.bindEventHandlersToListItems = function(){ };


LIST.unbindEventHandlersToListItems = function(){ };




LIST.rankRecommendations = function() {};



var _selectListItem = function(index) {}



LIST.addRankingPositions = function() { };




LIST.hideUnrankedItems = function(){ };



LIST.stopAnimation = function(duration, easing, delay){ };


LIST.removeShadowEffect = function() { };


LIST.sortContentList = function(){ };


LIST.animateContentList = function(action) { };



LIST.accordionAnimation = function(initialDuration, timeLapse, easing) { };



LIST.resortListAnimation = function(duration, easing) { };



LIST.unchangedListAnimation = function (duration, easing) { };



LIST.colorKeywordsInTitles = function(){ };     // get formatted title



LIST.selectListItem = function( i, flagSelectedOutside ){};


LIST.highlightListItems = function(index){ };



LIST.hoverListItem = function(index, isExternalCall) { };



LIST.unhoverListItem = function(index, isExternalCall){ };


LIST.resetContentList = function(){ };



LIST.switchFaviconOnOrOff = function(index){ };


LIST.clearAllFavicons = function(){ };


LIST.watchOrUnwatchListItem = function(index){ };
*/
