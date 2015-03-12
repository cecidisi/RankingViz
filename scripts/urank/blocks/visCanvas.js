var VisCanvas = (function(){

    //  Settings
    var s = {};
    // Classes
    var visCanvasContainerClass = 'urank-viscanvas-container',
        visCanvasMessageClass = 'urank-viscanvas-message';

    function VisCanvas(arguments) {
        s = $.extend({
            root: '',
            visModule: VIS_MODULES.ranking,
            onItemClicked: function(index){},
            onItemHovered: function(index){},
            onItemUnhovered: function(index){}
        }, arguments);
    }


    var _build = function() {
        $(s.root).addClass(visCanvasContainerClass);
        var visArguments = {
            root: s.root,
            onItemClicked: s.onItemClicked,
            onItemHovered: s.onItemHovered,
            onItemUnhovered: s.onItemUnhovered
        };

        this.vis = new s.visModule(visArguments);
        this.reset();
    };


    var _update = function(rankingModel, containerHeight, colorScale) {
        this.vis.update(rankingModel, containerHeight, colorScale);
        $(s.root).scrollTo('top');
    };

    var _resize = function(){
        this.vis.resize();
    };

    var _reset = function(){
        this.vis.reset();
        $(s.root).append("<p class='" + visCanvasMessageClass + "'>" + STR_NO_VIS + "</p>");
    };

    var _selectItem =function(index) {
        this.vis.selectItem(index);
    }

    var _hoverItem = function(index) {
        this.vis.hoverItem(index);
    }

    var _unhoverItem = function(index) {
        this.vis.unhoverItem(index);
    }


    VisCanvas.prototype = {
        build: _build,
        update: _update,
        reset: _reset,
        resize: _resize,
        selectItem: _selectItem,
        hoverItem: _hoverItem,
        unhoverItem: _unhoverItem
    };

    return VisCanvas;
})();
