
function Ranking(arguments){

    var s = $.extend({
        root: '.urank-viscanvas-container',
        onItemClicked: function(document, index){},
        onItemHovered: function(document, index){},
        onItemUnhovered: function(document, index){}
    }, arguments);

    var RANKING = {};

    var self = this;
    var root = s.root;
    var width, height, margin;
    var x, y, color, xAxis, yAxis, x0, y0;
    var svg;
    var data;
    var histogramIdArray = [];
    var selectedIndex = 'undefined';
    var isRankingDrawn = false;

    var STR_NO_RANKING = "No Ranking Yet!";

    RANKING.Settings = new Settings();


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    RANKING.Evt = {};


    RANKING.Evt.itemClicked = function(d, i){
        s.onItemClicked.call(this, d, i);
    };

    RANKING.Evt.itemMouseOvered = function(d, i){
        s.onItemHovered.call(this, d, i);
    };

    RANKING.Evt.itemMouseOuted = function(d, i){
        s.onItemUnhovered.call(this, d, i);
    };


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    RANKING.Render = {};


    /******************************************************************************************************************
	*
	*	Draw stacked bars either on draw or update methods. Animate with width transition
	*
	* ***************************************************************************************************************/
    RANKING.Render.drawStackedBars = function(){

        svg.selectAll(".stackedbar").data([]).exit();
        svg.selectAll(".stackedbar").remove();
        svg.selectAll(".stackedbar").data(data).enter();

        setTimeout(function(){

            var stackedBars = svg.selectAll(".stackedbar")
            .data(data)
            .enter().append("g")
            .attr("class", "stackedbar")
            .attr("id", function(d, i){ return "stackedbar-" + i; })
            .attr( "transform", function(d, i) { return "translate(0, " + y(i) + ")"; } )
            .on('click', RANKING.Evt.itemClicked)
            .on('mouseover', RANKING.Evt.itemMouseOvered)
            .on('mouseout', RANKING.Evt.itemMouseOuted);

            stackedBars.append('rect')
            .attr('class', function(d, i){ if(i%2 == 0) return 'light_background'; return 'dark_background'; })
            .attr('x', 0)
            .attr('width', width)
            .attr('height', y.rangeBand());

            stackedBars.selectAll(".bar")
            .data(function(d) { return d.weightedKeywords; })
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("height", y.rangeBand())
            .attr("x", function(d) { return x(d.x0); })
            .attr("width", 0)
            .style("fill", function(d) { return color(d.stem); });

            var bars = stackedBars.selectAll(".bar");

            var t0 = bars.transition()
            .duration(500)
            .attr({
                "width": function(d) { return x(d.x1) - x(d.x0); }
            });
        }, 800);

    };



    /******************************************************************************************************************
	*
	*	Create drop shadow for click effect on bars
	*
	* ***************************************************************************************************************/
    RANKING.Render.createShadow = function(){

        // filters go in defs element
        var defs = svg.append("defs");

        // create filter with id #drop-shadow
        // height=130% so that the shadow is not clipped
        var filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");

        // SourceAlpha refers to opacity of graphic that this filter will be applied to
        // convolve that with a Gaussian with standard deviation 3 and store result
        // in blur
        filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 2)
        .attr("result", "blur");

        // translate output of Gaussian blur to the right and downwards with 2px
        // store result in offsetBlur
        filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 0)
        .attr("dy", 2)
        .attr("result", "offsetBlur");

        // overlay original SourceGraphic over translated blurred opacity by using
        // feMerge filter. Order of specifying inputs is important!
        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
    };




    /******************************************************************************************************************
	*
	*	Draw ranking at first instance
	*
	* ***************************************************************************************************************/
    RANKING.Render.draw = function(rankingModel, containerHeight, colorScale){

        if(rankingModel.getStatus() == RANKING_STATUS.no_ranking)
            return this.reset();
        $(root).empty();

        selectedIndex = 'undefined';
        isRankingDrawn = true;

        /******************************************************
		*	Define input variables
		******************************************************/
        RANKING.InitData = RANKING.Settings.getRankingInitData(rankingModel);
        data = RANKING.InitData.data;

        /******************************************************
		*	Define canvas dimensions
		******************************************************/
        RANKING.Dimensions = RANKING.Settings.getRankingDimensions(root, containerHeight);
        width          = RANKING.Dimensions.width;
        height         = RANKING.Dimensions.height;
        margin         = RANKING.Dimensions.margin;

        /******************************************************
		*	Define scales
		******************************************************/

        x = d3.scale.linear()
        //.domain( [0, RANKING.Internal.topLimit(data, rankingCriteria)] )
        //.domain( [0, data[0][rankingModel.getMode()]] )
        .domain([0, 1])
        .rangeRound( [0, width] );

        y = d3.scale.ordinal()
        .domain(data.map(function(d, i){ return i; }))
        .rangeBands( [0, height], .02);

        color = colorScale;

        /******************************************************
		 *	Define axis' function
		 *****************************************************/

        // X Axis
        xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        //.tickFormat(d3.format(".2s"));
        .tickFormat(function(value){ if(value > 0 && value < 1) return (value * 100) + '%'; return ''; });

        // Y Axis
        yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickValues("");

        /******************************************************
		*	Draw chart main components
		******************************************************/

        //// Add svg main components
        svg = d3.select(root).append("svg")
        .attr("class", "svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 30)
        .append("g")
        .attr("width", width)
        .attr("height", height + 30)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(function(){ if(rankingModel.getMode() === RANKING_MODE.overall_score) return "Overall Score"; return 'Max. Score'; });

        /*        svg.selectAll('.x.axis text')
            .text(function(text){
                if(parseFloat(text) == 0.0) return ""; return text;
            });*/

        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("text")
        /*.style('cursor', 'pointer')
                .on('click', function(d, i){
                    var actualIndex = data.getIndexOf(d, 'title');
                    RANKING.Evt.itemClicked(actualIndex);
                })*/;

        //// Create drop shadow to use as filter when a bar is hovered or selected
        RANKING.Render.createShadow();
        //// Add stacked bars
        RANKING.Render.drawStackedBars();
        //// Adjust length of title in y-axis. Add position and #positions changed
        //RANKING.Render.adjustTitlesInYAxis();
    };



    /******************************************************************************************************************
	*
	*	Redraw updated ranking and animate with transitions to depict changes
	*
	* ***************************************************************************************************************/
    RANKING.Render.update = function(rankingModel, containerHeight, colorScale){

        if(rankingModel.getStatus() === RANKING_STATUS.no_ranking){
            return this.reset();
        }

        selectedIndex = 'undefined';

        /******************************************************
		*	Define input variables
		******************************************************/
        RANKING.InitData = RANKING.Settings.getRankingInitData(rankingModel);
        data = RANKING.InitData.data;

        RANKING.Render.updateCanvasDimensions();

        /******************************************************
		*	Redefine x & y scales' domain
		******************************************************/
        x0 = x.domain([0, 1]).copy();

        y.rangeBands( [0, height], .02);
        y0 = y.domain(data.map(function(d, i){ return i; })).copy();

        color = colorScale;

        svg.select('.x.axis .label')
        .text(function(){ if(rankingModel.getMode() === RANKING_MODE.overall_score) return "Overall Score"; return 'Max. Score'; });

        var transition = svg.transition().duration(750),
            delay = function(d, i) { return i * 50; };

        transition.select(".x.axis")
        .call(xAxis)
        .selectAll("g")
        .delay(delay);

        transition.select(".y.axis")
        .call(yAxis)
        .selectAll("g")
        .delay(delay)

        RANKING.Render.drawStackedBars();
    };



    /******************************************************************************************************************
	*
	*	Adjust height of svg and other elements when the ranking changes
	*
	* ***************************************************************************************************************/

    RANKING.Render.updateCanvasDimensions = function(){

        /******************************************************
		*	Recalculate canvas dimensions
		******************************************************/
        RANKING.Dimensions = RANKING.Settings.getRankingDimensions(root, containerHeight);
        height = RANKING.Dimensions.height;

        y.rangeBands(height, .02);

        d3.select(svg.node().parentNode)
        .attr('height', height + margin.top + margin.bottom + 30);

        svg.attr("height", height + 30)
        .attr("transform", "translate(" + (margin.left) + ", 0)");

        // update axes
        svg.select('.x.axis').attr("transform", "translate(0," + (height) + ")").call(xAxis.orient('bottom'));
    };

    /******************************************************************************************************************
	*
	*	Redraw without animating when the container's size changes
	*
	* ***************************************************************************************************************/
    RANKING.Render.resize = function(containerHeight){
        /******************************************************
		*	Recalculate canvas dimensions
		******************************************************/
        RANKING.Dimensions = RANKING.Settings.getRankingDimensions(root);
        width          = RANKING.Dimensions.width;
        //    height         = RANKING.Dimensions.height;
        margin         = RANKING.Dimensions.margin;

        x.rangeRound([0, width]);
        y.rangeBands(height, .02);

        d3.select(svg.node().parentNode).attr('width',width + margin.left + margin.right);
        svg.attr("width", width);

        // update x-axis
        svg.select('.x.axis').call(xAxis.orient('bottom'));

        // Update bars
        svg.selectAll(".stackedbar").attr('width', width);
        svg.selectAll("rect.light_background").attr('width', width);
        svg.selectAll("rect.dark_background").attr('width', width);

        svg.selectAll(".bar")
        .attr("x", function(d) { return x(d.x0); })
        .attr("width", function(d) { return x(d.x1) - x(d.x0); });
    };


    /******************************************************************************************************************
	*
	*	Reset by clearing canvas and display message
	*
	* ***************************************************************************************************************/
    RANKING.Render.reset = function(){
        isRankingDrawn = false;
        selectedIndex = 'undefined';

        var $root = $(root);
        $root.empty();
    };


    /******************************************************************************************************************
    *
    *	Highlight stacked bar and corresponding item in recommendatitle in y axis, tion list
    *	Show rich tooltip
    *   @param {integer} itemIndex: index of selected item
    *   @param {boolean} isSelectedFromOutside: true means that the call came from Vis object, otherwise it was invoked internally by clicking on a y-axis tick or stacked bar
    *
    * ***************************************************************************************************************/
    RANKING.Render.selectItem = function(index){

        if( index != selectedIndex ){       // select
            selectedIndex = index;
            svg.selectAll('.stackedbar').style('opacity', function(d, i){ if(i == index) return 1; return 0.3; });
        }
        else{                                   // deselect
            selectedIndex = 'undefined';
            svg.selectAll('.stackedbar').style('opacity', 1);
        }
    };


    RANKING.Render.hoverItem = function(index) {

        svg.select("#stackedbar-" + index).selectAll('.bar')
        .attr('transform', 'translate(0, 0)')
        .style('filter', 'url(#drop-shadow)');
    };



    RANKING.Render.unhoverItem = function(index) {

        svg.select("#stackedbar-" + index).selectAll('.bar')
        .attr('transform', 'translate(0, 0.2)')
        .style('filter', '');
    };


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    RANKING.Ext = {
        update: function(rankingModel,containerHeight, colorScale){            // rankingModel, colorScale, rankingCriteria, status
            if(status = 'new')
                RANKING.Render.draw(rankingModel, containerHeight, colorScale);
            else if(status = 'update')
                RANKING.Render.update(rankingModel, containerHeight, colorScale);
        },
        reset: function(){
            RANKING.Render.reset();
        },
        resize: function(containerHeight){
            if(isRankingDrawn) RANKING.Render.resize(containerHeight);
        },
        selectItem: function( itemIndex ){
            if(isRankingDrawn) RANKING.Render.selectItem(itemIndex, true);
        },
        hoverItem: function(index){
            if(isRankingDrawn) RANKING.Render.hoverItem(index, true);
        },
        unhoverItem: function(index){
            if(isRankingDrawn) RANKING.Render.unhoverItem(index, true);
        }
    };

    return RANKING.Ext;
}
