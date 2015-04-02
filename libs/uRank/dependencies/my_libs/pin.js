
(function($){

    $.fn.pin = function(args){

        var options = $.extend({
            top: 0,
            left: 0,
            container: 'body'
        }, args);

        var $this = $(this);
        if($this.css('visibility') == 'visible') {

            $this.css({ top: options.top, left: options.left });

            var $container = $(options.container),
                containerOffset = $container.offset(),
                containerHeight = $container.height(),
                containerWidth = $container.width(),
                thisOffset = $this.fullOffset(),
                thisHeight = $this.height(),
                thisWidth = $this.width();

            if(thisOffset.top < containerOffset.top || (thisOffset.top + thisHeight) > (containerOffset.top + containerHeight) || thisOffset.left < containerOffset.left || (thisOffset.left + thisWidth) > containerOffset.left + containerWidth )
                $this.css('visibility', 'hidden');
            else


            return $this;
        }
    };

})(jQuery);
