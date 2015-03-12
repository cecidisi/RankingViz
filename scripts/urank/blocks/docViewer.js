var DocViewer = (function(){

    // Settings
    var s = {};
    // Classes
    var docViewerContainerClass = 'urank-docviewer-container',
        docViewerDetailsSectionClass = 'urank-docviewer-details-section',
        docViewerContentSectionClass = 'urank-docviewer-content-section';
    // Id prefix
    var detailItemIdPrefix = '#urank-docviewer-details-';


    function DocViewer(arguments) {

        s = $.extend({
            root: '',
            facetsToShow: ['year'],
            getTextWithKeywordsHighlighted: function(text){ return text; }
        }, arguments);
    }


    var _build = function() {

        var docViewerContainer = $(s.root);
        docViewerContainer.addClass(docViewerContainerClass);

        // Append details section, titles and placeholders for doc details
        var detailsSection = $("<div class='" + docViewerDetailsSectionClass + "'></div>").appendTo(docViewerContainer);

        var titleContainer = $('div').appendTo(detailsSection);
        $('label').appendTo(titleContainer).text('Title:');
        $("<span id='urank-docviewer-details-title'></span>");

        s.facetsToShow.forEach(function(facetName){
            var facetContainer = $('div').appendTo(detailsSection);
            $('label').appendTo(facetContainer).text(facetName.capitalizeFirstLetter() + ':');
            $("<span id='urank-docviewer-details-" + facetName + "'></span>");
        });

        // Append content section for snippet placeholder
        var contentSection = $("<div class='" + docViewerContentSectionClass + "'></div>");
        $('p').appendTo(contentSection);
    };



    var _showDocument = function(document){
        $(detailItemIdPrefix + 'title').html(s.getTextWithKeywordsHighlighted(document.title));
        s.facetsToShow.forEach(function(facet){
            $(detailItemIdPrefix + '' + facet).html(s.getTextWithKeywordsHighlighted(document.facets[facet]));
        });

        $('.' + docViewerContentSectionClass + ' p').html(s.getTextWithKeywordsHighlighted(document.description));
        $('.' + docViewerContentSectionClass + ' p').hide();
        $('.' + docViewerContentSectionClass + ' p').fadeIn('slow');
        $('.' + docViewerContentSectionClass).scrollTo('top');
    };


    var _clear = function(){
        // Clear details section
        $(detailItemIdPrefix + 'title').empty();
        s.facetsToShow.forEach(function(facet){
            $(detailItemIdPrefix + '' + facet).empty();
        });
        // Clear content section
        $('.' + docViewerContentSectionClass + ' p').fadeOut('slow');
    };



    DocViewer.prototype = {
        build: _build,
        clear: _clear,
        showDocument: _showDocument
    };

    return DocViewer;
})();
