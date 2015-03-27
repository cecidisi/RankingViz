var TagCloud = (function(){

    var _this;
    // Settings
    var s = {};
    //  Classes
    var tagCloudContainerClass = 'urank-tagcloud-container',
        tagClass = 'urank-tagcloud-tag',
        tagHoverFixedClass = 'urank-tagcloud-tag-hover-fixed',
        tagDimmedClass = 'urank-tagcloud-tag-dimmed',
        proxKeywordIndicatorClass = 'urank-tagcloud-prox-keyword-indicator';
    //  Ids
    var tagIdPrefix = '#urank-tag-';
    //   Attributes
    var tagPosAttr = 'tag-pos';


    function TagCloud(arguments) {
        _this = this;
        s = $.extend({
            root: '',
            colorScale: function(){},
            dropIn: '.urank-tagbox-container',
            onTagInCloudMouseEnter: function(index){},
            onTagInCloudMouseLeave: function(index){},
            onTagInCloudClick: function(index){},
            onProxKeywordIndicatorMouseEnter : function(index){},
            onProxKeywordIndicatorMouseLeave : function(index){},
            onProxKeywordIndicatorClick : function(index){}
        }, arguments);

        this.keywords = [];
        this.proxKeywordsMode = false;
        this.draggableOptions = {
            revert: 'invalid',
            helper: 'clone',
            zIndex: 999,
            appendTo: s.dropIn,
            start: function(event, ui){ $(this).hide(); },
            stop: function(event, ui){ $(this).show(); }
        };

        $(s.root).on('click', function(event){
            if(_this.proxKeywordsMode) {
                $('.'+tagClass).each(function(i, tag){
                    _this.setTagProperties($(tag));
                });

                $(this).off('scroll');
            }
        });
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
            var $tag = $("<div class='" + tagClass + "' id='urank-tag-" + i + "' tag-pos='" + i + "' stem='" + k.stem + "'>"
                        + k.term + "</div>").appendTo(root);

            if(k.keywordsInProximity.length > 0) {
                $("<div class='" + proxKeywordIndicatorClass+ "' title='" + k.keywordsInProximity.length + " keywords associated to " + k.term.toUpperCase() + "'>" + k.keywordsInProximity.length + "</div>").appendTo($tag);
            }

            $tag.data({ 'color': s.colorScale(k.colorCategory) });
            _this.setTagProperties($tag);
        });
    };


    var _reset = function() {
        this.build(this.keywords);
    };


    var _setTagProperties = function($tag) {

        $tag.removeClass(tagHoverFixedClass)
        .css({
            background: getGradientString($tag.data('color')),
            border: '1px solid ' + $tag.data('color'),
            color: '',
            textShadow: ''
        }).off().on({
            mouseenter: function(event){ s.onTagInCloudMouseEnter.call(this, $(this).attr(tagPosAttr)) },
            mouseleave: function(event){ s.onTagInCloudMouseLeave.call(this, $(this).attr(tagPosAttr)) },
            click: function(event){ s.onTagInCloudClick.call(this, $(this).attr(tagPosAttr)) }
        });
        // Set draggable
        if($tag.is('.ui-draggable'))
            $tag.draggable('destroy');
        $tag.draggable(this.draggableOptions);


        $tag.find('.'+proxKeywordIndicatorClass).css('visibility', '').off().on({
            mouseenter: function(event){ s.onProxKeywordIndicatorMouseEnter.call(this, $(this).parent().attr(tagPosAttr)) },
            mouseleave: function(event){ s.onProxKeywordIndicatorMouseLeave.call(this, $(this).parent().attr(tagPosAttr)) },
            click: function(event){
                event.stopPropagation();
                s.onProxKeywordIndicatorClick.call(this, $(this).parent().attr(tagPosAttr));
            }
        });

        return $tag;
    };


    var _hoverTag = function(index) {

        var $tag = $(tagIdPrefix + '' + index);
        $tag.css({
            background: getGradientString('#0066ff', 10),
            border: '1px solid #0066ff',
            color: ''
        });

        // Set circle position
        $tag.find('.'+proxKeywordIndicatorClass).css({
            top: $tag.offset().top + $tag.height(),
            left: $tag.offset().left + $tag.width() + 7
        });

    };


    var _unhoverTag = function(index) {
        var $tag = $(tagIdPrefix + '' + index);
        var color = $(tagIdPrefix + '' + index).data('color');
        $tag.css({
            background: getGradientString(color),
            border: '1px solid ' + color,
            color: '#111'
        })
    };


    var _proxKeywordIndicatorMouseEnter = function(index) {
        var $tag = $(tagIdPrefix + '' + index),
            $redCircle = $tag.find(proxKeywordIndicatorClass),
            proxKeywords = _this.keywords[index].keywordsInProximity;

        _this.proxKeywordsMode = false;

        $tag.siblings().each(function(i, siblingTag){
            if(_.findIndex(proxKeywords, function(proxKw){ return proxKw.stem == $(siblingTag).attr('stem') }) == -1) {
                var color = $(siblingTag).data('color');
                var rgbaStr = 'rgba(' + hexToR(color) + ', ' + hexToG(color) + ', ' + hexToB(color) + ', 0.4)';
                $(siblingTag).css({ background: rgbaStr, border: '1px solid ' + rgbaStr});
            }
        });
    };



    var _proxKeywordIndicatorMouseLeave = function(index) {
        var $tag = $(tagIdPrefix + '' + index),
            $redCircle = $tag.find(proxKeywordIndicatorClass);

            if(!_this.proxKeywordsMode) {
            $tag.siblings().each(function(i, siblingTag){
                var color  = $(siblingTag).data('color');
                $(siblingTag).css({ background: getGradientString(color, 10), border: '1px solid ' + color });
            });
        }
    };


    var _proxKeywordIndicatorMouseClicked = function(index) {
        var $tag = $(tagIdPrefix + '' + index),
            $redCircle = $tag.find(proxKeywordIndicatorClass),
            proxKeywords = _this.keywords[index].keywordsInProximity;

        _this.proxKeywordsMode = true;
        $('.'+tagClass).off();
        $('.'+tagClass).find('.'+proxKeywordIndicatorClass).css('visibility', 'hidden').off();

        $redCircle.css('visibility', 'visible');
        $tag.addClass(tagHoverFixedClass);
        $tag.siblings().css({ color: '#111', textShadow: '0.1em 0.1em 0.5em #eee' });

        $(s.root).on('scroll', function(event) {
            event.stopPropagation();
            $redCircle.css({
                top: $tag.offset().top + $tag.height(),
                left: $tag.offset().left + $tag.width() + 7
            });
            var visibility = ($(this).offset().top <= ($redCircle.offset().top + $redCircle.height())) ? 'visible' : 'hidden';
            $redCircle.css('visibility', visibility);
        });
    };

    /**
	 *	Detach tag from tag box and return it to container (tag cloud)
	 *
	 * */
    var _restoreTag = function(index){

        var $tag = $(tagIdPrefix + '' + index);
        // Remove icon and slider
        //$tag.children().remove();
        // Change class
        $tag.removeClass().addClass(tagClass);
        $tag.draggable('destroy');
        this.setTagProperties($tag);

        // Re-append to tag container, in the corresponding postion
        var tagIndex = parseInt($tag.attr(tagPosAttr));
        var i = tagIndex - 1;
        var firstTagIndex = $(s.root).find('.'+ tagClass + ':eq(0)').attr(tagPosAttr);
        // second condition checks if the tag is NOT in Tag Cloud
        while(i >= firstTagIndex && !$(tagIdPrefix + '' + i).hasClass(tagClass))
            --i;

        var oldOffset = { top: $tag.offset().top, left: $tag.offset().left};
        // Remove from tag box
        $tag = $tag.detach();

        if(i >= firstTagIndex)    // Current tag inserted after another (tag-pos == i)
            $(tagIdPrefix + '' + i).after($tag);
        else                      // Current tag inserted in first position of tag container
            $(s.root).prepend($tag);

        var currentOffset = { top: $tag.offset().top, left: $tag.offset().left };
        // Animate tag moving from ta box to tag cloud
        $tag.css({ position: 'absolute', top: oldOffset.top, left: oldOffset.left, 'z-index': 999 });
        $tag.animate({ top: currentOffset.top, left: currentOffset.left }, 1000, 'swing', function(){
            $(this).css({ position: '', top: '', left: '', 'z-index': '' });
        });

    };



    TagCloud.prototype = {
        build: _build,
        reset: _reset,
        setTagProperties: _setTagProperties,
        restoreTag: _restoreTag,
        hoverTag: _hoverTag,
        unhoverTag: _unhoverTag,
        proxKeywordIndicatorMouseClicked: _proxKeywordIndicatorMouseClicked,
        proxKeywordIndicatorMouseEnter: _proxKeywordIndicatorMouseEnter,
        proxKeywordIndicatorMouseLeave: _proxKeywordIndicatorMouseLeave
    };

    return TagCloud;
})();

