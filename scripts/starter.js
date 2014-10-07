
var dsm;
var dataset;
var datasetId;

var stemmer = natural.PorterStemmer; //natural.LancasterStemmer;
var tokenizer = new natural.WordTokenizer;
var nounInflector = new natural.NounInflector();
var tfidf = new natural.TfIdf();

stemmer.attach();
nounInflector.attach();

//var pos = require('pos');

var allTokens = [];
var allKeywords = [];

var EVT = {};


EVT.selectDatasetChanged = function(){

    var text = "", task = "";
    datasetId = $("#select-dataset").val();

    if(datasetId != "NO_DATASET"){
        dataset = dsm.getDataset(datasetId);
        text = dataset.text;
        task = dataset.task;
    }

    $("#section-text").find("p").html(text);
    $("#section-task").find("p").html(task);
};



EVT.startButtonClicked = function(){
    if(datasetId != "NO_DATASET"){
        startVisualization();
    }
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function startVisualization(){
    // console.log("Status: Testing with Dataset " + datasetId);
    $("#eexcess_loading").fadeIn('fast');

    dataset['tool-aided'] = $("#select-tool-condition").val() || 'yes';
    dataset["data"] = getDataWithKeywords(dataset.data);
    dataset["keywords"] = getGlobalKeywords(dataset.data);

    $("input[name='dataset']").val(JSON.stringify(dataset));
    $("form").submit();
}


function getDataWithKeywords(data){

    data.forEach(function(d, i){
        var document = (d.description !== "undefined") ? (d.title +'. '+ d.description).toLocaleLowerCase() : (d.title + '. ').toLowerCase();
        tfidf.addDocument(document);    // stemming in natural
        $.merge(allTokens, tokenizer.tokenize(document));
    });

    data.forEach(function(d, i){
        d.keywords = [];

        tfidf.listTerms(i).forEach(function(item){
        //   if(d.keywords.length < 30){
               if(isNaN(item.term) && parseFloat(item.tfidf) > 0 ){
                   d.keywords.push( { 'term': item.term, 'score': item.tfidf } );
                   allKeywords.push(item.term);
                }
        //   }
        });
   });
    return data;
}


function getGlobalKeywords(data) {

    var keywords = [];

    tfidf = new natural.TfIdf();
    tfidf.addDocument(allKeywords.join(' '));

    var scoreSum = 0;
    tfidf.listTerms(0).forEach(function(item){
        keywords.push({ 'term': '', 'stem': item.term, 'score': item.tfidf, 'repeated': 0, 'variations': [] });
        scoreSum += item.tfidf;
        //console.log("term = " + item.term + ' -- score = ' + item.tfidf + ' --- sumScore = ' + scoreSum);
    });

    var scoreMean = scoreSum / keywords.length;
    var cutIndex = 0;
   /*
    console.log('****************************************************');
    console.log('scoreSum = ' + scoreSum);
    console.log('scoreMean = ' + scoreMean);
    console.log('keywords length = ' + keywords.length);
    */
    while(keywords[cutIndex].score >= scoreMean)
        cutIndex++;
    keywords.splice(cutIndex, keywords.length - cutIndex);

  //  console.log('keywords length after 1st cut = ' + keywords.length);

    keywords.forEach(function(k){
        data.forEach(function(d){
            if(d.keywords.getIndexOf(k.stem, 'term') > -1)
                k.repeated++;
        });
    });


    var sortedKeywords = [];
    var minRepetitions = parseInt(data.length * 0.08);

    keywords.forEach(function(k){
        if(k.repeated >= minRepetitions)
            sortedKeywords.splice(findIndexToInsert(k), 0, k);
    });

    function findIndexToInsert(keyword){
        var i = 0;
        while(i < sortedKeywords.length && keyword.repeated < sortedKeywords[i].repeated)
            i++;
        return i;
    }

   // console.log('keywords length after 2nd cut = ' + sortedKeywords.length);

    allTokens.forEach(function(token){
        var kIndex = sortedKeywords.getIndexOf(token.stem(), 'stem');
        if(kIndex >= 0 && sortedKeywords[kIndex].variations.indexOf(token) < 0 ){
            sortedKeywords[kIndex].variations.push(token);
        }
    });

    sortedKeywords.forEach(function(k){
        k.term = getTerm(k);
    });


    function getTerm(k){

        if(k.variations.length == 1)
            return k.variations[0];

        var stemIndex = k.variations.indexOf(k.stem);
        if(stemIndex > -1)
            return k.variations[stemIndex];

        var shortestTerm = k.variations[0];
        for(var i = 1; i < k.variations.length; i++){
            if(k.variations[i].length < shortestTerm.length)
                shortestTerm = k.variations[i];
        }
        return shortestTerm;
    }
  //  console.log('sorted keywords -- ' + sortedKeywords.length);
  //  console.log(JSON.stringify(sortedKeywords));

    return sortedKeywords
}




(function(){

    // Fill dataset select options and bind event handler
    dsm = new datasetManager();
    var datasets = dsm.getDataset();

    var datasetOptions = "<option value=\"NO_DATASET\">Select dataset...</option>";
    datasets.forEach(function(dataset){
        datasetOptions += "<option value=\"" + dataset["dataset-id"] + "\">" + dataset.description + "</option>";
    });
    $("#select-dataset").html(datasetOptions);
    datasetId = "NO_DATASET";

    // Bind event handlers for dataset select and start button
    $("#select-dataset").change(EVT.selectDatasetChanged);
    $("#start-button").click(EVT.startButtonClicked);
})();














