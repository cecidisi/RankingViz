/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Show & Hide Details
 *
 * */


$.fn.showAndHideSection = function( options ) {

    options = options || {};
    var duration = options['duration'] || 400;
    var easing = options['easing'] || 'swing';
    var slideOptions = { 'duration': duration, 'easing': easing };

    $(this).each(function(j, container){

        var $container = $(container);
        var $header;

        if(!$container.attr("class").contains("show-and-hide-container")){
            var text = "";
            $container.children('p').each(function(i, p) {
                text += $(p).text();
                $(container).empty();
            });

            // Container
            $container.addClass("show-and-hide-container");
            // Header section
            $header = $("<div class='show-and-hide-header'></div>").appendTo($container);
            // Arrow icon in header
            $("<span class='arrow-icon'></span>").appendTo($header);
            // Title in header
            $("<h3 class='title'></h3>").appendTo($header).text("Show details");
            // Content section
            var $content = $("<div class='show-and-hide-content'></div>").appendTo($container);
            // P in content
            $("<p></p>").appendTo($content).text(text);
            $content.css('display', 'none');
        }
        else{
            $header = $container.find(".show-and-hide-header");
        }

        $header.click(function(event){
            event.stopPropagation();

            $(this).toggleClass('active');
            $(this).find('.title').html(function(){ return ($(this.parentNode).attr("class").contains("active")) ? "Hide details" : "Show details" });
            $(this.parentNode).find('.show-and-hide-content').slideToggle(slideOptions);
        });
    });
};
