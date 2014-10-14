
var dsm;
var dataset;
var datasetId;

var stemmer = natural.PorterStemmer; //natural.LancasterStemmer;
var tokenizer = new natural.WordTokenizer;
var nounInflector = new natural.NounInflector();
var tfidf = new natural.TfIdf();
var stopWords = natural.stopwords;

stemmer.attach();
nounInflector.attach();

var pos = new Pos();
var lexer = new pos.Lexer();
var tagger = new pos.Tagger();

var allTokens = [];
var allKeywords = [];

var keywordsArray = [];

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
    console.log("Status: Testing with Dataset " + datasetId);
    $("#eexcess_loading").fadeIn('fast');

    dataset['tool-aided'] = $("#select-tool-condition").val() || 'yes';
    dataset["data"] = getDataWithKeywords(dataset.data);
    dataset["keywords"] = getGlobalKeywords(dataset.data);

    $("input[name='dataset']").val(JSON.stringify(dataset));
    $("form").submit();
}



function getDataWithKeywords(data){

    data.forEach(function(d, i){

        d.title = d.title.clean();
        d.description = d.description.clean();
        var document = (d.description !== "undefined") ? d.title +'. '+ d.description : d.title;
        document = document/*.replace(/our/g, 'or').replace(/IT/g, 'I.T.')*/.replace(/[-=]/g, ' ').replace(/[()\"]/g,'');
        var words = lexer.lex(document);
        var taggedWords = tagger.tag(words);
        document = '';

        taggedWords.forEach(function(tw){
            switch(tw[1]){
                case 'NN':
                case 'NNP':
                    document += tw[0] + ' '; break;
                case 'NNS':
                    document += tw[0].singularizeNoun() + ' '; break;
            }
        });

        tfidf.addDocument(document);    // stemming in natural
        $.merge(allTokens, tokenizer.tokenize(document));
    });

    data.forEach(function(d, i){
        d.keywords = [];
        var scores = 0;
        tfidf.listTerms(i).forEach(function(item){
            if(isNaN(item.term) && parseFloat(item.tfidf) > 0 ){
                d.keywords.push({ 'term': item.term, 'score': item.tfidf });
               // allKeywords.push(item.term);
                scores += item.tfidf;
                if(i==28){
                    console.log(item.term);
                }
            }
        });

        var mean = scores / d.keywords.length;
        for(var j = 0; j < d.keywords.length; ++j){
            var kIndex = keywordsArray.getIndexOf(d.keywords[j].term, 'stem')
            if(d.keywords[j].score >= mean && kIndex == -1)
                keywordsArray.push({ 'stem': d.keywords[j].term, 'term': '', 'repeated': 1, 'variations': [] });
            else if(kIndex > -1)
                keywordsArray[kIndex].repeated++;
        }
    });

    return data;
}




function getGlobalKeywords(data) {
    var sortedKeywords = [];
    var minRepetitions = parseInt(data.length * 0.05);

    //console.log('keywords array -- ' + keywordsArray.length);
    keywordsArray.forEach(function(k){
        if(k.repeated >= minRepetitions)
            sortedKeywords.splice(findIndexToInsert(sortedKeywords, k), 0, k);
    });

    var words = lexer.lex(allTokens.join(' '));
    var taggedTokens = tagger.tag(words);

    taggedTokens.forEach(function(t){
        var token = (t[1] != 'NNS') ? t[0] : t[0].singularizeNoun();
        var kIndex = sortedKeywords.getIndexOf(token.stem(), 'stem');
        if(kIndex >= 0 && stopWords.indexOf(token.toLowerCase()) == -1){
            var vIndex = sortedKeywords[kIndex].variations.getIndexOf(token, 'term');
            if(vIndex < 0)
                sortedKeywords[kIndex].variations.push({ 'term': token, 'repeated': 1 });
            else
                sortedKeywords[kIndex].variations[vIndex].repeated++;
        }
    });

    sortedKeywords.forEach(function(k){
        k.term = getTerm(k);
    });
    console.log('sorted keywords -- ' + sortedKeywords.length);
 //   console.log(JSON.stringify(sortedKeywords));

    return sortedKeywords
}




function findIndexToInsert(kArray, keyword){
    var i = 0;
    while(i < kArray.length && keyword.repeated < kArray[i].repeated)
        i++;
    return i;
}



function getTerm(k){
    if(k.variations.length == 1)
        return k.variations[0].term;

    if(k.variations.length == 2 && k.variations[0].term.toLowerCase() === k.variations[0].term.toLowerCase())
        return k.variations[0].term.toLowerCase();

    var repetitions = 0;
    for(var i = 0; i < k.variations.length; ++i)
        repetitions += k.variations[i].repeated;
    for(var i = 0; i < k.variations.length; ++i)
        if(k.variations[i].repeated >= parseInt(repetitions * 0.75))
            return k.variations[i].term;

    for(var i = 0; i < k.variations.length; ++i)
        if(k.variations[i].term.match(/ion$/) || k.variations[i].term.match(/ment$/) || k.variations[i].term.match(/ism$/))
            return k.variations[i].term.toLowerCase();

    var stemIndex = k.variations.getIndexOf(k.stem, 'term');
    if(stemIndex > -1)
        return k.variations[stemIndex].term;

    var shortestTerm = k.variations[0].term;
    for(var i = 1; i < k.variations.length; i++){
        if(k.variations[i].term.length < shortestTerm.length)
            shortestTerm = k.variations[i].term;
    }
    return shortestTerm.toLowerCase();
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














