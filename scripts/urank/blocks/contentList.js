

var ContentList = (function(){

    var _this;
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
        _this = this;
        s = $.extend({
            root: '',
            onListItemClicked: function(d, i){},
            onListItemHovered: function(i){},
            onListItemUnhovered: function(i){},
            onFaviconClicked: function(d, i){},
            onWatchiconClicked: function(d, i){},
            getTextWithKeywordsHighlighted: function(text){ return text;}
        }, arguments);

        this.data = [];
    }



    var _build = function(data) {

        this.data = data;
        this.selectedIndex = STR_NO_INDEX;
        $(s.root).addClass();

        // Easier to build with d3 because it's data-driven
        d3.select(s.root).empty();
        var ul = d3.select(s.root).append('ul').attr('class', ulClass);
        var liData = ul.selectAll('.'+liClass).data(data);

        var aListItem = liData.enter()
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
            .html(function(d){ return d.title });

        // fav icon section on the right
        var iconSection = aListItem.append('div').attr('class', liButtonsContainer);
        iconSection.append("span")
            .attr("class", watchiconClass + ' ' + watchiconOffClass)
            .attr('title', 'Start watching');

        iconSection.append("span")
            .attr("class", faviconClass + ' ' + faviconOffClass)
            .attr('title', 'Mark as relevant');

        $(s.root).scrollTo('top');
        this.formatTitles(data);
        this.updateLiBackground(data),
        this.bindEvenHandlers();
    };



    /**
    * @private     * Description
    * @param {type} data : current ranking
    * @param {type} status Description
    */
    var _update = function(data, status, keywords, colorScale) {

        this.stopAnimation();
        this.undoHighlight();
        this.formatTitles(data, keywords, colorScale);
        this.showRankingPositions(data);
        this.hideUnrankedListItems(data);

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
                this.updateLiBackground(data);
                this.animateAccordionEffect(data, accordionInitialDuration, accordionTimeLapse, accordionEasing);
                break;

            case RANKING_STATUS.update:
                this.unbindEventHandlers();
                this.updateLiBackground(data);
                this.animateResortEffect(data, resortingDuration, resortingEasing);
                setTimeout(function() {
                    _this.sort(data);
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
            _this.removeShadowEffect();
        }, removeDelay);


    };



    var _sort = function(data){

        var liHtml = new Array();

        data.forEach(function(d, i){
            var index =(d.originalIndex !== 'undefined') ? d.originalIndex : i;

            var current = $(liItem +''+ index);
            current.css('top', 0);
            var outer = $(current).outerHTML();
            liHtml.push(outer);
            current.remove();
        });

        var oldHtml = "";
        for(var j = liHtml.length-1; j >= 0; j--){
            $('.'+ulClass).html(liHtml[j] + "" + oldHtml);
            oldHtml = $('.'+ulClass).html();
        }

        // Re-binds on click event to list item. Removing and re-appending DOM elements destroys the bindings to event handlers
        this.bindEvenHandlers();
        this.selectedIndex = STR_NO_INDEX;

        ////////////////

//        d3.selectAll('.'+liClass).remove();
//        var liData = d3.select('.'+ulClass).selectAll('.'+liClass).data(data);
//
//        var aListItem = liData.enter().append('li')
//            .attr('class', liClass)
//            .attr('id', function(d, i){ return 'urank-list-li-'+i; })
//            .attr('doc-id', function(d){ return d.id})
//            .attr('pos', function(d, i){ return i; });
//
//        var rankingDiv = aListItem.append('div').attr("class", liRankingContainerClass);
//        rankingDiv.append('div').attr("class", rankingPosClass).text(function(d){ return d.rankingPos });
//        rankingDiv.append('div').attr("class", rankingPosMovedClass).text(function(d){ return d.positionsChanged });
//
//        var contentDiv = aListItem.append("div").attr("class", liTitleContainerClass);
//        contentDiv.append("h3")
//            .append("a")
//            .attr('id', function(d, i){ return 'urank-list-li-tile' + i; })
//            .attr("href", "#")
//            .html(function(d){ return d.title });
//
//        // fav icon section on the right
//        var iconSection = aListItem.append('div').attr('class', liButtonsContainer);
//        iconSection.append("span")
//            .attr("class", watchiconClass + ' ' + watchiconOffClass)
//            .attr('title', 'Start watching');
//
//        iconSection.append("span")
//            .attr("class", faviconClass + ' ' + faviconOffClass)
//            .attr('title', 'Mark as relevant');
//
//      //  liData.exit().remove();
//
//        $(s.root).scrollTo('top');
//        //this.updateLiBackground(data),
//        this.bindEvenHandlers();
    };


    var _reset = function() {
        $('.'+liRankingContainerClass).empty();
        this.sort(this.data);
        this.updateLiBackground();
        this.formatTitles();
        // LIST.animateContentList(RANKING_STATUS.reset);       call from controller
    };


    var _formatTitles = function(data, keywords, colorScale) {

        data.forEach(function(d, i){
            var index = d.originalIndex ||i;
            var title = (d.title.length > 60) ? (d.title.substring(0, 56) + '...') : d.title + '';
            title = (!keywords || !colorScale) ? title : getStyledText(title, keywords, colorScale);
            //console.log((!keywords || !colorScale));
            //console.log(title);
            $(liItem +''+ index).find('a').html(title);
        });
    }


    var _bindEventHandlers = function() {
        d3.selectAll('.'+liClass)
            .on("click", function(d, i){ s.onListItemClicked.call(this, d, i); })
            .on("mouseover", function(d, i){ s.onListItemHovered.call(this, d, i); })
            .on("mouseout", function(d, i){ s.onListItemUnhovered.call(this, d, i); });

        var iconSection = d3.selectAll('.'+liClass).select('.' + liButtonsContainer);
        iconSection.select('.'+faviconClass).on("click", function(d, i){ s.onFaviconClicked.call(this, i);})
        iconSection.select('.'+watchiconClass).on("click", function(d, i){ s.onWatchiconClicked.call(this, i);});
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

    var _unbindEventHandlers = function() {
        d3.selectAll('.'+liClass).on("click", '').on("mouseover", '').on("mouseout", '');

        var iconSection = d3.selectAll('.'+liClass).select('.'+liButtonsContainer);
        iconSection.select('.'+faviconClass).on("click", '')
        iconSection.select('.'+watchiconClass).on("click", '');
    };



    var _updateLiBackground = function(data){
        $('.'+liClass).removeClass(liLightBackground).removeClass(liDarkBackground);

        data.forEach(function(d, i) {
            var backgroundClass = (i % 2 == 0) ? liLightBackground : liDarkBackground;
            var index = (typeof d.originalIndex !== 'undefined') ? d.originalIndex : i;
            $(liItem +''+ index).addClass(backgroundClass);
        });
    };



    var _highlightListItem = function(index) {
        this.stopAnimation();
        this.selectedIndex = (this.selectedIndex == index) ? STR_NO_INDEX : index;
        if(this.selectedIndex !== STR_NO_INDEX) {
            $('.'+liClass).css("opacity", "0.3");
            $(liItem + '' + index).css("opacity", "1");
        }
        else
            this.undoHighlight();
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


    var _hideUnrankedListItems = function(data) {
        data.forEach(function(d){
            var display = d.rankingPos > 0 ? '' : 'none';
            $(liItem + '' + d.originalIndex).css('display', display);
        });
    };



    var _showRankingPositions = function(data) {

        var color = function(d) {
            if(d.positionsChanged > 0) return "rgba(0, 200, 0, 0.8)";
            if(d.positionsChanged < 0) return "rgba(250, 0, 0, 0.8)";
            return "rgba(128, 128, 128, 0.8)";
        };

        var posMoved = function(d) {
            //console.log(d.positionsChanged);
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
                rankingDiv.select('.'+rankingPosMovedClass).style('color', color(d)).text(posMoved(d));
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




    ContentList.prototype = {

        build: _build,
        sort: _sort,
        reset: _reset,
        update: _update,
        animateAccordionEffect: _animateAccordionEffect,
        animateResortEffect: _animateResortEffect,
        animateUnchangedEffect: _animateUnchangedEffect,
        formatTitles: _formatTitles,
        bindEvenHandlers: _bindEventHandlers,
        unbindEventHandlers: _unbindEventHandlers,
        updateLiBackground: _updateLiBackground,
        highlightListItem: _highlightListItem,
        undoHighlight: _undoHighlight,
        stopAnimation: _stopAnimation,
        removeShadowEffect: _removeShadowEffect,
        hideUnrankedListItems: _hideUnrankedListItems,
        hover: _hover,
        unhover: _unhover,
        showRankingPositions: _showRankingPositions,
        clearAllFavicons: _clearAllFavicons,
        switchFaviconOnOrOff: _switchFaviconOnOrOff,
        watchOrUnwatchListItem: _watchOrUnwatchListItem
    };

    return ContentList;
})();


