(function Controls(){

    var taskStorage = new TaskStorage();

    var clearResults = function(){
        taskStorage.removeEvaluationsResults();
    };


    var downloadResults = function(e){
        var d = new Date();
        var timestamp = d.getFullYear() + '-' + (parseInt(d.getMonth()) + 1) + '-' + d.getDate() + '_' + d.getHours() + '.' + d.getMinutes() + '.' + d.getSeconds();

        $.generateFile({
            filename	: 'evaluation_results_' + timestamp + '.txt',
            content		: JSON.stringify(taskStorage.getEvaluationResults()),
            script		: 'http://localhost/RankingViz/download.php'
        });
        e.preventDefault();
    };


    var showStatistics = function(){
        var results = taskStorage.getEvaluationResults();





    }


    (function(){
        $('#clear_results').click(clearResults);
        $('#download_results').click(downloadResults);
    })();

})()
