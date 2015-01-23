(function Controls(){

    var taskStorage = new TaskStorage();

    var clearResults = function(){
        taskStorage.removeEvaluationsResults();
    };

    var fixResults = function(){
        taskStorage.fix();
    };

    var restoreResults = function(){
        taskStorage.restore();
    };

    var downloadResults = function(e){

        var scriptURL = (document.URL).replace('controls.html', 'download.php'),
            d = new Date(),
            timestamp = d.getFullYear() + '-' + (parseInt(d.getMonth()) + 1) + '-' + 
                d.getDate() + '_' + d.getHours() + '.' + d.getMinutes() + '.' + d.getSeconds();

        $.generateFile({
            filename	: 'evaluation_results_' + timestamp + '.txt',
            content		: JSON.stringify(taskStorage.getEvaluationResults()),
            script		: scriptURL
        });
        e.preventDefault();
    };


    var processResults = function(e) {

        var users = [],
            queries = ['women in workforce', 'robot', 'augmented reality', 'circular economy'],
            keywordLists = ['participation&women&workforce', 'gap&gender&wage', 'inquality&man&salary&wage&woman&workforce',
                            'autonomous&robot', 'human&interaction&robot', 'control&information&robot&sensor',
                            'environment&virtual', 'context&object&recognition', 'augmented&environment&image&reality&video&world',
                            'management&waste', 'china&industrial&symbiosis', 'circular&economy&fossil&fuel&system&waste'],
            documents = [],
            compositions = [];


        for(var i=0; i<24; i++)
            users.push('user_' + (i+1));

        taskStorage.getEvaluationResults().forEach(function(result){
            result["tasks-results"].forEach(function(task) {
                if(task["tool-aided"] == 'yes') {
                    task["questions-results"].forEach(function(question) {
                        question["selected-items"].forEach(function(item) {

                            documents.pushObjIfNotExist(item);
                            compositions.pushObjIfNotExist({
                                user: 'user_' + result.user,
                                query: getQuery(task.topic),
                                keywordList: getKeywordList(task.topic, question["question-number"]),
                                'doc-id': item.id
                            });
                        });
                    });
                }
            });
        });


        console.log(compositions);

        function getQuery(topic) {
            switch(topic){
                case "T1 WW": return 'women in workforce'; break;
                case "T2 Ro": return 'robot'; break;
                case "T3 AR": return 'augmented reality'; break;
                case "T4 CC": return 'circular economy'; break;
            }
        }

        function getKeywordList(topic, questionNum) {

            var topicNum;
            switch(topic){
                case "T1 WW": topicNum = 0; break;
                case "T2 Ro": topicNum = 1; break;
                case "T3 AR": topicNum = 2; break;
                case "T4 CC": topicNum = 3; break;
            }
            return keywordLists[topicNum * 3 + (parseInt(questionNum) - 1)];
        }

    };



    (function init(){
        $('#clear_results').click(clearResults);
        $('#fix_results').click(fixResults);
        $('#restore_results').click(restoreResults);
        $('#download_results').click(downloadResults);
        $('#process_results').click(processResults);
    })();

})()
