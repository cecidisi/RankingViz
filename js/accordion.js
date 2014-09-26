/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Accordion with drop-down lists
 *
 * */


$.fn.accordionCustom = function( options ) {

    options = options || {};
    var collapsible = options['collapsible'] || false;
    var duration = options['duration'] || 400;
    var easing = options['easing'] || 'swing';
    var slideOptions = { 'duration': duration, 'easing': easing };

    $(this).each(function(j, container){

        var dataArray = [];
        console.log("---------------------------------------");
        console.log($(container));

        $(container).children('div').each(function(i, item){

            console.log($(item));
            $(item).addClass('accordion-item');
            $(item).attr('accordion-item-pos', i);
            var dataObj = {};
            dataObj['title'] = $(item).find('h3').text();
            dataObj['color'] = $(item).find('div').text() || "";
            dataObj['content'] = $(item).find('p').text();
            dataArray.push(dataObj);

            $(item).empty();
            console.log($(container).find('h3').text());
        });

        console.log(dataArray);
        dataArray.forEach(function(d, i){

            var itemId = $(container).attr('id');
            var $accordionItem = $(container).find(".accordion-item[accordion-item-pos = '" + i + "']");
            var $header = $("<div class='accordion-header'></div>").appendTo($accordionItem);

            $("<div></div>").appendTo($header).attr("class", "accordion-header-color-icon").css("backgroundColor", d.color || "inherit");
            $("<span></span>").appendTo($header).text(d.title).css("marginLeft", "0em");

            var $accordionContent = $("<div></div>").appendTo($accordionItem)
                .attr("class", "accordion-content")
                .css("display", "none");

            $("<p></p>").appendTo($accordionContent).text(d.content);

            // Colapse & Expand
            $header.click(function(event){
                event.stopPropagation();
                if(collapsible){

                    var posToToggle = $(this.parentNode).attr('accordion-item-pos');

                    $('.accordion-item').each(function(i, item){
                        if($(item).attr('accordion-item-pos') == posToToggle){
                            $(item).find('.accordion-header').toggleClass('active');
                            $(item).find('.accordion-content').slideToggle(slideOptions);
                        }
                        else{
                            $(item).find('.accordion-header').removeClass('active');
                            $(item).find('.accordion-content').slideUp(slideOptions);
                        }
                    });

                }
                else{
                    $(this.parentNode).find('.accordion-header').toggleClass('active');
                    $(this.parentNode).find('.accordion-content').slideToggle(slideOptions);
                }


            });

/*

            // Colapse & Expand
            header.on('click', function(d){

                if(collapsible){
                    itemIdToToggle = $(this.parentNode).attr('id');

                    $('.accordion-item').each(function(i, item){
                        if($(item).attr('id') == itemIdToToggle){
                            $(item).find('.accordion-header').toggleClass('active');
                            $(item).find('.accordion-content').slideToggle(slideOptions);
                        }
                        else{
                            $(item).find('.accordion-header').removeClass('active');
                            $(item).find('.accordion-content').slideUp(slideOptions);
                        }
                    });
                }
                else{
                    $(this.parentNode).find('.accordion-header').toggleClass('active');
                    $(this.parentNode).find('.accordion-content').slideToggle(slideOptions);
                }
            });
*/
        });
    });

};
