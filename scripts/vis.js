(function(){



    var options = {
        tagCloudRoot: '#urank-collection-keywords-box',
        tagBoxRoot: '#urank-query-box',
        contentListRoot: '#urank-content-list',
        visCanvasRoot: '#urank-canvas',
        docViewerRoot: '#urank-document-viewer'
    };

    var init = function(urank){
        $('#eexcess_btnreset').click(urank.reset);
        $('#eexcess_btn_sort_by_overall_score').click(urank.rankByOverallScore);
        $('#eexcess_btn_sort_by_max_score').click(urank.rankByMaximumScore);

        urank.loadData(localStorage.getItem('data'));
        $('#message').css('visibility', 'hidden');
    };

    Urank(init, options, 'modules/urank/');

})();

