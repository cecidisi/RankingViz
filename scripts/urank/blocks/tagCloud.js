var TagCloud = (function(){

    var _this;
    // Settings
    var s = {};
    //  Classes
    var tagCloudContainerClass = 'urank-tagcloud-container',
        tagClass = 'urank-tagcloud-tag';
    //  Ids
    var tagIdPrefix = '#urank-tag-';


    function TagCloud(arguments) {
        _this = this;
        s = $.extend({
            root: '',
            colorScale: function(){},
            dropIn: '.urank-tagbox-container',
            onTagInCloudMouseEnter: function(index){},
            onTagInCloudMouseLeave: function(index){},
            onTagInCloudClick: function(index){}
        }, arguments);

        this.keywords = [];
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
        this.keywords = keywords;
        var root = $(s.root);
        // Empty tag container and add appropriateclass
        root.empty().addClass(tagCloudContainerClass);

        keywords.forEach(function(k, i){
            var tag = $("<div class='" + tagClass + "' id='urank-tag-" + i + "' tag-pos='" + i + "'>" + k.term + "</div>").appendTo(root);
            tag.data({ 'stem': k.stem, 'color': s.colorScale(k.colorCategory+1) });
            _this.setTagProperties(tag);
        });
    };


    var _reset = function() {
        this.build(this.keywords);
    };


    var _setTagProperties = function(tag) {
        tag.css({
            background: getGradientString(tag.data('color')),
            border: '1px solid ' + tag.data('color')
        })
        .off()
        .on({
            mouseenter: function(event){ s.onTagInCloudMouseEnter.call(this, $(this).attr('tag-pos')) },
            mouseleave: function(event){ s.onTagInCloudMouseLeave.call(this, $(this).attr('tag-pos')) },
            click: function(event){ s.onTagInCloudClick.call(this, $(this).attr('tag-pos')) }
        })
        .draggable(this.draggableOptions);
        return tag;
    };


    var _hoverTag = function(index) {
        $(tagIdPrefix + '' + index).css({
            background: getGradientString('#0066ff', 10),
            border: '1px solid #0066ff',
            color: '#eee'
        })
    };


    var _unhoverTag = function(index) {
        var color = $(tagIdPrefix + '' + index).data('color');
        $(tagIdPrefix + '' + index).css({
            background: getGradientString(color),
            border: '1px solid ' + color,
            color: '#111'
        })
    };


    /**
	 *	Detach tag from tag box and return it to container (tag cloud)
	 *
	 * */
    var _restoreTag = function(index){

        var $tag = $(tagIdPrefix + '' + index);
        // Remove icon and slider
        $tag.children().remove();
        // Change class
        $tag.removeClass().addClass(tagClass);
        this.setTagProperties($tag);

        // Re-append to tag container, in the corresponding postion
        var tagIndex = parseInt($tag.attr('tag-pos'));
        var i = tagIndex - 1;
        var firstTagIndex = $(s.root).find('.'+ tagClass + ':eq(0)').attr('tag-pos');
        // second condition checks if the tag is NOT in Tag Cloud
        while(i >= firstTagIndex && !$(tagIdPrefix + '' + i).hasClass(tagClass))
            --i;

        var oldOffsetTop = $tag.offset().top;
        var oldOffsetLeft = $tag.offset().left;
        // Remove from tag box
        $tag = $tag.detach();

        if(i >= firstTagIndex)    // The current tag should be inserted after another (tag-pos == i)
            $(tagIdPrefix + '' + i).after($tag);
        else                      // The current tag is inserted in the first position of tag container
            $(s.root).prepend($tag);

        var currentOffsetTop = $tag.offset().top;
        var currentdOffsetLeft = $tag.offset().left;
        // Insert animation

        $tag.css({ position: 'absolute', top: oldOffsetTop, left: oldOffsetLeft, 'z-index': 999 });
        $tag.animate({ top: currentOffsetTop, left: currentdOffsetLeft }, 1000, 'swing', function(){
                $(this).css({ position: 'relative', top: '', left: '', 'z-index': '' })

        });
        setTimeout(function(){$tag.draggable(this.draggableOptions);},1001);

//        $tag.animate({ position: 'absolute', top: offsetTop, left: offsetLeft }, {
//            'complete': function(){
//                //$(this).animate({ position: 'relative', top: 0, left: 0 }, 5000, 'swing');
//            }
//        });
    };



    TagCloud.prototype = {
        build: _build,
        reset: _reset,
        setTagProperties: _setTagProperties,
        hoverTag: _hoverTag,
        unhoverTag: _unhoverTag,
        restoreTag: _restoreTag
    };

    return TagCloud;
})();

