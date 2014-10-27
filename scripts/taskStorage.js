function TaskStorage() {

    function setObject(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };


    function getObject(key) {
        var value = localStorage.getItem(key);
        return value && JSON.parse(value);
    };


    TaskStorage.prototype.saveTask = function(taskResults){

        if(taskResults['task-number'] === 0)
            return;

        if(taskResults['task-number'] === 1){
            this.userCount++;
            this.evaluationResults.push({
                'user' : this.userCount + 1,
                'tasks-results' : []
            });
            setObject('userCount', this.userCount);
        }
        this.evaluationResults[this.userCount]["tasks-results"].push(taskResults);
        setObject('evaluationResults', this.evaluationResults);
    };

    
    TaskStorage.prototype.removeEvaluationsResults = function(){
        localStorage.removeItem('userCount');
        localStorage.removeItem('evaluationResults');
        this.userCount = -1;
        this.evaluationResults = [];
    };

    
    TaskStorage.prototype.getEvaluationResults = function(){
        return this.evaluationResults;
    };

    
    this.userCount = (function(value){
        if(value != null) return value; return -1;
    })(getObject('userCount'));


    this.evaluationResults = (function(value){
        if(value != null) return value; return [];
    })(getObject('evaluationResults'));




}
