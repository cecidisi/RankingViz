var TagCloud = (function(){

    var _this;
    // Settings
    var s = {};
    //  Classes
    var tagCloudContainerClass = 'urank-tagcloud-container',
        tagClass = 'urank-tagcloud-tag',
        tagHoverFixedClass = 'urank-tagcloud-tag-hover-fixed',
        tagDimmedClass = 'urank-tagcloud-tag-dimmed',
        proxKeywordIndicatorClass = 'urank-tagcloud-prox-keyword-indicator',
        documentsIndicatorClass = 'urank-tagcloud-documents-indicator';
    //  Ids
    var tagIdPrefix = '#urank-tag-',
        tagPiePrefix = '#urank-tag-pie-';
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

        this.pieOptions = {
            size: { pieOuterRadius: '100%', canvasHeight: '14', canvasWidth: '14' },
            effects: {
                //load: { effect: "none" }
            },
            labels: {
                inner: { format: '' }
            },
            data: {
                content: [
                    { label: 'documentsIn', value: 0, color: '#65a620'/*, color: '#fe9929e'*/ },
                    { label: 'documentsNotIn', value: 0, color: '#fafafa'/*, color: '#010101'*/ },
                ]
            },
            effects: { highlightSegmentOnMouseover: false },
            misc: {
                colors: { segmentStroke: '#65a620' },
                canvasPadding: { top: 0, right: 0, bottom: 0, left: 0 },
            }
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
    var _build = function(keywords, collectionSize){
        this.keywords = keywords;
        var root = $(s.root);
        // Empty tag container and add appropriateclass
        root.empty().addClass(tagCloudContainerClass);

        keywords.forEach(function(k, i){
            var $tag = $("<div class='" + tagClass + "' id='urank-tag-" + i + "' tag-pos='" + i + "' stem='" + k.stem + "'>"
                        + k.term + "</div>").appendTo(root);

            // Append pie chart section for document indicator
            var termUpperCase = k.term.toUpperCase(),
                percentage = Math.floor(k.inDocument.length/collectionSize * 100),
                tooltipMsg = k.inDocument.length + " (" + percentage + "%) documents contain " + termUpperCase + "\n Click here to highlight documents";

            var $docIndicator = $("<div id='urank-tag-pie-" + i + "' title='" + tooltipMsg + "'></div>").appendTo($tag).addClass(documentsIndicatorClass);
            _this.pieOptions.data.content[0].value = k.inDocument.length;
            _this.pieOptions.data.content[1].value = collectionSize - k.inDocument.length;
            var tagPie = new d3pie(tagPiePrefix+''+i, _this.pieOptions);

            // Append red circle section for keywords in proximity indicator
            if(k.keywordsInProximity.length > 0) {
                tooltipMsg = k.keywordsInProximity.length + " other keywords frequently found close to " + termUpperCase + "\n Click here to lock view";
                $("<div title='" + tooltipMsg + "'>" + k.keywordsInProximity.length + "</div>").appendTo($tag).addClass(proxKeywordIndicatorClass);
            }

            $tag.data({ 'originalColor': s.colorScale(k.colorCategory) });
            _this.setTagProperties($tag);
        });
    };


    var _reset = function() {
        this.build(this.keywords);
    };


    var _setTagProperties = function($tag) {

        $tag.removeClass(tagHoverFixedClass)
        .css({
            background: getGradientString($tag.data('originalColor')),
            border: '1px solid ' + $tag.data('originalColor'),
            color: '', textShadow: '', cursor: ''
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

        $tag.find('.'+documentsIndicatorClass).css('visibility', '').off().on({
            click: function(event){
                event.stopPropagation();
            }
        });

        return $tag;
    };


    var setIndicatorsPosition = function($tag) {
        // Set pie chart position
        $tag.find('.'+documentsIndicatorClass).css({
            top: $tag.offset().top - 4,
            left: $tag.offset().left + $tag.width() + 5
        });

        // Set circle position
        $tag.find('.'+proxKeywordIndicatorClass).css({
            top: $tag.offset().top + $tag.height() - 1,
            left: $tag.offset().left + $tag.width() + 7
        });
    };



    var _hoverTag = function(index) {

        var $tag = $(tagIdPrefix + '' + index);
        $tag.css({
            background: getGradientString('#0066ff', 10),
            border: '1px solid #0066ff',
            color: ''
        });
        setIndicatorsPosition($tag);
    };


    var _unhoverTag = function(index) {
        var $tag = $(tagIdPrefix + '' + index);
        var color = $(tagIdPrefix + '' + index).data('originalColor');
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
                var color = $(siblingTag).data('originalColor');
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
                var color  = $(siblingTag).data('originalColor');
                $(siblingTag).css({ background: getGradientString(color, 10), border: '1px solid ' + color });
            });
        }
    };


    var _proxKeywordIndicatorMouseClicked = function(index) {
        var $tag = $(tagIdPrefix + '' + index),
            $redCircle = $tag.find(proxKeywordIndicatorClass);

        _this.proxKeywordsMode = true;
        $('.'+tagClass).off();
        $('.'+tagClass).each(function(i, tag){
            var visibility = ($(tag).attr(tagPosAttr) == index) ? 'visible' : 'hidden';
            $(tag).find('.'+proxKeywordIndicatorClass).css('visibility', visibility);
            $(tag).find('.'+documentsIndicatorClass).css('visibility', 'hidden');
        });

        $tag.addClass(tagHoverFixedClass)
            .siblings().css({ color: '#111', textShadow: '0.1em 0.1em 0.5em #eee', cursor: 'auto' });

        $(s.root).on('scroll', function(event) {
            event.stopPropagation();
            setIndicatorsPosition($tag);
            $redCircle = $tag.find('.'+proxKeywordIndicatorClass);
            var rootOffsetTop = $(this).fullOffset().top,
                rootHeight = $(this).height(),
                circleOffsetTop = $redCircle.fullOffset().top,
                circleHeight = $redCircle.height();
            var visibility = (rootOffsetTop <= (circleOffsetTop + circleHeight) && rootOffsetTop + rootHeight >= circleOffsetTop) ? 'visible' : 'hidden';
            $redCircle.css('visibility', visibility);
        });
    };



    var _documentsIndicatorClick = function(index) {


    }

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

