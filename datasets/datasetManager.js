

function datasetManager(){

    var datasets = {
        "T1-30" : getDataset_t1_30(),
        "T1-60" : getDataset_t1_60(),
        "T2-60" : getDataset_t2_60(),
        "T3-60" : getDataset_t3_60(),
        "T4-60" : getDataset_t4_60(),
        "T5-60" : getDataset_t5_60(),
        "T6-60" : getDataset_t6_60()
    };


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


    this.getDataset = function(datasetId){

        if(typeof datasetId != 'undefined' && datasetId != 'undefined'){
            var dataset = datasets[datasetId];
            checkDuplicatedItems(dataset);
            //dataset.data.shuffle();
            return dataset;
        }
        // If dataset id is not specified, return array with all the datasets
        var datasetIds = Object.keys(datasets);
        var datasetArray = [];
        datasetIds.forEach(function(id){
            datasetArray.push(datasets[id]);
        });
        return datasetArray;
    };


}
