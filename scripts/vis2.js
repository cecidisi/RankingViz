function Vis() {

    var options = {
        tagCloudRoot: '#eexcess_keywords_container',
        tagBoxRoot: '#eexcess_keywords_box',
        contentListRoot: '#eexcess_content',
        visCanvasRoot: '#eexcess_canvas',
        docViewerRoot: '#eexcess_document_panel'
    };

    var urank = new Urank(options);

    $('#eexcess_btnreset').click(function(){ urank.reset.call(this); });
    $('#eexcess_btn_sort_by_overall_score').click(function(){ urank.rankByOverallScore.call(this); });
    $('#eexcess_btn_sort_by_max_score').click(function(){ urank.rankByMaximumScore.call(this); });


    urank.loadData(localStorage.getItem('data'));
    $('#message').css('visibility', 'hidden');





}
