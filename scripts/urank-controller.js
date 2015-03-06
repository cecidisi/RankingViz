
var Urank = (function(){

    var rankingModel, rankingVis;
    var contentList, tagCloud, tagBox, visPanel, docViewer;

    // Color scales
    var tagColorRange = colorbrewer.Blues[TAG_CATEGORIES + 1];
    tagColorRange.splice(tagColorRange.indexOf("#08519c"), 1, "#2171b5");
    var queryTermColorRange = colorbrewer.Set1[9];
    queryTermColorRange.splice(weightColorRange.indexOf("#ffff33"), 1, "#ffd700");
    var tagColorScale, queryTermColorScale;







    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var EVTHANDLER = {
        onItemClicked : function(d, i) {
            contentList.highlighListItem(i);
            // call vispanel.selectitem
            // call docviewer.showdocument
        },
        onItemHovered: function(d, i) {
            contentList.addHoverEffect(i);
            // call vispanel.hoveritem
        },
        onItemUnhovered: function(d, i) {
            contentList.removeHoverEffect(i);
            // call vispanel.unhoveritem
        },
        // to be returned
        onReset: function() {
            /*
            TAGCLOUD.clearTagbox();
            TAGCLOUD.buildTagCloud();
            LIST.resetContentList();
            VISPANEL.resetRanking();
            DOCPANEL.clear();*/
            contentList.reset(data);

        },
        onFaviconClicked: function(d, i){
            data[i].isSelected = !data[i].isSelected;
            contentList.switchFaviconOnOrOff(i, d.isSelected);
        },
        onWatchiconClicked: function(d, i) {
            contentList.watchOrUnwatchListItem(d, i);
        },
        onRankByOverallScore: function() {

        },
        onRankByMaximumScore: function() {

        }


    };



    // do in controller
    var rankRecommendations = function() {

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
        LIST.animateContentList(data, status);
        DOCPANEL.clear();
        VISPANEL.drawRanking();
    };


    // do in controller
    // Receives actual index. Resolve in controller
    var _selectListItem = function(index) {

        this.stopAnimation();
        this.selectedIndex = (index == this.selectedIndex) ? STR_NO_INDEX : index;
        // if selectedIndex is undefined then the item was deselected, otherwise it was selected
        if(this.selectedIndex !== STR_NO_INDEX)
            this.highlightListItems(index);
        //DOCPANEL.showDocument(index);     do in controller
        else
            this.undoHighlight();
        //  DOCPANEL.clear();
    }









    EVTHANDLER.canvasResized = function(){
        VISPANEL.resizeRanking();
    };


    ////////	Rank button clicked (by overall or max score)	////////

    EVTHANDLER.rankButtonClicked = function(sender){
        rankingMode = $(sender).attr('sort-by');
        if(rankingModel.getStatus() != RANKING_STATUS.no_ranking)
            LIST.rankRecommendations();
    };



    ////////	Reset Button Click	////////

    EVTHANDLER.btnResetClicked = function(){
        TAGCLOUD.clearTagbox();
        TAGCLOUD.buildTagCloud();
        LIST.resetContentList();
        VISPANEL.resetRanking();
        DOCPANEL.clear();
    };



    ////////	content list item click	////////

    EVTHANDLER.listItemClicked = function(d, i){
        LIST.selectListItem(i);
    };

    ////////	list item mouseover	////////
    EVTHANDLER.listItemHovered = function(d, index){
        LIST.hoverListItem(index);
    };


    ////////	list item mouseout	////////
    EVTHANDLER.listItemUnhovered = function(d, index){
        LIST.unhoverListItem(index);
    };



    ////////	Tag in box mouseovered	////////

    EVTHANDLER.tagInBoxMouseOvered = function(){
        d3.select(this)
        .style( "background", function(k){ return getGradientString("#0066ff", [1, 0.8, 1]); })
        .style('border', '1px solid #0066ff')
        .style("color", "#eee");
    };


    ////////	Tag in box mouseouted	////////

    EVTHANDLER.tagInBoxMouseOuted = function(){
        d3.select(this)
        .style( "background", function(k){ return getGradientString(tagColorScale(k.colorCategory+1), [1, 0.7, 1]); })
        .style('border', function(k){ return '1px solid ' + tagColorScale(k.colorCategory+1); })
        .style("color", "#111");
    };



    ////////	Delete tag click	////////

    EVTHANDLER.deleteTagClicked = function(tag){
        TAGCLOUD.deleteTagInBox(tag);
    };


    ////////	Draggable	////////

    var draggedItem;
    var isOverDroppable;

    EVTHANDLER.dragStarted = function(event, ui) {
        draggedItem = $(this).hide();
        isOverDroppable = false;
    };


    EVTHANDLER.dragStopped = function(event, ui) {
        draggedItem.show();
        if(isOverDroppable){
            $(this).draggable('destroy');
            var keywordTerm = d3.select(draggedItem[0]).text();
            LIST.rankRecommendations();
        }
    };


    ////////	Droppable	////////

    EVTHANDLER.dropped = function(event, ui){
        TAGCLOUD.dropTagInTagBox( ui.draggable );
        ui.draggable.draggable( BEHAVIOR.draggableOptions );
        isOverDroppable = true;
    };


    ////////	Slider	////////

    EVTHANDLER.slideSlided = function(event, ui) {
        TAGCLOUD.changeKeywordInBoxWeight( this, ui );
    };


    EVTHANDLER.slideStopped = function() {
        LIST.rankRecommendations();
    };



    EVTHANDLER.faviconClicked = function(d, i){
        d3.event.stopPropagation();
        var index = rankingModel.getActualIndex(i);
        HEADER.addItemToListOfSelected(index);
        LIST.switchFaviconOnOrOff(index);
    };



    EVTHANDLER.watchIconClicked = function(d, i){
        d3.event.stopPropagation();
        LIST.watchOrUnwatchListItem(rankingModel.getActualIndex(i));
    };


    EVTHANDLER.removeSelectedItemIconClicked = function(event, index) {
        event.stopPropagation();
        HEADER.removeItemFromListOfSelected(index);
        LIST.switchFaviconOnOrOff(index);
    };


    ////////	Show List button	////////

    EVTHANDLER.btnListClicked = function(event){
        event.stopPropagation();
        $(sampleTextSection).slideUp();
        $(selectedItemsSection).slideToggle();
    };


    ////////	Show Text button	////////

    EVTHANDLER.btnTextClicked = function(event){
        event.stopPropagation();
        $(selectedItemsSection).slideUp();
        $(sampleTextSection).slideToggle();
    };


    ////////	Finished button	////////

    EVTHANDLER.btnFinishedClicked = function(){
        HEADER.finishQuestion();
    };





    function Urank(arguments) {

        var settings = $.extend({
            tagCloudRoot: '',
            tagCloudCallbacks: {},
            tagBoxRoot: '',
            tagBoxCallbacks: {},
            contentListRoot: '',
            contentListCallBacks: {},
            visPanelRoot: '',
            visPanelCallbacks: {},
            docViewerRoot: '',
            docViewerCallbacks: {},
            tagColorArray: tagColorRange,
            queryTermColorArray: queryTermColorRange


        }, arguments);



        // Set color scales
        tagColorScale = d3.scale.ordinal().domain(d3.range(0, TAG_CATEGORIES, 1)).range(s.tagColorArray);
        queryTermColorScale = d3.scale.ordinal().range(s.queryTermColorArray);




        init(settings);
    }



    function init(s){

        contentList = new ContentList({
            root: '',
            colorScale: queryTermColorRange,
            onListItemClicked: EVTHANDLER.onItemClicked,
            onListItemHovered: EVTHANDLER.onItemHovered,
            onListItemUnhovered: EVTHANDLER.onItemUnhovered,
            onFaviconClicked: function(d, i){},
            onWatchiconClicked: function(d, i){},
            getTextWithKeywordsHighlighted: function(text){ return text; }
        });

    }



    Urank.prototype = {
        loadData: function(data) {

            rankingModel = new RankingModel(data);
            rankingVis = new RankingVis(s.
        }

    }



})();






        var width = this.width(),
            height = this.height();

        // DOM Selectors
        var root = "#eexcess_canvas";												// String to select the area where the visualization should be displayed

        var headerPanel = "#eexcess_header";                                        // header dom element
        var headerInfoSection = "#eexcess_header_info_section span";
        var headerTaskSection = "#eexcess_header_task_section";						// Section wrapping #items, task, finish and expand/collapse buttons
        var headerControlsSection = "#eexcess_header_control_section";
        var btnShowList = "#eexcess_list_button";
        var btnShowText = "#eexcess_text_button";
        var btnFinished = "#eexcess_finished_button";                               // Finishes the task and redirects back to the initial screeen
        var sampleTextSection = "#eexcess_topic_text_section";
        var selectedItemsSection = "#eexcess_selected_items_section";               // Section listing items marked as relevant by the user
        var selectedItemsClass = "eexcess_selected_item";                          // Selected item contained in selectedItemsSection

        var mainPanel = "#eexcess_main_panel";                                      // Panel containing tag cloug, canvas (in #eexcess_vis) and content list
        var tagContainer = "#eexcess_keywords_container";							// Selector for div wrapping keyword tags
        var tagClass = "eexcess_keyword_tag";										// Selector for all keyword tags
        var tagId = "#tag-";                                                        // Id selector for tags in tag container
        var tagPos = "tag-pos-";													// attribute for keyword tags. value assigned = index
        var tagBox = "#eexcess_keywords_box";										// Selector for div where tags are droppped
        var tagInBoxClass = "eexcess_keyword_tag_in_box";							// Selector for keyword tags inside tag box
        //var weightSliderClass = "eexcess_weight_slider";							// Selector for slider class within tags in tag box
        var weightSliderId = "#eexcess_weight_slider_pos-";							// Id selector for slider within tags in tag box
        var tagIconClass = "eexcess_tag_icon";										// Selector for "delete" icon in tags inside tag box
        var btnReset = "#eexcess_btnreset";											// Selector for reset button in vis control panel
        var btnRankByOverall = "#eexcess_btn_sort_by_overall_score";                // Button that triggers ranking by overall score criteria
        var btnRankByMax = "#eexcess_btn_sort_by_max_score";                        // Button to rank by max score criteria

        var visPanelCanvas = "#eexcess_vis_panel_canvas";
        var contentPanel = "#eexcess_content";										// Selector for content div on the right side
        var contentList = "#eexcess_content .eexcess_result_list";					// ul element within div content
        var allListItems = "#eexcess_content .eexcess_result_list .eexcess_list";	// String to select all li items by class
        var listItem = "#data-pos-";	                                      		// String to select individual li items by id
        var watchedClass = 'watched';
        var rankingContainerClass = "eexcess_ranking_container";					// class selector for div wrapping ranking indicators in content list
        var listIconClass = "eexcess_listicon_section";
        var favIconClass = 'favicon';
        var favIconOffClass = 'favicon_off';
        var favIconOnClass = 'favicon_on';
        var watchIconClass = 'watchicon';
        var watchIconOffClass = 'watchicon_off';
        var watchIconOnClass = 'watchicon_on';

        var documentDetailsTitle = "#eexcess_document_details_title";
        var documentDetailsYear = "#eexcess_document_details_year";
        var documentDetailsLanguage = "#eexcess_document_details_language";
        var documentDetailsProvider = "#eexcess_document_details_provider";
        var documentViewer = '#eexcess_document_viewer';


        // Numeric Constants
        var TAG_CATEGORIES = 5;
        var SELECTED_ITEMS_REQUIRED = 5;

        //  String Constants
        var LOADING_IMG = "media/loading.gif";
        var DELETE_ICON_IMG = "media/fancybox_sprite_close.png";
        var NO_IMG = "media/no-img.png";
        var REMOVE_SMALL_ICON = "media/batchmaster/remove.png"
        var ICON_EUROPEANA =  "media/Europeana-favicon.ico";
        var ICON_MENDELEY = "media/mendeley-favicon.ico";
        var ICON_ZBW = "media/ZBW-favicon.ico";
        var ICON_WISSENMEDIA = "media/wissenmedia-favicon.ico";
        var ICON_KIM_COLLECT = "media/KIM.Collect-favicon.ico";
        var ICON_UNKNOWN = "media/help.png";
        var ARROW_DOWN_ICON = "media/batchmaster/arrow-down.png";
        var ARROW_UP_ICON = "media/batchmaster/arrow-up.png";

        var STR_DROPPED = "Dropped!";
        var STR_DROP_TAGS_HERE = "Drop tags here!";
        var STR_JUST_RANKED = "new";
        var STR_SEARCHING = "Searching...";
        var STR_NO_INDEX = 'no_index';

        // variables from dataset
        var dataset,
            data,						// contains the data to be visualized
            keywords,
            query,						// string representing the query that triggered the current recommendations
            sampleText, task, questions;

        // Ancillary variables
        var dataRanking,					// array that represents the current ranking. Each item is an object specifying "originalIndex, "overallScore", "rankingPos" and "positionsChanged"
            selectedTags = [],				// array of DOM elements contained in the tag box
            rankingMode = RANKING_MODE.overall_score,
            showRanking;


        // Ranking object
        var rankingModel;
        var rankingVis;


        // Color scales
        var tagColorRange = colorbrewer.Blues[TAG_CATEGORIES + 1];
        tagColorRange.splice(tagColorRange.indexOf("#08519c"), 1, "#2171b5");
        var tagColorScale = d3.scale.ordinal().domain(d3.range(0, TAG_CATEGORIES, 1)).range(tagColorRange);
        var weightColorRange = colorbrewer.Set1[9];
        weightColorRange.splice(weightColorRange.indexOf("#ffff33"), 1, "#ffd700");
        var weightColorScale = d3.scale.ordinal().range(weightColorRange);


        // NLP
        var stemmer = natural.PorterStemmer;
        var nounInflector = new natural.NounInflector();
        stemmer.attach();
        nounInflector.attach();












