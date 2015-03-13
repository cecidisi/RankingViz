
var Urank = (function(){

    var s = {};
    var rankingModel;
    var contentList, tagCloud, tagBox, visCanvas, docViewer;

    // Color scales
    var tagColorRange = colorbrewer.Blues[TAG_CATEGORIES + 1];
    tagColorRange.splice(tagColorRange.indexOf("#08519c"), 1, "#2171b5");
    var queryTermColorRange = colorbrewer.Set1[9];
    queryTermColorRange.splice(weightColorRange.indexOf("#ffff33"), 1, "#ffd700");

    // NLP
    var stemmer = natural.PorterStemmer;
    var nounInflector = new natural.NounInflector();
    stemmer.attach();
    nounInflector.attach();

    var _this = this;


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var getStyledText = function(text){
        var textWithKeywords = '',
            word = '';
        var keywordsInBox = tagBox.getKeywordsInBox();
        text.split('').forEach(function(c){
            if(c.match(/\w/)){
                word += c;
            }
            else if(c == '\n'){
                textWithKeywords += '<br/>'
            }
            else {
                if(word != '')
                    word = getStyledWord(word, keywordsInBox);
                textWithKeywords += word + c;
                word = '';
            }
        });
        if(word != '')
            textWithKeywords += getStyledWord(word, keywordsInBox);
        return textWithKeywords;
    };


    var getStyledWord = function(word, keywordsInBox){
        var trickyWords = ['it', 'is', 'us', 'ar'];
        var word = word.replace(/our$/, 'or');
        // First clause solves words like 'IT', second clause that the stem of the doc term (or the singularized term) matches the keyword stem
        if(trickyWords.indexOf(word.stem()) == -1 || word.isAllUpperCase()) {
            if(_.findIndex(keywordsInBox, function(k){ return (k.stem === word.stem() || k.stem === word.singularizeNoun().stem()); })) {
                return "<strong style=\"color:" + weightColorScale(keywordsInBox[kIndex].stem) + "\">" + word + "</strong>";
            }
        }
        return word;
    };











    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var EVTHANDLER = {

        onLoad: function(data, keywords) {
            contentList.build(data);
            tagCloud.build(keywords);
            tagBox.build();
            visCanvas.build();
            docViewer.build();
        },
        onChange: function(selectedKeywords, newQueryTermColorScale) {

            _this.queryTermColorScale = newQueryTermColorScale;

            if(selectedKeywords.length > 0) {
                var rankingData = rankingModel.update(selectedKeywords, _this.rankingMode);
                contentList.undoHighlight();
                var status = rankingModel.getStatus();

                // Synchronizes rendering methods
                if(status == RANKING_STATUS.new || status == RANKING_STATUS.update){
                    contentList.formatTitles(rankingData);
                    contentList.showRankingPositions(rankingData);
                    contentList.hideListItems(rankingModel.getIndicesOfRankedItems());
                    contentList.updateLiBackground(rankingData);
                }
                contentList.animate(rankingData, status);
                docViewer.clear();
                visCanvas.update(rankingModel, $(s.contentListRoot).height(), _this.queryTermColorScale);
            }
            else{
                tagBox.clear();
                contentList.reset();
                visCanvas.reset();
            }
        },
        onTagDeleted: function(index) {
            tagCloud.restoreTag(index);
        },
        onItemClicked : function(index) {
            contentList.highlighListItem(index);
            // call vispanel.selectitem
            // call docviewer.showdocument
        },
        onItemHovered: function(index) {
            contentList.addHoverEffect(index);
            // call vispanel.hoveritem
        },
        onItemUnhovered: function(index) {
            contentList.removeHoverEffect(index);
            visCanvas.unhoverItem(index);
        },
        onFaviconClicked: function(index){
           // data[i].isSelected = !data[index].isSelected;         //CHECK
            contentList.switchFaviconOnOrOff(index);
        },
        onWatchiconClicked: function(i) {
            contentList.watchOrUnwatchListItem(d, i);
        }
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
        this.tagColorScale = d3.scale.ordinal().domain(d3.range(0, TAG_CATEGORIES, 1)).range(s.tagColorArray);
        this.queryTermColorScale = d3.scale.ordinal().range(s.queryTermColorArray);

        var options = {
            contentList: {
                root: s.contentListRoot,
                originalData: _this.data,
                colorScale: _this.queryTermColorRange,
                onListItemClicked: EVTHANDLER.onItemClicked,
                onListItemHovered: EVTHANDLER.onItemHovered,
                onListItemUnhovered: EVTHANDLER.onItemUnhovered,
                onFaviconClicked: EVTHANDLER.onFaviconClicked,
                onWatchiconClicked: EVTHANDLER.onWatchiconClicked,
                getTextWithKeywordsHighlighted: function(text){ return text; }
            },

            tagCloud: {
                root: s.tagCloudRoot,
                colorScale: this.tagColorScale,
                dropIn: s.tagBoxRoot,
                onTagInCloudHovered: function(index){},
                onTagInCloudUnhovered: function(index){}
            },

            tagBox: {
                root: s.tagBoxRoot,
                colorScale: _this.queryTermColorScale,
                //droppableClass: 'urank-tagcloud-tag',
                onChange: EVTHANDLER.onChange,
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
        var kwOptions = {
            minRepetitions : (parseInt(data.length * 0.05) > 1) ? parseInt(data.length * 0.05) : 2
        };

        var keywordExtractor = new KeywordExtractor(kwOptions);

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
        this.rankingMode = RANKING_MODE.overall_score;

        rankingModel = new RankingModel(this.data);

        EVTHANDLER.onLoad(this.data, this.keywords);
    };


    var _reset = function() {
        contentList.reset(this.data);
        tagCloud.build(this.keywords);
        tagBox.clear();
        visCanvas.reset();
        docViewer.clear();
    };

    var _rankByOverallScore = function() {
        this.rankingMode = RANKING_MODE.overall_score;
        EVTHANDLER.onChange.call(this, tagBox.getKeywordsInBox(), this.queryTermColorScale);
    };

    var _rankByMaximumScore: function() {
        this.rankingMode = RANKING_MODE.max_score;
        EVTHANDLER.onChange.call(this, tagBox.getKeywordsInBox(), this.queryTermColorScale);
    };

    var _resize: function() {
        visCanvas.resize();
    };


    Urank.prototype = {
        loadData: _loadData,
        reset: _reset,
        rankByOverallScore: _rankByOverallScore,
        rankByMaximumScore: _rankByMaximumScore,
        resize: _resize
    };

    return Urank;
})();




















