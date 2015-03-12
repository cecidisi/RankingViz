var TagBox = (function(){

    // Settings
    var s = {};
    //  Classes
    var tagboxContainerClass = 'urank-tagbox-container',
        tagInBoxClass = 'urank-tagbox-tag',
        tagDeleteButtonClass = 'urank-tagbox-tag-delete-button',
        tagWeightsliderClass = 'urank-tagbox-tag-weight-slider';
    //  Ids



    function Tagbox(arguments) {

        s = $.extend({
            root: '',
            colorScale: function(){},
            droppableClass: 'urank-tagcloud-tag',
            onChange: function(selectedKeywords, colorscale){},
            onTagDeleted: function(index){}
        }, arguments);

        this.droppableOptions = {
            tolerance: 'touch',
            drop: function(event, ui){
                this.dropTag(ui.draggable);
            }
        };

        this.sliderOptions = {
            orientation: 'horizontal',
            animate: true,
            range: "min",
            min: 0,
            max: 1,
            step: 0.2,
            value: 1,
            slide: function(event, ui) {
                this.updateTagStyle(this.parentNode, ui.value);
            },
            stop: function(event, ui) {
                s.onChange.call(this, this.getKeywordsInBox());
            }
            //stop: EVTHANDLER.slideStopped
        };
    }



    var _build = function() {
        // bind droppable behavior to tag box
        $(s.root).addClass(tagboxContainerClass);
        $(s.root).droppable( BEHAVIOR.droppableOptions );
    };


    var _clear = function() {
        $(s.root).empty();
        $('<p></p>').appendTo($(s.root)).text(STR_DROP_TAGS_HERE);
        //TAGCLOUD.updateTagColor();
    };


    var _dropTag = function(tag){
        // Set tag box legend
        $(s.root).find('p').remove();

        if (tag.hasClass(s.droppableClass)) {

            // Append dragged tag onto tag box
            $(s.root).append(tag);

            // Change tag's class
            tag.removeClass().addClass(tagInBoxClass).prop('is-selected', true);

            var tagPos = $(tag).attr('tag-pos');
            // Append "delete" icon to tag and bind event handler
            $("<img class='" + tagDeleteButtonClass + "' src='" + DELETE_ICON_IMG + "' />").appendTo(tag)
                .click(function(){ this.deleteTag(tagPos); /*EVTHANDLER.deleteTagClicked(tag);*/ });

            // Add new div to make it a slider
            var weightSlider = $("div").appendTo(tag).slider(this.sliderOptions);
            weightSlider.addClass(tagWeightsliderClass);

            // Retrieve color in weightColorScale for the corresponding label
            var tagStem = $(tag).attr('stem');
            var aux = s.colorScale(tagStem);
            var rgbSequence = hexToR(aux) + ', ' + hexToG(aux) + ', ' + hexToB(aux);

            // Set tag's style
            d3.select(tag[0])
                .style("background", "rgba("+ rgbSequence + ", 1)")
                .style("color", "")
                .style("border", "solid 0.2em " + aux)
                .on("mouseover", "")
                .on("mouseout", "");
        }
    };


    var _deleteTag = function(index) {
        s.onTagDeleted(index);
        s.onChange.call(this, this.getKeywordsInBox(), s.colorScale);

/*          IN CONTROLLER
        if( selectedTags.length == 0 ){
            $('<p></p>').appendTo($(s.root)).text(STR_DROP_TAGS_HERE);
            LIST.resetContentList();
            VISPANEL.resetRanking();
        }
        else{
            LIST.rankRecommendations();
        }
*/
    };


    var _updateTagStyle = function(tag, weight){

        var stem = d3.select(tag).data()[0].stem;
        var aux = weightColorScale(stem);
        var rgbSequence = hexToR(aux) + ', ' + hexToG(aux) + ', ' + hexToB(aux);

        d3.select(tag).style("background", "rgba("+ rgbSequence + "," + weight + ")");
    };



    /**
	 *	Retrieves the selected keywords (in tag box) and the weight assigned by the user
	 *	@return array. Each item is an object containing 'term' and 'weight'
	 * */
    var _getKeywordsInBox = function() {

        var  weightedKeywords = [];
        $('.'+tagInBoxClass).each(function(i, tag){
            var term = d3.select(tag).data()[0].term;
            var stem = d3.select(tag).data()[0].stem;
            var weight = parseFloat( $(tag).find(".div-slider").slider("value"));
            weightedKeywords.push({ 'term': term, 'stem': stem, 'weight': weight });
        });
        return weightedKeywords;
    }


    Tagbox.prototype = {
        build: _build,
        clear: _clear,
        dropTag: _dropTag,
        deleteTag:_deleteTag,
        updateTagStyle: _updateTagStyle,
        getKeywordsInBox: _getKeywordsInBox

    };

    return Tagbox;
})();



/*    var _updateTagColorScale = function(){

        // Clear color scale domain
        weightColorScale.domain([]);

        for(var i = 0; i < selectedTags.length; i++){
            // Reasign keyword to color scale domain
            var stem = d3.select(selectedTags[i][0]).data()[0].stem;
            var aux = weightColorScale(stem);
            var rgbSequence = hexToR(aux) + "," + hexToG(aux) + "," + hexToB(aux);
            var value = $(selectedTags[i][0]).find(".div-slider").slider("value");

            d3.select(selectedTags[i][0])
            .style("background", "rgba("+ rgbSequence + ", " + value + ")")
            .style("border", "solid 0.2em " + aux);
        }
    };*/
