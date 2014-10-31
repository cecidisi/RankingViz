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
            setObject('userCount', this.userCount);
        
            this.evaluationResults.push({
                'user' : this.userCount,
                'tasks-results' : []
            });
        }
        this.evaluationResults[this.evaluationResults.length - 1]["tasks-results"].push(taskResults);
        setObject('evaluationResults', this.evaluationResults);
    };

    
    TaskStorage.prototype.removeEvaluationsResults = function(){
        localStorage.removeItem('userCount');
        localStorage.removeItem('evaluationResults');
        this.userCount = 0;
        this.evaluationResults = [];
    };

    
    TaskStorage.prototype.getEvaluationResults = function(){
        return this.evaluationResults;
    };

 
    
    TaskStorage.prototype.restore = function(){
        var previous = previousResults();
        //console.log(JSON.stringify(previous));
        setObject('evaluationResults', previous);
        setObject('userCount', parseInt(previous[previous.length - 1].user));
        this.userCount = getObject('userCount');
        this.evaluationResults = getObject('evaluationResults');
        console.log('new results');
        console.log(this.evaluationResults);
        
    };



    
    this.userCount = (function(value){
        if(value != null) return value; return 0;
    })(getObject('userCount'));


    this.evaluationResults = (function(value){
        if(value != null) return value; return [];
    })(getObject('evaluationResults'));


    
}
