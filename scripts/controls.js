(function Controls(){

    var taskStorage = new TaskStorage();

    var clearResults = function(){
        taskStorage.removeEvaluationsResults();
    };


    (function(){
        $('#clear_results').click(clearResults);

    })();

})()
