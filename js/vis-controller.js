
$(document).ready(function(){
    var Vis_Controller = new VisController();
    Vis_Controller.init();
});


function VisController() {

	var self = this;

    var width  = $(window).width();		// Screen width
    var height = $(window).height();	// Screen height


    // DOM Selectors
    var root = "#eexcess_canvas";												// String to select the area where the visualization should be displayed

    var headerPanel = "#eexcess_header";                                        // header dom element
    var headerTaskSection = "#eexcess_header_task_section";						// Section wrapping #items, task, finish and expand/collapse buttons
    var expandCollapseBtn = "#eexcess_header_task_section img";                 // Img element for expanding/collapsing header
    var btnFinished = "#eexcess_finished_button";                               // Finishes the task and redirects back to the initial screeen
    var messageSection = "#eexcess_message_section";                            // Selector for section displaying text and message for the current task. Child <p>
    var selectedItemsSection = "#eexcess_selected_items_section";               // Section listing items marked as relevant by the user
    var selectedItemsClass = ".eexcess_selected_item";                          // Selected item contained in selectedItemsSection

    var mainPanel = "#eexcess_main_panel";                                      // Panel containing tag cloug, canvas (in #eexcess_vis) and content list
    var inputCriteria = '.eexcess_vis_controls_input';
    var radioCriteria = 'input:radio';                                          // Selector for radio button that switches ranking criteria
	var tagContainer = "#eexcess_keywords_container";							// Selector for div wrapping keyword tags
	var tagClass = ".eexcess_keyword_tag";										// Selector for all keyword tags
    var tagId = "#tag-";                                                        // Id selector for tags in tag container
	var tagPos = "tag-pos-";													// attribute for keyword tags. value assigned = index
	var tagBox = "#eexcess_keywords_box";										// Selector for div where tags are droppped
	var tagClassInBox = ".eexcess_keyword_tag_in_box";							// Selector for keyword tags inside tag box
	var weightSliderClass = ".eexcess_weight_slider";							// Selector for slider class within tags in tag box
	var weightSliderId = "#eexcess_weight_slider_pos-";							// Id selector for slider within tags in tag box
	var tagImgClass = ".eexcess_tag_img";										// Selector for "delete" icon in tags inside tag box
	var btnReset = "#eexcess_btnreset";											// Selector for reset button in vis control panel
    var btnRankByOverall = "#eexcess_btn_sort_by_overall_score";                // Button that triggers ranking by overall score criteria
    var btnRankByMax = "#eexcess_btn_sort_by_max_score";                        // Button to rank by max score criteria
	var contentPanel = "#eexcess_content";										// Selector for content div on the right side
	var contentList = "#eexcess_content .eexcess_result_list";					// ul element within div content
	var allListItems = "#eexcess_content .eexcess_result_list .eexcess_list";	// String to select all li items by class
	var listItem = "#data-pos-";	                                      		// String to select individual li items by id
	var rankingContainerClass = ".eexcess_ranking_container";					// class selector for div wrapping ranking indicators in content list
    var favIconClass = ".eexcess_favicon_section";
    var detailsSections = '.eexcess_item_details_section';

    var documentViewer = '#eexcess_document_viewer';


	// Constants
	var TAG_CATEGORIES = 5;
    var SELECTED_ITEMS_REQUIRED = 5;

	var LOADING_IMG = "media/loading.gif";
	var DELETE_ICON_IMG = "media/fancybox_sprite_close.png";
	var NO_IMG = "media/no-img.png";
    var FAV_ICON_OFF = "media/favicon_off.png";
    var FAV_ICON_ON = "media/favicon_on.png";
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
    var STR_NO_INDEX = 'no_index'


	// Main variables
    var dataset;
	var data;							// contains the data to be visualized
	var keywords;
	var query;							// string representing the query that triggered the current recommendations
    var message, task;


	// Ancillary variables
	var dataRanking;					// array that represents the current ranking. Each item is an object specifying "originalIndex, "overallScore", "rankingPos" and "positionsChanged"
	var selectedTags = [];				// array of DOM elements contained in the tag box
	var indicesToHighlight = [];		// array containing the indices of <li> elements to be highlighted in content list
    var rankingCriteria = 'overall_score';
    var startTime;

	// Chart objects
	var  rankingVis;


	// Color scales
	var tagColorScale = d3.scale.ordinal().domain(d3.range(0, TAG_CATEGORIES, 1)).range(colorbrewer.Blues[TAG_CATEGORIES + 1]);
    var textTagColorScale = d3.scale.ordinal().range(['#eee', '#ddd', '#333', '#222', '#222']);
    var weightColorScale = d3.scale.ordinal().range( colorbrewer.Set1[9] );



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var PREPROCESSING = {};


	/**
	 *	Bind event handlers to
	 *
	 * */
	PREPROCESSING.bindEventHandlers = function(){
		$(btnReset).click( function(){ EVTHANDLER.btnResetClicked(); });
        $(btnRankByOverall).click(function(){ EVTHANDLER.rankButtonClicked(this); });
        $(btnRankByMax).click(function(){ EVTHANDLER.rankButtonClicked(this); });
        $(expandCollapseBtn).click(function(){ EVTHANDLER.expandCollapseBtnClicked(); });
        $(btnFinished).click(function(){ EVTHANDLER.btnFinishedClicked(); });
        $(inputCriteria).click(function(){ EVTHANDLER.radioScoreClicked( $(this).attr('value') ) });
        $(window).resize(function(){ EVTHANDLER.canvasResized(); });
        $(mainPanel).resize(function(){ EVTHANDLER.canvasResized(); });
	};



    PREPROCESSING.extendDataWithAncillaryDetails = function(){

        data.forEach(function(d){
/**
            if(typeof d['description' == 'undefined'] || d['description' == 'undefined'])
                d['description'] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus semper, metus sit amet tristique ultricies, nulla augue eleifend neque, sed luctus neque dui semper est. Suspendisse sodales urna tortor, vitae convallis erat luctus id. Maecenas sit amet mauris quis risus consectetur pulvinar et a augue. Nulla facilisi. Nulla facilisi. Praesent a lacus bibendum, placerat purus non, pulvinar orci. Fusce pellentesque, risus at mattis tempus, ante massa auctor eros, et blandit sapien nunc eu diam. Aenean at pharetra dolor. Praesent rhoncus sodales elementum. Nunc eget pellentesque velit, eu accumsan sem. Curabitur hendrerit nisi arcu, et imperdiet nibh adipiscing eget. Vestibulum porttitor libero eu sem mattis, a commodo erat molestie. In in convallis tellus. Fusce eget mauris erat.";
       */
            d['isSelected'] = false;

            // Assign 'provider-icon' with the provider's icon
            switch(d.facets.provider){
                case "europeana":
                case "Europeana":   d['provider-icon'] = ICON_EUROPEANA; break;
			    case "mendeley":    d['provider-icon'] = ICON_MENDELEY; break;
                case "econbiz":
                case "ZBW":         d['provider-icon'] = ICON_ZBW; break;
                case "wissenmedia": d['provider-icon'] = ICON_WISSENMEDIA; break;
                case "KIM.Collect": d["provider-icon"] = ICON_KIM_COLLECT; break;
                default:            d['provider-icon'] = ICON_UNKNOWN; break;EVTHANDLER.expandCollapseBtnClicked
            }
        });

    };



	PREPROCESSING.extendKeywordsWithColorCategory = function(){
/*
		var extent = d3.extent(keywords, function(k){ return k['score']; });
		var range = (extent[1] - extent[0] + 0.1) / TAG_CATEGORIES;
        console.log('extent --> ' + extent[0] + ' - ' + extent[1]);
        console.log('range = ' + range);
        catArray = [];

		keywords.forEach(function(k){
			k['colorCategory'] = parseInt( (k['score'] - extent[0]) / range );
            if(typeof catArray[k.colorCategory] == 'undefined' || catArray[k.colorCategory] == 'undefined')
                catArray[k.colorCategory] = 1;
            else
                catArray[k.colorCategory]++;
		});

        var inf = extent[0];
        catArray.forEach(function(c, i){
            console.log('Category ' + (inf)  + ' - ' + (inf + range) + ' --> ' + c);
            inf = inf + range;
        });
        */

        var min = d3.extent(keywords, function(k){ return k['repeated']; })[0];

        keywords.forEach(function(k){
            k['colorCategory'] = k.repeated - min < TAG_CATEGORIES ? k.repeated - min : TAG_CATEGORIES - 1;
        });


	};





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var HEADER = {};


    HEADER.internal = {
        validateFinishedTask : function(){
            /*
            var numberOfSelectedItems = $(selectedItemsClass).length;
            if(numberOfSelectedItems < SELECTED_ITEMS_REQUIRED){
                alert("You must select exactly " + SELECTED_ITEMS_REQUIRED + " items from the list" +
                     "\n Items selected = " + numberOfSelectedItems);
                return false;
            }
            else if(numberOfSelectedItems > SELECTED_ITEMS_REQUIRED){
                alert("You must select exactly " + SELECTED_ITEMS_REQUIRED + " items from the list" +
                     "\n Items selected = " + numberOfSelectedItems);
                return false;
            }*/
            return true;
        }

    };


    HEADER.showInfoInHeader = function(){

        // Display number of results on the left of header
		$( headerTaskSection ).find( "span" ).text("Number of Items: " + data.length);

        // Display task on the left of header
        $( headerTaskSection ).find( "p" ).text('TASK: ' + task);

        // Show test paragraph in the middle of the header
        $(messageSection).find('p').text(message);
    }



	/**
	 *	Updates the text in the center of the header according to the received paramter
	 *
	 * *//*
	HEADER.updateHeaderText = function(text){

		if( text == STR_SEARCHING){
			$( headerText ).find( "span" ).text( "" );
			$( root ).empty();

			var loadingDiv = d3.select( root ).append("div")
				.attr("id", "eexcess_loading_results");

			loadingDiv.append("span")
				.text( STR_SEARCHING );

			loadingDiv.append("img")
				.attr("src", LOADING_IMG);
		}
		else{
			$( headerText ).find( "span" ).text( text );
		}
	};

	*/

	HEADER.addItemToListOfSelected = function(index){

        if(!data[index].isSelected){
            var selectedItemContainer = d3.select(selectedItemsSection).append('div')
                .attr('class', 'eexcess_selected_item')
                .attr('original-index', index);

            selectedItemContainer.append('span').text(data[index].title);
            selectedItemContainer.append('img').attr("src", REMOVE_SMALL_ICON);

            $(selectedItemsSection).find("div[original-index='" + index + "']").click(function(){ EVTHANDLER.removeSelectedItemIconClicked(index); });
        }
        else{
            HEADER.removeItemFromListOfSelected(index);
        }
    };



    HEADER.removeItemFromListOfSelected = function(index) {
        $(selectedItemsSection).find("div[original-index='" + index + "']").remove();
    };



    HEADER.toggleHeader = function() {

        if(($(expandCollapseBtn).attr('expanded')).toBool()) {

            $(mainPanel).css('height', '94%');
            $(headerPanel).animate({'height': '3%'});
            $(headerTaskSection).find('span').slideUp();
            $(headerTaskSection).find('p').slideUp();
            $(messageSection).slideUp();
            $(selectedItemsSection).slideUp();
            $(expandCollapseBtn)
                .attr('expanded', 'false')
                .attr('src', ARROW_DOWN_ICON)
                .css('marginTop', '.2em');
        }
        else{
            $(mainPanel).css('height', '81%');
            $(headerPanel).animate({'height': '16%'});

            $(headerTaskSection).find('span').slideDown();
            $(headerTaskSection).find('p').slideDown();
            $(messageSection).css('display', 'block');
            $(selectedItemsSection).css('display', 'block');

            $(expandCollapseBtn)
                .attr('expanded', 'true')
                .attr('src', ARROW_UP_ICON)
                .css('marginTop', '.3em');
        }
    };



    HEADER.finishTask = function(){

        if(HEADER.internal.validateFinishedTask()){
            var elapsedTime = parseInt($.now() - startTime).toTime();
            console.log(elapsedTime);

            var selectedItems = [];
            $(selectedItemsClass).each(function(i, item){
                var index = $(item).attr('original-index');
                var datumToSave = data[index];
                datumToSave['original-index'] = index;
                selectedItems.push(datumToSave);
            });

            var obj = {
                'dataset-id': dataset['dataset-id'],
                'description': dataset['description'],
                'tool-aided': dataset['tool-aided'],
                'time': elapsedTime,
                'selected-items': selectedItems
            };

            console.log(obj);
        }
    };



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var EVTHANDLER = {};



    EVTHANDLER.canvasResized = function(){
        VISPANEL.resizeRanking();
    };

    ////////	radio button clicked	////////

    EVTHANDLER.radioScoreClicked = function( value ){

        $('input[value=\"' + value + '\"]').prop('checked', true);
        rankingCriteria = value;
        if(dataRanking.length > 0){
            LIST.rankRecommendations();
        }
    };

    ////////	Rank button clicked (by overall or max score)	////////

    EVTHANDLER.rankButtonClicked = function(sender){
        rankingCriteria = $(sender).attr('sort-by');
        console.log($(sender));
        console.log('criteria = ' + rankingCriteria);
        if(dataRanking.length > 0)
            LIST.rankRecommendations();
    };



    ////////	Reset Button Click	////////

	EVTHANDLER.btnResetClicked = function(){
        TAGCLOUD.clearTagbox();
        TAGCLOUD.buildTagCloud();
        LIST.resetContentList();
		VISPANEL.resetRanking();
	};



	////////	content list item click	////////

	EVTHANDLER.listItemClicked = function(d, i){
        LIST.selectListItem(i);
	};



	////////	Delete tag click	////////

	EVTHANDLER.deleteTagClicked = function(tag){
		TAGCLOUD.deleteTagInBox( tag );
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
        var index = (typeof dataRanking !== 'undefined' && dataRanking.length > 0) ? dataRanking[i].originalIndex :  i;
        HEADER.addItemToListOfSelected(index);
        LIST.switchFaviconOnOrOff(index);
    };


    EVTHANDLER.removeSelectedItemIconClicked = function(index) {
        HEADER.removeItemFromListOfSelected(index);
        LIST.switchFaviconOnOrOff(index);
    };


    EVTHANDLER.expandCollapseBtnClicked = function(){
        HEADER.toggleHeader();
    };


    EVTHANDLER.btnFinishedClicked = function(){
      HEADER.finishTask();
    };



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var BEHAVIOR = {};


	BEHAVIOR.draggableOptions = {
			revert: 'invalid',
			helper: 'clone',
			appendTo: tagBox,
			start: EVTHANDLER.dragStarted,
			stop: EVTHANDLER.dragStopped
		};


	BEHAVIOR.droppableOptions = {
			tolerance: 'touch',
			drop: EVTHANDLER.dropped
		};


	BEHAVIOR.sliderOptions = {
			orientation: 'horizontal',
			animate: true,
			range: "min",
			min: 0,
			max: 1,
            step: 0.2,
			value: 0.6,
			slide: EVTHANDLER.slideSlided,
			stop: EVTHANDLER.slideStopped
		};




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var TAGCLOUD = {};

	/**
	 * Clear tag box when reseting the template
	 * */
	TAGCLOUD.clearTagbox = function(){
		$(tagBox).empty();
		$('<p></p>').appendTo($(tagBox)).text(STR_DROP_TAGS_HERE);
		selectedTags = [];
	};


	/**
	 * Append one tag per keyword and add drag & drop behavior
	 *
	 * */
	TAGCLOUD.buildTagCloud = function(){
		// Empty tag container
        $(tagContainer).empty();
		// Append one div per tag
		d3.select(tagContainer).selectAll( tagClass )
			.data(keywords)
			.enter()
			.append( "div" )
				.attr( "class", "eexcess_keyword_tag" )
				.attr( "id", function(k, i){ return "tag-"+i; })
                .attr('tag-pos', function(k, i){ return i; })
                .style( "background", function(k){ return getGradientString(tagColorScale(k.colorCategory+1), [1, 0.7, 1]); })
				.text( function(k){ return k.term; })
				.on( "mouseover", function(){
                    d3.select(this)
                        .style( "background", function(k){ return getGradientString("#0066ff", [1, 0.8, 1]); })
                        .style("color", "#eee");
                })
				.on( "mouseout", function(){
                    d3.select(this)
                        .style( "background", function(k){ return getGradientString(tagColorScale(k.colorCategory+1), [1, 0.7, 1]); })
                        .style("color", "#111");
                });

		// bind drag behavior to each tag
		$(tagClass).draggable( BEHAVIOR.draggableOptions );

        // bind droppable behavior to tag box
		$(tagBox).droppable( BEHAVIOR.droppableOptions );
	};



	TAGCLOUD.dropTagInTagBox = function( tag ){
		// Set tag box legend
		$(tagBox).find('p').remove();

		if (tag.hasClass("eexcess_keyword_tag")) {
			selectedTags.push(tag);
			TAGCLOUD.buildDroppedTag(tag);
		}
	};


	/**
	 * Re-build tag dropped in tag box, add slider and delete icon
	 *
	 * */
	TAGCLOUD.buildDroppedTag = function( tag ){

		// Append dragged tag onto tag box
		$( tagBox ).append( tag );

		// Change tag's class
		tag.removeClass( "eexcess_keyword_tag" ).addClass( "eexcess_keyword_tag_in_box" );

        // Append "delete" icon to tag and bind event handler
        $("<img class=\"eexcess_tag_img\" src=\"" + DELETE_ICON_IMG + "\" />").appendTo(tag)
            .click(function(){ EVTHANDLER.deleteTagClicked(tag); });

        /*
        var indexHist = $(".div-histogram").length;
        d3.select(tag[0]).append("div").attr("class", "div-histogram").attr('id', 'histogram-' + indexHist);
        */

        // Add new div to make it a slider
        $("<div class='div-slider'></div>").appendTo(tag).slider( BEHAVIOR.sliderOptions );

        // Retrieve color in weightColorScale for the corresponding label
        // Create weight slider
		var label = $(tag).text();
        var aux = weightColorScale(label);
        var rgbSequence = hexToR(aux) + ', ' + hexToG(aux) + ', ' + hexToB(aux);

		// Set tag's style
		d3.select(tag[0])
            .style("background", function(){ return "rgba("+ rgbSequence + ", 0.6)"; })
            .style("color", "")
            .style("border", "solid 0.2em " + aux)
            .on("mouseover", function(){})
			.on("mouseout", function(){});

        // Reset the draggability
        tag.draggable('destroy');

	};



	/**
	 *	Adjust opacity of the tag when the weightslider is changed
	 *
	 * */
	TAGCLOUD.changeKeywordInBoxWeight = function( keywordSlider, ui ){

        var tag = keywordSlider.parentNode;
        var label = d3.select(tag).text();
        var aux = weightColorScale(label);
        var rgbSequence = hexToR(aux) + ', ' + hexToG(aux) + ', ' + hexToB(aux);

		d3.select(tag).style("background", "rgba("+ rgbSequence + "," + ui.value + ")");
	};




	/**
	 *	Actions executed when the event corresponding to deleting a tag in the tag box is triggered, including detaching it from the tag box,
	 *  re-building the tag cloud, updating the "selectedTags" array, which stores the DOM elements for each tag in the box
	 *
	 * */
	TAGCLOUD.deleteTagInBox = function(tag){

		TAGCLOUD.restoreTagFromBoxToCloud(tag[0]);

		var index = 0;
		while( index < selectedTags.length && tag[0] != selectedTags[index][0] )
			index++;
		selectedTags.splice(index, 1);

        // update weightColorScale domain to adjust tag colors
        TAGCLOUD.updateTagColor();

		if( selectedTags.length == 0 ){
			$('<p></p>').appendTo($(tagBox)).text(STR_DROP_TAGS_HERE);
			LIST.resetContentList();
            VISPANEL.resetRanking();
		}
		else{
			LIST.rankRecommendations();
		}
	};



	/**
	 *	Detach tag from tag box and return it to container (tag cloud)
	 *
	 * */
	TAGCLOUD.restoreTagFromBoxToCloud = function(tag){

        // Remove from tag box
		$(tag).detach();
		$(tag).children().remove();					// delete icon and slider removed

        // Change class
        $(tag).removeClass("eexcess_keyword_tag_in_box").addClass("eexcess_keyword_tag");

        // Re-append to tag container, in the corresponding postion
        var tagIndex = parseInt($(tag).attr('tag-pos'));
        var i = tagIndex - 1;
        var firstTagIndex = $(tagContainer).find(tagClass + ':eq(0)').attr('tag-pos');

        while(i >= firstTagIndex && $.isEmptyObject($(tagContainer).find(tagId + '' + i)) )
            --i;

        if(i >= firstTagIndex)    // The current tag should be inserted after another (tag-pos == i)
            $(tagId + '' + i).after(tag);
        else                      // The current tag is inserted in the first position of tag container
            $(tagContainer).prepend(tag);

        // Restore style
        d3.select(tag)
            .style("background", function(k){ return tagColorScale(k.colorCategory+1); })
            .style("border", "");

		$(tag).draggable(BEHAVIOR.draggableOptions);
	};



    TAGCLOUD.updateTagColor = function(){

        // Clear color scale domain
        weightColorScale.domain([]);

       // var tags = $( tagClassInBox );

        for(var i = 0; i < selectedTags.length; i++){
            // Reasign keyword to color scale domain
            var label = d3.select(selectedTags[i][0]).text();
            var aux = weightColorScale(label);
            var rgbSequence = hexToR(aux) + "," + hexToG(aux) + "," + hexToB(aux);
            var value = $(selectedTags[i][0]).find(".div-slider").slider("value");

            d3.select(selectedTags[i][0])
                .style("background", "rgba("+ rgbSequence + ", " + value + ")")
                .style("border", "solid 0.2em " + aux);
        }

    };



	/**
	 *	Retrieves the selected keywords (in tag box) and the weight assigned by the user
	 *	@return array. Each item is an object containing 'term' and 'weight'
	 * */
	TAGCLOUD.getWeightedKeywordsInBox = function() {

		var  weightedKeywords = [];
        $(tagClassInBox).each(function(i, tag){
            var term = d3.select(tag).data()[0].term;
			var weight = parseFloat( $(tag).find(".div-slider").slider("value") / 10);
			weightedKeywords.push({ 'term': term, 'weight': weight });
        });
		return weightedKeywords;
	}





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var LIST = {};

	LIST.internal = {

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

        getActualIndex : function(index){
            if(dataRanking.length == 0)
                return index;
            return dataRanking[index].originalIndex;
        },


        /**
         *	Creates the ranking items with default values and calculates the weighted score for each selected keyword (tags in tag box)
         *
         * */
        updateRanking: function(){
            dataRanking = [];
            data.forEach(function(d, i) {
                dataRanking.push({
                    'originalIndex': i,
                    'rankingPos': 0,
                    'overallScore': 0,
                    'maxScore' : 0,
                    'positionsChanged': 1000,
                    'weightedKeywords': new Array()
                });

                var keywordsInBox = TAGCLOUD.getWeightedKeywordsInBox();
                var max = 0;
                keywordsInBox.forEach(function( wk, j ) {
                    var index = d.keywords.getIndexOf( wk.term, 'term' );

                    if(index !== -1){
                        var score = parseFloat( d.keywords[index].score ) *  parseFloat( wk.weight );
                        if(score > max)
                            max = score;

                        dataRanking[i].overallScore = parseFloat( dataRanking[i].overallScore ) + score;
                        dataRanking[i].maxScore = max;
                        dataRanking[i].weightedKeywords.push({ 'term': wk.term, 'weightedScore': score });
                    }
                    else{
                        dataRanking[i].weightedKeywords.push({ 'term': wk.term, 'weightedScore': 0, 'maxScore': 0 });
                    }
                });
            });
        },


        /**
         *	Sorts the dataRanking array by overall score, using the quicksort algorithm
         *
         * */
        sortRanking: function(array){

            var attr = (rankingCriteria == 'overall_score') ? 'overallScore' : 'maxScore';
            quicksort(array);
            assignRankingPosition(array);

            function quicksort(array){
                qsort(array, 0, array.length);
            }

            function qsort(array, begin, end) {
                if(end-1 > begin) {
                    var pivot = begin +  Math.floor((end - begin) / 2); //begin + Math.floor(Math.random() * (end - begin));
                    pivot = partition(array, begin, end, pivot);
                    qsort(array, begin, pivot);
                    qsort(array, pivot+1, end);
                }
            }

            function partition(array, begin, end, pivot) {
                var piv = array[pivot];
                array.swap(pivot, end-1);
                var store = begin;
                var ix;
                for(ix = begin; ix < end-1; ++ix) {
                    //if(array[ix].overallScore >= piv.overallScore) {
                    if(array[ix][attr] >= piv[attr]) {
                        array.swap(store, ix);
                        ++store;
                    }
                }
                array.swap(end-1, store);
                return store;
            }

            function assignRankingPosition(array){
                var currentScore = Number.MAX_VALUE;
                var currentPos = 1;
                var itemsInCurrentPos = 0;
                array.forEach(function(d, i){
                    if(d[attr] > 0){
                        if( d[attr] < currentScore ){
                            currentPos = currentPos + itemsInCurrentPos;
                            d.rankingPos = currentPos;
                            currentScore = d[attr];
                            itemsInCurrentPos = 1;
                        }
                        else{
                            d.rankingPos = currentPos;
                            itemsInCurrentPos++;
                        }
                    }
                    else{
                        d.rankingPos = 0;
                    }
                });
            }
        },


        /**
         *	Calculates the number of positions changed by each recommendations, basing on the array "previousRanking"
         *	If there doesn't exist a previous ranking or a recommendation wasn't previously ranked, then the value 1000 is assigned
         *
         * */
        extendRankingWithPositionsChanged: function(previousRanking){

            dataRanking.forEach(function(d, i){

                if(typeof previousRanking === 'undefined' || previousRanking.length == 0){
                    d['positionsChanged'] = 1000;
                }
                else{
                    var originalIndex = d['originalIndex'];
                    var currentRankingPos = d['rankingPos'];
                    var j = 0;
                    while( j < previousRanking.length  &&  previousRanking[j].originalIndex !== d['originalIndex'] )
                        j++;

                    if( previousRanking[j].rankingPos === 0 )
                        d['positionsChanged'] = 1000;
                    else
                        d['positionsChanged'] = previousRanking[j]['rankingPos'] - d['rankingPos'];
                }
            });
        },


        /**
         *	Calculates the number of positions changed by each recommendations, basing on the array "previousRanking"
         *	If there doesn't exist a previous ranking or a recommendation wasn't previously ranked, then the value 1000 is assigned
         *
         * */
        hasRankingChanged: function(previousRanking) {

            if( typeof previousRanking === 'undefined' || previousRanking === 'undefined' || previousRanking.length === 0)
                return false;

            if(dataRanking.length != previousRanking.length)
                return true;

            for(var i = 0; i < dataRanking.length; i++){
                var j = 0;
                while(dataRanking[i]['originalIndex'] !== previousRanking[j]['originalIndex'] )
                    j++;

                if(dataRanking[i]['rankingPos'] !== previousRanking[j]['rankingPos'] )
                    return false;
            }
	       return true;
        }

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

		//d3.selectAll(".eexcess_ritem").remove();
		d3.selectAll( allListItems ).remove();

		var content = d3.select(contentList).selectAll("li").data(data);

		var aListItem = content.enter()
							.append("li")
								.attr("class", "eexcess_list")
								.attr("id", function(d, i){ return "data-pos-"+i; });

        var rankingDiv = aListItem.append('div')
            .attr("class", "eexcess_ranking_container");


		// div 2 wraps the recommendation title (as a link), a short description and a large description (not used yet)
		var contentDiv = aListItem.append("div")
			.attr("class", "eexcess_ritem_container");

		contentDiv.append("h3")
				.append("a")
					.attr("class", "eexcess_ritem_title")
                    .attr("href", "#")
                    .on("click", function(d){ window.open(d.uri, '_blank'); })
					.html(function(d){
                        if(d.title.length > 60) return d.title.substring(0, 56) + '...'; return d.title;
                    });

        // fav icon section on the right
        aListItem.append('div')
            .attr('class', 'eexcess_favicon_section')
            .append("img")
                .attr('title', 'Mark as relevant')
                .attr("src", FAV_ICON_OFF);

        LIST.updateItemsBackground();
        LIST.bindEventHandlersToItems();
		$(contentPanel).scrollTo("top");
	};



    LIST.bindEventHandlersToItems = function(){

        // Event for item clicked
        d3.selectAll(allListItems)
            .on("click", function(d, i){ EVTHANDLER.listItemClicked(d, i); })
            .select(favIconClass).select('img').on("click", function(d, i){ EVTHANDLER.faviconClicked(d, i);});

        /*
        $(allListItems).each(function(i, item){
            $(item).on("click", function(){

            });
        });
        */
    };




	/**
	 * Wraping function that calls a sequence of methods to create a ranking of recommendations and display it
	 *
	 * */
	LIST.rankRecommendations = function() {

        var previousRanking = dataRanking || [];
		// Recalculates scores and positions, sorts the dataRanking array and extends it with #positionsChanged
		this.internal.updateRanking();
		this.internal.sortRanking(dataRanking);
		this.internal.extendRankingWithPositionsChanged(previousRanking);
        this.highlightListItems();
        this.stopAnimation();
        var isRankingChanged = LIST.internal.hasRankingChanged(previousRanking);

		// Synchronizes rendering methods
		if(!isRankingChanged){
			this.sortContentList();
			this.addRankingPositions(previousRanking);
			this.hideUnrankedItems();
			this.animateRanking();
            this.updateItemsBackground();
		}
		VISPANEL.drawRanking(isRankingChanged);
	};



	/**
	 * Stop the list movement and restores default style
	 *
	 * */
	LIST.stopAnimation = function(){
		$( ".eexcess_list" ).stop(true, true);
		$( allListItems )
			.removeClass("eexcess_list_moving_up")
			.removeClass("eexcess_list_moving_down")
			.removeClass("eexcess_list_not_moving");
	};



    /**
	 * Reorganizes list <li> items according to the calculated ranking
	 *
	 * */
	LIST.sortContentList = function(){

		var liHtml = new Array();

		dataRanking.forEach(function(d, i){
			var current = $( listItem + "" + d.originalIndex );
			var outer = $(current).outerHTML();
			liHtml.push( outer );
			current.remove();
		});

		var oldHtml = "";
		for(var j = liHtml.length-1; j >= 0; j--){
			$(contentList).html(liHtml[j] + "" + oldHtml);
			oldHtml = $(contentList).html();
		}

		// Re-binds on click event to list item. Removing and re-appending DOM elements destroy the bounds to event handlers
		//d3.selectAll( allListItems ).on("click", EVTHANDLER.listItemClicked);
        LIST.bindEventHandlersToItems();
		LIST.selectededListIndex = STR_NO_INDEX;

	};



	/**
	 * Appends a yellow circle indicating the ranking position and a colored legend stating #positionsChanged
	 *
	 * */
	LIST.addRankingPositions = function( previousRanking ) {

		$( rankingContainerClass ).empty();

		dataRanking.forEach(function(d, i){
			if( d.overallScore > 0 ){
				var color = d.positionsChanged > 0 ? "rgba(0, 200, 0, 0.8)" : ( d.positionsChanged < 0 ? "rgba(250, 0, 0, 0.8)" : "rgba(128, 128, 128, 0.8)" );

				var divRanking = d3.select( listItem + "" + d.originalIndex ).select(rankingContainerClass);

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
	 * Calculate which items should be highlighted
	 *
	 * */
	LIST.hideUnrankedItems = function(){
        dataRanking.forEach(function(d){
            if(d.rankingPos == 0)
                $(listItem + '' + d.originalIndex).css('display', 'none');
            else
                $(listItem + '' + d.originalIndex).css('display', '');
        });
	};



	/**
	 * Handles the visual effects when the ranking is updated.
	 * Generates accordion-like animation for ranked items and style effects
	 *
	 * */
	LIST.animateRanking = function() {

        var delay = 4000;
        dataRanking.forEach(function(d, i){
            var item = $(listItem +""+ d.originalIndex);

            if( d.overallScore > 0 ){
                var shift = i * 5;//parseFloat( 50 + i*10 );
                var duration = 500 + 50 * i;
                var movingClass = (d.positionsChanged > 0) ? "eexcess_list_moving_up" : ( (d.positionsChanged < 0) ? "eexcess_list_moving_down" : "eexcess_list_not_moving" );

                item.addClass(movingClass);
                item.animate({'top': shift}, {
                    'complete': function(){
                        $(this).animate({"top": 0}, duration, "swing" );
                    }
                });
            }
        });

        setTimeout(function(){
            $( allListItems )
                .removeClass("eexcess_list_moving_up")
                .removeClass("eexcess_list_moving_down")
                .removeClass("eexcess_list_not_moving");
        }, delay);
	};


    /**
     * Description
     */
    LIST.updateItemsBackground = function(){
        $(allListItems).removeClass('light_background').removeClass('dark_background');
        $(allListItems).each(function(i, item){
            if(i%2 == 0)
                $(item).addClass('light_background');
            else
                $(item).addClass('dark_background');
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
            var actualIndex = LIST.internal.getActualIndex(i);
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
            $(allListItems).css("opacity", "0.2");
            $(listItem + "" + index).css("opacity", "1");
        }
		else{
            $(allListItems).css("opacity", "1");
        }
	};


	/**
	 * Restores content list to its original state
	 *
	 * */
	LIST.resetContentList = function(){
		LIST.stopAnimation();

		var liHtml = new Array();
		data.forEach(function(d, i){
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

		// Delete ranking related icons
		$(rankingContainerClass).empty();

        LIST.highlightListItems();
        LIST.updateItemsBackground();
        LIST.bindEventHandlersToItems();
		dataRanking = [];
	};



    LIST.switchFaviconOnOrOff = function(index){

        data[index].isSelected = !data[index].isSelected;
        var faviconToSwitch = (data[index].isSelected) ? FAV_ICON_ON : FAV_ICON_OFF;

        d3.select(listItem + '' +index).select(favIconClass).select('img')
            .transition().attr("src", faviconToSwitch).duration(2000);
    };



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var VISPANEL = {};

	VISPANEL.drawRanking = function(isRankingChanged){
        rankingVis.draw(dataRanking, data, weightColorScale, rankingCriteria, isRankingChanged);
	};

    VISPANEL.resetRanking = function(){
        weightColorScale.domain([]);
        rankingVis.reset();
    };

    VISPANEL.selectItemInRanking = function(actualIndex){
        rankingVis.selectItem(actualIndex);
    };

    VISPANEL.resizeRanking = function(){
        rankingVis.resize();
    };



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var DOCPANEL = {};


    DOCPANEL.showDocument = function(index){
        $(documentViewer).find('p').text(data[index].description);
    };


    DOCPANEL.clear = function(){
        $(documentViewer).find('p').empty();
    };




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * 	Initizialization function called from starter.js
     *
     * */
    this.init = function(){

        dataset = JSON.parse($("#dataset").text());
        console.log(dataset);

        PREPROCESSING.bindEventHandlers();
        rankingVis = new RankingVis(root, width, height, self);

        data = dataset['data'];													// contains the data to be visualized
        query = dataset['query'];													// string representing the query that triggered the current recommendations
		keywords = dataset['keywords'];
        message = dataset['text'];
        task = dataset['task'];
        dataRanking = [];
		indicesToHighlight = [];

        PREPROCESSING.extendDataWithAncillaryDetails();
		PREPROCESSING.extendKeywordsWithColorCategory();
        HEADER.showInfoInHeader();
        LIST.buildContentList();

        if(dataset['tool-aided'] == 'yes'){
            // Initialize template's elements
            TAGCLOUD.clearTagbox();
            TAGCLOUD.buildTagCloud();
            //VISPANEL.drawRanking();
        }
        else{
            $("#eexcess_vis").css('display', 'none');
            $(contentPanel).css('float', 'none');
        }

        startTime = $.now();
    };





//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	///////////// External call triggered by rankingvis

	this.ListItemSelected = function(i){
        LIST.selectListItem(i, true);
	};



}
