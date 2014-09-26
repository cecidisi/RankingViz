
var dsm;
var dataset;
var datasetId;

var EVT = {};


EVT.selectDatasetChanged = function(){

    var text = "", task = "";
    datasetId = $("#select-dataset").val();

    if(datasetId != "NO_DATASET"){
        dataset = dsm.getDataset(datasetId);
        text = dataset.text;
        task = dataset.task;
    }

    $("#section-text").find("p").text(text);
    $("#section-task").find("p").text(task);
};



EVT.startButtonClicked = function(){
    if(datasetId != "NO_DATASET")
        startVisualization();
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function startVisualization(){
    // console.log("Status: Testing with Dataset " + datasetId);
    dataset['tool-aided'] = $("#select-tool-condition").val();
    dataset = getDataWithKeywords(dataset);
    dataset["keywords"] = averageKeywordScores(dataset.data);

    $("input[name='dataset']").val(JSON.stringify(dataset));
    $("form").submit();
}


function getDataWithKeywords(testDataset){

    var stemmer = natural.PorterStemmer;
    var nounInflector = new natural.NounInflector();
    var tfidf = new natural.TfIdf();

    stemmer.attach();
    //nounInflector.atatch();
    //var allWords = [];

    testDataset.data.forEach(function(d, i){
        var document = (d.description !== "undefined") ? d.title +" "+ d.description : d.title + " ";
        document = nounInflector.singularize(document);
        //document = stemmer.tokenizeAndStem(document);
    tfidf.addDocument(document);
    });

    testDataset.data.forEach(function(d, i){
       d.keywords = [];

       tfidf.listTerms(i).forEach(function(item){
           if(d.keywords.length < 12){
               if(isNaN(item.term) && parseFloat(item.tfidf) > 0 ){
                   d.keywords.push( { 'term': item.term, 'score': item.tfidf } );
                }
           }
       });
   });

    return testDataset;
}



function averageKeywordScores(results){
/*
    var keywords = [];
    var document = "";

    results.forEach(function(d){
       d.keywords.forEach(function(k) {
           document += k.term + " ";
       });
    });

    console.log(document);

    var tfidf = new natural.TfIdf();
    tfidf.addDocument(document);

    tfidf.listTerms(0).forEach(function(item){
       if(item.tfidf > 0){
            keywords.push({'term': item.term, 'score': item.tfidf});
       }
    });
    return keywords;
    */

    var keywords = [];
    var min = Number.MAX_VALUE;

    results.forEach(function(d){
       d.keywords.forEach(function(k) {
           var kIndex = keywords.getIndexOf(k.term, 'term');
           if(kIndex == -1){
               keywords.push({ 'term': k.term, 'score': k.score, 'repeated': 1 });
           }
           else{
               var score = keywords[kIndex].score + k.score;
               var repeated = keywords[kIndex].repeated + 1;
               keywords[kIndex].score = score;
               keywords[kIndex].repeated = repeated;
           }
       });
    });

    var sortedKeywords = new Array();

    keywords.forEach(function(k, i){

        k.score = k.score / results.length;

        if(k.repeated > 1){
            var index = findIndexToInsert(k);
            if(index < sortedKeywords.length )
                sortedKeywords.splice(index, 0, k);
            else
                sortedKeywords.push(k);
        }
    });


    function findIndexInSortedKeywords(keyword){

        var center, inf = 0, sup = sortedKeywords.length - 1, wasGreater = false, wasLess = false;

        if(sortedKeywords.length == 0 || keyword.score > sortedKeywords[0].score)
            return 0;                           // keyword has the highest score and is to be inserted in the first position
        if(keyword.score < sortedKeywords[sup].score)
            return keywords.length;             // keyword has the lowest score and is to be inserted after the last item

        while(inf <= sup){
            center = parseInt((inf + sup) / 2);
            if(keyword.score == sortedKeywords[center].score)
                return center;
            else{
                if(keyword.score < sortedKeywords[center].score){
                    if(wasLess)
                        return inf;
                    sup = center - 1;
                    wasLess = true;
                }
                else{
                    if(wasGreater)
                        return sup - 1;
                    inf = center + 1;
                    wasGreater = true;
                }
            }
        }
        if(wasLess)
            return inf;
        return sup + 1;
    }

    function findIndexToInsert(keyword){

        var i = 0;
        while(i < sortedKeywords.length && keyword.repeated < sortedKeywords[i].repeated)
            i++;
        return i;
    }

/*
    sortedKeywords.forEach(function(k, i){
        console.log('index = ' + i + ' -  term = ' + k.term + ' - score = ' + k.score);
    });
    */
    return sortedKeywords;
}




$(document).ready(function(){

    // Fill dataset select options and bind event handler
    dsm = new datasetManager();
    var datasets = dsm.getDataset();
    var datasetOptions = "<option value=\"NO_DATASET\">Select dataset...</option>";

    datasets.forEach(function(dataset){
        datasetOptions += "<option value=\"" + dataset["dataset-id"] + "\">" + dataset.description + "</option>";
    });

    $("#select-dataset").html(datasetOptions);

    // Bind event handlers for dataset select and start button
    $("#select-dataset").change(EVT.selectDatasetChanged);
    $("#start-button").click(EVT.startButtonClicked);
});














