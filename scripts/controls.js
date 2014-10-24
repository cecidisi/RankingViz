(function Controls(){

    var taskStorage = new TaskStorage();

    var clearResults = function(){
        taskStorage.removeEvaluationsResults();
    };


    var downloadResults = function(e){
        console.log("download");
        var d = new Date();
        var timestamp = d.getFullYear() + '-' + (parseInt(d.getMonth()) + 1) + '-' + d.getDate() + '_' + d.getHours() + '.' + d.getMinutes() + '.' + d.getSeconds();

        $.generateFile({
            filename	: 'evaluation_results_' + timestamp + '.txt',
            content		: JSON.stringify(taskStorage.getEvaluationResults()),
            script		: 'http://localhost:8888/uRank/download.php'
        });
        e.preventDefault();
    };



    (function init(){
        $('#clear_results').click(clearResults);
        $('#download_results').click(downloadResults);
    })();

})()
