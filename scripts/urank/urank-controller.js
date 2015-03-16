
var Urank = (function(){

    var s = {};
    var rankingModel;
    var contentList, tagCloud, tagBox, visCanvas, docViewer;

    // Color scales
    var tagColorRange = colorbrewer.Blues[TAG_CATEGORIES + 1];
    tagColorRange.splice(tagColorRange.indexOf("#08519c"), 1, "#2171b5");
    var queryTermColorRange = colorbrewer.Set1[9];
    queryTermColorRange.splice(queryTermColorRange.indexOf("#ffff33"), 1, "#ffd700");


    var _this;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var EVTHANDLER = {

        onLoad: function(data, keywords) {
            contentList.build(data);
            tagCloud.build(keywords);
            tagBox.build();
            visCanvas.build();
            docViewer.build();
        },
        onChange: function(selectedKeywords, newQueryTermColorScale) {

            _this.selectedKeywords = selectedKeywords;
            _this.queryTermColorScale = newQueryTermColorScale;

            if(selectedKeywords.length > 0) {
                rankingModel.update(selectedKeywords, _this.rankingMode);
                var rankingData = rankingModel.getRanking();
                var status = rankingModel.getStatus();
                contentList.update(rankingData, status, _this.selectedKeywords, _this.queryTermColorScale);
                visCanvas.update(rankingModel, $(s.contentListRoot).height(), _this.queryTermColorScale);
            }
            else{
                rankingModel.reset();
                tagBox.clear();
                contentList.reset();
                visCanvas.reset();
            }
            docViewer.clear();
        },
        onTagInCloudMouseEnter: function(index) {
            tagCloud.hoverTag(index);
        },
        onTagInCloudMouseLeave: function(index) {
            tagCloud.unhoverTag(index);
        },
        onTagInCloudClick: function(index) {
            // TODO
        },
        onTagDeleted: function(index) {
            tagCloud.restoreTag(index);
            //EVTHANDLER.onChange.call(this, selectedKeywords, newQueryTermColorScale);
        },
        onTagInBoxMouseEnter: function(index) {
            // TODO
        },
        onTagInBoxMouseLeave: function(index) {
            // TODO
        },
        onTagInBoxClick: function(index) {
            // TODO
        },
        onItemClicked : function(document, index) {
            contentList.highlightListItem(index);
            visCanvas.selectItem(index);
            docViewer.showDocument(document);
        },
        onItemHovered: function(document, index) {
            contentList.hover(index);
            visCanvas.hoverItem(index);
        },
        onItemUnhovered: function(document, index) {
            contentList.unhover(index);
            visCanvas.unhoverItem(index);
        },
        onFaviconClicked: function(index){
            this.data[i].isSelected = ! this.data[index].isSelected;         //CHECK
            contentList.switchFaviconOnOrOff(index);
        },
        onWatchiconClicked: function(i) {
            contentList.watchOrUnwatchListItem(d, i);
        },
        // Event handlers to return
        onRankByOverallScore: function() {
            _this.rankingMode = RANKING_MODE.overall_score;
            EVTHANDLER.onChange(tagBox.getKeywordsInBox(), _this.queryTermColorScale);
        },
        onRankByMaximumScore: function() {
            _this.rankingMode = RANKING_MODE.max_score;
            EVTHANDLER.onChange(tagBox.getKeywordsInBox(), _this.queryTermColorScale);
        },
        onReset: function() {
            rankingModel.reset();
            contentList.reset();
            tagCloud.reset();
            tagBox.clear();
            visCanvas.reset();
            docViewer.clear();
        },
        onResize: function() {
            visCanvas.resize();
        }
    };



    // Constructor
    function Urank(arguments) {

        _this = this;
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
                onListItemClicked: EVTHANDLER.onItemClicked,
                onListItemHovered: EVTHANDLER.onItemHovered,
                onListItemUnhovered: EVTHANDLER.onItemUnhovered,
                onFaviconClicked: EVTHANDLER.onFaviconClicked,
                onWatchiconClicked: EVTHANDLER.onWatchiconClicked
            },

            tagCloud: {
                root: s.tagCloudRoot,
                colorScale: this.tagColorScale,
                dropIn: s.tagBoxRoot,
                onTagInCloudMouseEnter: EVTHANDLER.onTagInCloudMouseEnter,
                onTagInCloudMouseLeave: EVTHANDLER.onTagInCloudMouseLeave,
                onTagInCloudClick: EVTHANDLER.onTagInCloudClick
            },

            tagBox: {
                root: s.tagBoxRoot,
                colorScale: _this.queryTermColorScale,
                //droppableClass: 'urank-tagcloud-tag',
                onChange: EVTHANDLER.onChange,
                onTagDeleted: EVTHANDLER.onTagDeleted,
                onTagInBoxMouseEnter: EVTHANDLER.onTagInBoxMouseEnter,
                onTagInBoxMouseLeave: EVTHANDLER.onTagInBoxMouseLeave,
                onTagInBoxClick: EVTHANDLER.onTagInBoxClick
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
            }
        };

        contentList = new ContentList(options.contentList);
        tagCloud = new TagCloud(options.tagCloud);
        tagBox = new TagBox(options.tagBox);
        visCanvas = new VisCanvas(options.visCanvas);
        docViewer = new DocViewer(options.docViewer);
    }



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    function extendKeywordsWithColorCategory(keywords){

        var extent = d3.extent(keywords, function(k){ return k['repeated']; });
        var range = (extent[1] - 1) * 0.1;   // / TAG_CATEGORIES;

        keywords.forEach(function(k){
            var colorCategory = parseInt((k['repeated'] - 1/*extent[0]*/) / range);
            k['colorCategory'] = (colorCategory < TAG_CATEGORIES) ? colorCategory : TAG_CATEGORIES - 1;
        });
        return keywords;
    };


    var _loadData = function(data) {

        data = JSON.parse(data);
        var kwOptions = {
            minRepetitions : (parseInt(data.length * 0.05) > 1) ? parseInt(data.length * 0.05) : 2
        };

        var keywordExtractor = new KeywordExtractor(kwOptions);

        data.forEach(function(d){
            d.isSelected = false;
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

        EVTHANDLER.onLoad.call(this, this.data, this.keywords);
    };


    var _reset = function() {
        EVTHANDLER.onReset.call(this);
    };

    var _rankByOverallScore = function() {
        EVTHANDLER.onRankByOverallScore.call(this);
    };

    var _rankByMaximumScore = function() {
        EVTHANDLER.onRankByMaximumScore.call(this);
    };

    var _resize = function() {
        EVTHANDLER.onResize.call(this);
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




















