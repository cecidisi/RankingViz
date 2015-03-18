

    var options = {
        tagCloudRoot: '#eexcess_keywords_container',
        tagBoxRoot: '#eexcess_keywords_box',
        contentListRoot: '#eexcess_content',
        visCanvasRoot: '#eexcess_canvas',
        docViewerRoot: '#eexcess_document_panel'
    };

    var init = function(urank){
        $('#eexcess_btnreset').click(urank.reset);
        $('#eexcess_btn_sort_by_overall_score').click(urank.rankByOverallScore);
        $('#eexcess_btn_sort_by_max_score').click(urank.rankByMaximumScore);

        urank.loadData(localStorage.getItem('data'));
        $('#message').css('visibility', 'hidden');
    };

    Urank(init, options, 'scripts/urank/');

