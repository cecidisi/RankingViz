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

        var titleContainer = $('<div></div>').appendTo(detailsSection);
        $("<label>Title:</label>").appendTo(titleContainer);
        $("<span id='urank-docviewer-details-title'></span>").appendTo(titleContainer);

        s.facetsToShow.forEach(function(facetName){
            var facetContainer = $('<div></div>').appendTo(detailsSection);
            $("<label>" + facetName.capitalizeFirstLetter() + ":</label>").appendTo(facetContainer);
            $("<span id='urank-docviewer-details-" + facetName + "'></span>").appendTo(facetContainer);
        });

        // Append content section for snippet placeholder
        var contentSection = $("<div class='" + docViewerContentSectionClass + "'></div>").appendTo(docViewerContainer);
        $('<p></p>').appendTo(contentSection);
    };



    /**
    * @private
    * Description
    * @param {type} document Description
    * @param {Array} keywords (only stems)
    */
    var _showDocument = function(document, keywords){
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
