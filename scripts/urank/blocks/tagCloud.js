var TagCloud = (function(){

    // Settings
    var s = {};
    //  Classes
    var tagCloudContainerClass = 'urank-tagcloud-container',
        tagClass = 'urank-tagcloud-tag';
    //  Ids
    var tagIdPrefix = '#urank-tag-';


    function TagCloud(arguments) {
        s = $.extend({
            root: '',
            colorScale: function(){},
            dropIn: '.urank-tagbox-container',
            onTagInCloudHovered: function(index){},
            onTagInCloudUnhovered: function(index){}
        }, arguments);

        this.draggableOptions = {
            revert: 'invalid',
            helper: 'clone',
            zIndex: 999,
            appendTo: s.dropIn,
            start: function(event, ui){ $(this).hide(); },
            stop: function(event, ui){ $(this).show(); }
        };
    }


    /**
    * * @param {array of objects} keywords Description
    */
    var _build = function(keywords){
        // Empty tag container
        $(s.root).empty();
        $(s.root).addClass(tagCloudContainerClass);

        // Append one div per keyword
        d3.select(s.root).selectAll('.'+tagClass)
            .data(keywords)
            .enter()
            .append("div")
            .attr("class", tagClass)
            .attr("id", function(k, i){ return "urank-tag-"+k.term; })
            .attr("term", function(k){ return k.term })
            .attr("stem", function(k){ return k.stem })
            .attr('tag-pos', function(k, i){ return i; })
            .prop('is-selected', false)
            .style("background", function(k){ return getGradientString(s.colorScale(k.colorCategory+1), [1, 0.7, 1]); })
            .style('border', function(k){ return '1px solid ' + s.colorScale(k.colorCategory+1); })
            .text( function(k){ return k.term; })
            .on( "mouseover", function(k, i){ s.onTagInCloudHovered.call(this, i); })
            .on( "mouseout", function(k, i){ s.onTagInCloudUnhovered.call(this, i); });

        // bind drag behavior to each tag
        $('.'+tagClass).draggable(this.draggableOptions);
    };


    var _hoverTag = function(index) {
        d3.select(tagIdPrefix + '' + index)
            .style( "background", function(k){ return getGradientString("#0066ff", [1, 0.8, 1]); })
            .style('border', '1px solid #0066ff')
            .style("color", "#eee");
    };


    var _unhoverTag = function(index) {
        d3.select(tagIdPrefix + '' + index)
            .style( "background", function(k){ return getGradientString(s.colorScale(k.colorCategory+1), [1, 0.7, 1]); })
            .style('border', function(k){ return '1px solid ' + s.colorScale(k.colorCategory+1); })
            .style("color", "#111");
    };



    /**
	 *	Detach tag from tag box and return it to container (tag cloud)
	 *
	 * */
    var _restoreTag = function(index){

        var tag = tagIdPrefix + '' + index;
        // Remove icon and slider
        $(tag).children().remove();
        // Change class
        $(tag).removeClass().addClass(tagClass)
            .attr('is-selected', false);

        // Restore style
        d3.select(tag)
            .style("background", function(k){ return getGradientString(s.colorScale(k.colorCategory+1), [1, 0.7, 1]) })
            .style('border', function(k){ return '1px solid ' + s.colorScale(k.colorCategory+1); })
            .style("color", "#111")
            .on( "mouseover", function(k, i){ s.onTagInCloudHovered.call(this, i); })
            .on( "mouseout", function(k, i){ s.onTagInCloudUnhovered.call(this, i); });

        $(tag).draggable(this.draggableOptions);
        // Re-append to tag container, in the corresponding postion
        var tagIndex = parseInt($(tag).attr('tag-pos'));
        var i = tagIndex - 1;
        var firstTagIndex = $(s.root).find('.'+ tagClass + ':eq(0)').attr('tag-pos');

        while(i >= firstTagIndex && $(tagIdPrefix + '' + i).prop('is-selected').toBool())
            --i;
        // Remove from tag box
        $(tag).detach();
        if(i >= firstTagIndex)    // The current tag should be inserted after another (tag-pos == i)
            $(tagIdPrefix + '' + i).after(tag);
        else                      // The current tag is inserted in the first position of tag container
            $(s.root).prepend(tag);

        // Insert animation
    };



    TagCloud.prototype = {
        build: _build,
        hoverTag: _hoverTag,
        unhoverTag: _unhoverTag,
        restoreTag: _restoreTag
    };

    return TagCloud;
})();

