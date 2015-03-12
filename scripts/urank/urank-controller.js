
var Urank = (function(){

    var s = {};
    var rankingModel;
    var contentList, tagCloud, tagBox, visCanvas, docViewer;

    // Color scales
    var tagColorRange = colorbrewer.Blues[TAG_CATEGORIES + 1];
    tagColorRange.splice(tagColorRange.indexOf("#08519c"), 1, "#2171b5");
    var queryTermColorRange = colorbrewer.Set1[9];
    queryTermColorRange.splice(weightColorRange.indexOf("#ffff33"), 1, "#ffd700");
    var tagColorScale, queryTermColorScale;
    // NLP
    var stemmer = natural.PorterStemmer;
    var nounInflector = new natural.NounInflector();
    stemmer.attach();
    nounInflector.attach();



    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    highlightKeywordsInText : function(text, isTitle){
        var textWithKeywords = isTitle ? '' : '<p>',
            word = "";
        var keywordsInBox = TAGCLOUD.getWeightedKeywordsInBox();
        text.split('').forEach(function(c){
            if(c.match(/\w/)){
                word += c;
            }
            else if(c == '\n'){
                textWithKeywords += '</p><p>'
            }
            else {
                if(word != '')
                    word = DOCPANEL.internal.getStyledWord(word, keywordsInBox);
                textWithKeywords += word + c;
                word = "";
            }
        });
        if(word != "")
            textWithKeywords += this.getStyledWord(word, keywordsInBox);
        if(!isTitle)
            textWithKeywords +='</p>';

        return textWithKeywords;
    },


        getStyledWord : function(word, keywordsInBox){
            var trickyWords = ['it', 'is', 'us', 'ar'];
            //var wordStem = word.replace(/our$/, 'or').stem();
            var word = word.replace(/our$/, 'or');

            // First clause solves words like 'IT', second clause that the stem of the doc term (or the singularized term) matches the keyword stem
            if(trickyWords.indexOf(word.stem()) == -1 || word.isAllUpperCase()) {
                var kIndex = keywordsInBox.getObjectIndex(function(k){ return (k.stem === word.stem() || k.stem === word.singularizeNoun().stem()); });
                if(kIndex > -1){
                    return "<strong style=\"color:" + weightColorScale(keywordsInBox[kIndex].stem) + "\">" + word + "</strong>";
                }

            }
            return word;
        }











    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var EVTHANDLER = {

        update: function(selectedKeywords) {




            if( selectedTags.length == 0 ){
                $('<p></p>').appendTo($(s.root)).text(STR_DROP_TAGS_HERE);
                LIST.resetContentList();
                VISPANEL.resetRanking();
            }
            else{
                LIST.rankRecommendations();
            }

        },
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















    function Urank(arguments) {

        s = $.extend({
            tagCloudRoot: '',
            tagBoxRoot: '',
            contentListRoot: '',
            visCanvasRoot: '',
            docViewerRoot: '',
            tagColorArray: tagColorRange,
            queryTermColorArray: queryTermColorRange
        }, arguments);

        // Set color scales
        tagColorScale = d3.scale.ordinal().domain(d3.range(0, TAG_CATEGORIES, 1)).range(s.tagColorArray);
        queryTermColorScale = d3.scale.ordinal().range(s.queryTermColorArray);

        var options = {
            contentList: {
                root: s.contentListRoot,
                colorScale: queryTermColorRange,
                onListItemClicked: EVTHANDLER.onItemClicked,
                onListItemHovered: EVTHANDLER.onItemHovered,
                onListItemUnhovered: EVTHANDLER.onItemUnhovered,
                onFaviconClicked: EVTHANDLER.onFaviconClicked,
                onWatchiconClicked: EVTHANDLER.onWatchiconClicked,
                getTextWithKeywordsHighlighted: function(text){ return text; }
            },

            tagCloud: {
                root: s.tagCloudRoot,
                colorScale: tagColorScale,
                dropIn: s.tagBoxRoot,
                onTagInCloudHovered: function(index){},
                onTagInCloudUnhovered: function(index){}
            },

            tagBox: {
                root: s.tagBoxRoot,
                colorScale: queryTermColorScale,
                //droppableClass: 'urank-tagcloud-tag',
                onChange: function(selectedKeywords, colorscale){},
                onTagDeleted: function(index){}
            },

            visCanvas: {
                root: s.visCanvasRoot,
                //visModule: VIS_MODULES.ranking,
                onItemClicked: EVTHANDLER.onItemClicked,
                onItemHovered: EVTHANDLER.onItemHovered,
                onItemUnhovered: EVTHANDLER.onItemUnhovered
            },

            docViewer: {
                root: s.docViewerRoot,
                getTextWithKeywordsHighlighted: function(text){ return text; }
            }
        };


        contentList = new ContentList(options.contentList);
        tagCloud = new TagCloud(options.tagCloud);
        tagBox = new TagBox(options.tagBox);
        visCanvas = new VisCanvas(options.visCanvas);
        docViewer = new DocViewer(options.docViewer);
    }



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function extendDataWithAncillaryDetails(data){

        data.forEach(function(d){
            d['isSelected'] = false;
        });
    };



    function extendKeywordsWithColorCategory(keywords){

        var extent = d3.extent(keywords, function(k){ return k['repeated']; });
        var range = (extent[1] - 1) * 0.1;   // / TAG_CATEGORIES;

        keywords.forEach(function(k){
            var colorCategory = parseInt((k['repeated'] - 1/*extent[0]*/) / range);
            k['colorCategory'] = (colorCategory < TAG_CATEGORIES) ? colorCategory : TAG_CATEGORIES - 1;
        });
    };





    var _loadData = function(data) {
        var arguments = {
            minRepetitions : (parseInt(data.length * 0.05) > 1) ? parseInt(data.length * 0.05) : 2
        };

        var keywordExtractor = new KeywordExtractor(arguments);

        data.forEach(function(d){
            d.title = d.title.clean();
            d.description = d.description.clean();
            var document = (d.description) ? d.title +'. '+ d.description : d.title;
            keywordExtractor.addDocument(document.removeUnnecessaryChars());
        });

        keywordExtractor.processCollection();

        data.forEach(function(d, i){
            d.keywords = keywordExtractor.listDocumentKeywords(i);
        });
        this.data = data;
        var keywords = keywordExtractor.getCollectionKeywords();
        this.keywords = extendKeywordsWithColorCategory(keywords);

        rankingModel = new RankingModel(this.data);
        //rankingVis = new RankingVis(s.visPanelRoot, this);   in visCanvas
    };







    Urank.prototype = {
        loadData: _loadData

    }



})();




















