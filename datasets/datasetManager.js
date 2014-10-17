

function datasetManager(){

    var self = this;
    var datasetsArray = [
        getDataset_t1_30(),
        getDataset_t1_60(),
        getDataset_t2_30(),
        getDataset_t2_60(),
        getDataset_t3_30(),
        getDataset_t3_60(),
        getDataset_t4_30(),
        getDataset_t4_60(),
        getDataset_test()
    ];

    this.datasets = {};
    datasetsArray.forEach(function(ds, i){
        self.datasets[ds["dataset-id"]] = ds;
    });


    function checkDuplicatedItems(dataset) {

        var dataCopy =[];
        var idsArray = [];
        console.log('**************************** Duplicated items for ' + dataset['dataset-id'] + ' ****************************');
        dataset.data.forEach(function(d, i){
            if(idsArray.indexOf(d.id) == -1){
                idsArray.push(d.id);
                dataCopy.push(d);
            }
            else{
                console.log("Id : " + d.id + "; title : " + d.title);
            }
        });

        if(dataCopy.length == dataset.data.length)
            console.log(' **** No replicated items **** ');
        else{
            console.log(' **** ' + (dataset.data.length - dataCopy.length) + ' replicated items **** ');
            console.log(JSON.stringify(dataCopy));
        }
        dataset.data = dataCopy;
    }

    this.getDatsetsIDsAndDescriptions = function(){
        var idsAndDescriptions = [];
        Object.keys(self.datasets).forEach(function(id, i){
            idsAndDescriptions.push({ id: id, description: self.datasets[id].description });
        });
        return idsAndDescriptions;
    };


    this.getDataset = function(datasetId){

        if(typeof datasetId != 'undefined' && datasetId != 'undefined'){
            var dataset = self.datasets[datasetId];
            //checkDuplicatedItems(dataset);
            //dataset.data.shuffle();
            return dataset;
        }
        // If dataset id is not specified, return array with all the datasets
        var datasetArray = [];
        Object.keys(self.datasets).forEach(function(id){
            datasetArray.push(self.datasets[id]);
        });
        return datasetArray;
    };


}
