

var ContentList = (function(){

    function ContentList(listRoot, highlightKeywordsInText) {

        this.listRoot = listRoot;
        this.highlightKeywordsInText = highlightKeywordsInText;

        $(this.listRoot).addClass('urank-list-container');
    }


    var ulClass = 'urank-list-ul';
    var liClass = 'urank-list-li';
    var liRankingContainerClass = 'urank-list-li-ranking-container';
    var liTitleContainerClass = 'urank-list-li-title-container';
    var liButtonsContainer = 'urank-list-li-buttons-container';
    var faviconOffClass = 'urank-list-li-button-favicon-off';
    var watchiconOffClass = 'urank-list-li-button-watchicon-off';
    var faviconOnClass = 'urank-list-li-button-favicon-on';
    var watchiconOnClass = 'urank-list-li-button-watchicon-on';

    var liIdPrefix = '#urank-list-li-';









    var _build = function(data) {

        // Easier to built with d3 because it's data-driven

        d3.select(this.listRoot).empty();
        var ul = d3.append('ul').attr('class', ulClass);
        ul.selectAll("li").data(data);

        var aListItem = ul.enter()
            .append('li')
            .attr('class', liClass)
            .attr('id', function(d, i){ return 'urank-list-li-'+i; })
            .attr('doc-id', function(d){ return d.id})
            .attr('pos', function(d, i){ return i; });

        var rankingDiv = aListItem.append('div').attr("class", liRankingContainerClass);


        // div 2 wraps the recommendation title (as a link), a short description and a large description (not used yet)
        var contentDiv = aListItem.append("div").attr("class", liTitleContainerClass);

        contentDiv.append("h3")
            .append("a")
            .attr('id', function(d, i){ return 'urank-list-li-tile' + i; })
            .attr("href", "#")
            .html(function(d){return d.title; });

        // fav icon section on the right
        var iconSection = aListItem.append('div').attr('class', liButtonsContainer);

        iconSection.append("span")
        .attr("class", watchIconClass + ' ' + watchiconOffClass)
        .attr('title', 'Start watching');

        iconSection.append("span")
        .attr("class", favIconClass + ' ' + faviconOffClass)
        .attr('title', 'Mark as relevant');

        $(this.listRoot).scrollTo('top');
        LIST.updateItemsBackground();
        LIST.bindEventHandlersToListItems();
    };


    var updateLiBackground = function(){
        $(allListItems).removeClass('light_background').removeClass('dark_background');

        if(rankingModel.getStatus() != RANKING_STATUS.no_ranking) {
            rankingModel.getRanking().forEach(function(d, i) {
                if(i%2 ==0)
                    $(listItem + d.originalIndex).addClass('light_background');
                else
                    $(listItem + d.originalIndex).addClass('dark_background');

            });
        }
        else {
            $(allListItems).each(function(i, item){
                if(i%2 == 0)
                    $(item).addClass('light_background');
                else
                    $(item).addClass('dark_background');
            });
        }

    };



    var resetContentList = function() {};



    ContentList.prototype = {

        build: _build,
        updateLiBackground: _updateLiBackground



    };

})();








var LIST = {};

LIST.internal = {


    getFormattedTitle: function(title){
        if(title.length > 60)
            title = title.substring(0, 56) + '...';
        title = DOCPANEL.internal.highlightKeywordsInText(title, true);
        return title;
    },

    /**
         *	Calculates the index to scroll to, which depends on the existence or abscence of a ranking
         *	There exists a ranking if dataRanking.length > 0
         * */
    getIndexToScroll: function( indices ) {
        if( typeof dataRanking === 'undefined' || dataRanking === 'undefined' || dataRanking.length > 0){
            for(var i = 0; i < dataRanking.length; i++){
                if( indices.indexOf( dataRanking[i].originalIndex ) !== -1 )
                    return dataRanking[i].originalIndex;
            }
        }
        else
            return indices[0];
    },


};



/**
	 * 	Keeps track of selected recommendation in content list
	 *
	 * */
LIST.selectededListIndex = STR_NO_INDEX;


/**
	 *	Function that populates the list on the right side of the screen.
	 *	Each item represents one recommendation contained in the variable "data"
	 *
	 * */
LIST.buildContentList = function(){


};



LIST.bindEventHandlersToListItems = function(){
    // Event for item clicked
    d3.selectAll(allListItems)
    .on("click", function(d, i){ EVTHANDLER.listItemClicked(d, i); })
    .on("mouseover", EVTHANDLER.listItemHovered)
    .on("mouseout", EVTHANDLER.listItemUnhovered);

    var iconSection = d3.selectAll(allListItems).select('.'+listIconClass);
    iconSection.select('.'+favIconClass).on("click", function(d, i){ EVTHANDLER.faviconClicked(d, i);})
    iconSection.select('.'+watchIconClass).on("click", function(d, i){ EVTHANDLER.watchIconClicked(d, i);});
};

LIST.unbindEventHandlersToListItems = function(){
    // Event for item clicked
    d3.selectAll(allListItems)
    .on("click", '')
    .on("mouseover", '')
    .on("mouseout", '')
    .select('.'+listIconClass).select('.'+favIconClass).on("click", '')
    .select('.'+listIconClass).select('.'+watchIconClass).on("click", '');
};




/**
	 * Wraping function that calls a sequence of methods to create a ranking of recommendations and display it
	 *
	 * */
LIST.rankRecommendations = function() {

    rankingModel.update(TAGCLOUD.getWeightedKeywordsInBox(), rankingMode);
    this.highlightListItems();
    var status = rankingModel.getStatus();

    // Synchronizes rendering methods
    if(status == RANKING_STATUS.new || status == RANKING_STATUS.update){
        this.colorKeywordsInTitles();
        this.addRankingPositions();
        this.hideUnrankedItems();
        this.updateItemsBackground();
    }
    LIST.animateContentList(status);
    DOCPANEL.clear();
    VISPANEL.drawRanking();
};



/**
	 * Appends a yellow circle indicating the ranking position and a colored legend stating #positionsChanged
	 *
	 * */
LIST.addRankingPositions = function() {

    $('.'+rankingContainerClass).empty();

    rankingModel.getRanking().forEach(function(d, i){
        if( d.overallScore > 0 ){
            var color = d.positionsChanged > 0 ? "rgba(0, 200, 0, 0.8)" : ( d.positionsChanged < 0 ? "rgba(250, 0, 0, 0.8)" : "rgba(128, 128, 128, 0.8)" );

            var divRanking = d3.select( listItem + "" + d.originalIndex ).select('.'+rankingContainerClass);

            divRanking.append("div")
            .attr("class", "eexcess_ranking_pos")
            .text( d.rankingPos );

            divRanking.append("div")
            .attr("class", "eexcess_ranking_posmoved")
            .style("color", function(d){ return color; })
            .text(function(){
                if( d.positionsChanged == 1000 ) return STR_JUST_RANKED;
                if( d.positionsChanged > 0 ) return "+" + d.positionsChanged;
                if( d.positionsChanged < 0 ) return d.positionsChanged;
                return "=";
            });
        }
    });
};



/**
	 * Hide unranked list items
	 *
	 * */
LIST.hideUnrankedItems = function(){
    rankingModel.getRanking().forEach(function(d){
        if(d.rankingPos == 0)
            $(listItem + '' + d.originalIndex).css('display', 'none');
        else
            $(listItem + '' + d.originalIndex).css('display', '');
    });
};



/**
	 * Stop the list movement and restores default style
	 *
	 * */
LIST.stopAnimation = function(duration, easing, delay){
    $(".eexcess_list").stop(true, true);
    LIST.removeShadowEffect();
};


LIST.removeShadowEffect = function() {
    $(allListItems)
    .removeClass("eexcess_list_moving_up")
    .removeClass("eexcess_list_moving_down")
    .removeClass("eexcess_list_not_moving");
};



/**
	 * Handles the visual effects when the ranking is updated.
	 * Generates accordion-like animation for ranked items and style effects
	 *
	 * */
LIST.animateContentList = function(action) {

    LIST.stopAnimation();

    var accordionInitialDuration = 500,
        accordionTimeLapse = 50,
        accordionEasing = 'swing',
        resortingDuration = 1500,
        resortingEasing = 'swing',
        unchangedDuration = 1000,
        unchangedEasing = 'linear',
        removeDelay = 3000;

    switch(action) {
        case RANKING_STATUS.new:
            LIST.sortContentList();
            LIST.accordionAnimation(accordionInitialDuration, accordionTimeLapse, accordionEasing);
            break;

        case RANKING_STATUS.update:
            LIST.unbindEventHandlersToListItems();
            LIST.resortListAnimation(resortingDuration, resortingEasing);
            setTimeout(function() {
                LIST.sortContentList();
            }, resortingDuration);
            break;

        case RANKING_STATUS.unchanged:
            LIST.unchangedListAnimation(unchangedDuration, unchangedEasing);
            break;
        case RANKING_STATUS.reset:
            // resort items in original order
            //LIST.stopAnimation();
            break;
    }

    setTimeout(function() {
        LIST.removeShadowEffect();
    }, removeDelay);


};




/**
	 * Reorganizes list <li> items according to the calculated ranking
	 *
	 * */
LIST.sortContentList = function(){

    var liHtml = new Array();

    rankingModel.getRanking().forEach(function(d, i){
        var current = $( listItem + "" + d.originalIndex );
        current.css('top', 0);
        var outer = $(current).outerHTML();
        liHtml.push(outer);
        current.remove();
    });

    var oldHtml = "";
    for(var j = liHtml.length-1; j >= 0; j--){
        $(contentList).html(liHtml[j] + "" + oldHtml);
        oldHtml = $(contentList).html();
    }

    // Re-binds on click event to list item. Removing and re-appending DOM elements destroy the bounds to event handlers
    //d3.selectAll( allListItems ).on("click", EVTHANDLER.listItemClicked);
    LIST.bindEventHandlersToListItems();
    LIST.selectededListIndex = STR_NO_INDEX;
};




LIST.accordionAnimation = function(initialDuration, timeLapse, easing) {

    initialDuration = initialDuration || 500;
    timeLapse = timeLapse || 50;
    easing = easing || 'swing';

    rankingModel.getRanking().forEach(function(d, i){
        var item = $(listItem +""+ d.originalIndex);

        if( d.overallScore > 0 ){
            var shift = (i+1) * 5;
            var duration = initialDuration + timeLapse * i;

            item.addClass("eexcess_list_moving_up");
            item.animate({'top': shift}, {
                'complete': function(){
                    $(this).animate({"top": 0}, duration, easing);
                }
            });
        }
    });
};


/**
	 * IN PROGRESS
	 *
	 * */
LIST.resortListAnimation = function(duration, easing) {

    duration = duration || 1500;
    easing = easing || 'swing';

    var acumHeight = 0;
    var listTop = $(contentList).position().top;

    rankingModel.getRanking().forEach(function(d, i){

        if(d.rankingPos > 0) {
            var item = $(listItem +""+ d.originalIndex);
            var itemTop = $(item).position().top;
            var shift = listTop +  acumHeight - itemTop;
            var movingClass = (d.positionsChanged > 0) ? "eexcess_list_moving_up" : ((d.positionsChanged < 0) ? "eexcess_list_moving_down" : "");

            item.addClass(movingClass);
            item.animate({"top": '+=' + shift+'px'}, duration, easing);

            acumHeight += $(item).height();
        }
    });
};




LIST.unchangedListAnimation = function (duration, easing) {

    duration = duration || 1000;
    easing = easing || 'linear';

    dataRanking.forEach(function(d, i) {

        var item = $(listItem +""+ d.originalIndex);
        var startDelay = i * 30;

        setTimeout(function() {
            item.addClass('eexcess_list_not_moving');
            item.removeClass('eexcess_list_not_moving', duration, easing);
        }, startDelay);
    });
};




/**
     * Description
     */




/**
     * Description
     */
LIST.colorKeywordsInTitles = function(){

    $(allListItems).each(function(i, item){
        var pos = parseInt($(item).attr('pos'));
        $(item).find('a').html(LIST.internal.getFormattedTitle(data[pos].title));

    });

};



/**
	 * Draws legend color icons in each content list item
	 * */
LIST.selectListItem = function( i, flagSelectedOutside ){
    LIST.stopAnimation();
    var isSelectedFromOutside = flagSelectedOutside || false;

    // if clickedListIndex is undefined then the item was selected, otherwise it was deselected
    if(i !== LIST.selectededListIndex){
        LIST.selectededListIndex = i;
        var actualIndex = rankingModel.getActualIndex(i);
        LIST.highlightListItems(actualIndex);
        DOCPANEL.showDocument(actualIndex);
    }
    else{
        LIST.selectededListIndex = STR_NO_INDEX;
        LIST.highlightListItems();
        DOCPANEL.clear();
    }

    if( !isSelectedFromOutside )
        VISPANEL.selectItemInRanking(i);
};


/**
	 *	Function that highlights items on the content list, according to events happening on the visualization.
	 *	E.g. when one or more keywords are selected, the related list items remain highlighted, while the other become translucid
	 *	If no paramters are received, all the list items are restored to the default opacity
	 *
	 * */
LIST.highlightListItems = function(index){
    if(typeof index !== 'undefined'){
        $(allListItems).css("opacity", "0.3");
        $(listItem + "" + index).css("opacity", "1");
    }
    else{
        $(allListItems).css("opacity", "1");
    }
};



LIST.hoverListItem = function(index, isExternalCall) {
    $(listItem + '' + rankingModel.getActualIndex(index)).addClass("eexcess_list_hover");
    isExternalCall = isExternalCall || false;
    if(!isExternalCall)
        VISPANEL.hoverItem(index);
};



LIST.unhoverListItem = function(index, isExternalCall){
    $(listItem + '' + rankingModel.getActualIndex(index)).removeClass("eexcess_list_hover");
    isExternalCall = isExternalCall || false;
    if(!isExternalCall)
        VISPANEL.unhoverItem(index);
};



/**
	 * Restores content list to its original state
	 *
	 * */
LIST.resetContentList = function(){

    rankingModel.reset();

    var liHtml = new Array();
    rankingModel.getOriginalData().forEach(function(d, i){
        var item = $( listItem + "" + i );
        item.css("top", "0");
        item.css("display", "");
        liHtml.push( $(item).outerHTML() );
        item.remove();
    });

    var oldHtml = "";
    for(var j = liHtml.length-1; j >= 0; j--){
        $(contentList).html(liHtml[j] + "" + oldHtml);
        oldHtml = $(contentList).html();
    }
    LIST.bindEventHandlersToListItems();

    // Delete ranking related icons
    $('.'+rankingContainerClass).empty();

    LIST.colorKeywordsInTitles();
    LIST.highlightListItems();
    LIST.updateItemsBackground();
    LIST.animateContentList(RANKING_STATUS.reset);
};



LIST.switchFaviconOnOrOff = function(index){
    data[index].isSelected = !data[index].isSelected;
    var classToAdd = data[index].isSelected ? favIconOnClass : favIconOffClass;
    var classToRemove = classToAdd === favIconOnClass ? favIconOffClass : favIconOnClass;
    $(listItem + '' + index +' .'+ listIconClass + ' .' + favIconClass)
    .switchClass(classToRemove, classToAdd);
};


LIST.clearAllFavicons = function(){
    $(allListItems + ' .'+ listIconClass + ' .' + favIconClass).removeClass(favIconOnClass).addClass(favIconOffClass);
};


LIST.watchOrUnwatchListItem = function(index){
    var watchIcon = $(listItem + '' + index +' .'+ listIconClass + ' .' + watchIconClass);
    var classToAdd = watchIcon.hasClass(watchIconOffClass) ? watchIconOnClass : watchIconOffClass;
    var classToRemove = classToAdd === watchIconOnClass ? watchIconOffClass : watchIconOnClass;
    watchIcon.switchClass(classToRemove, classToAdd);

    $(listItem + '' + index).toggleClass(watchedClass);
};
