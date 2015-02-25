function KeywordExtractor(argument) {


    var collection = [],
        allTokens = [],             // array of all non-stemmed words in the collection

    var documentKeywords = new Array(),
        collectionKeywords = [];

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

    var _this = this;


    var extractDocumentKeywords = function() {

        //POS tagging
        collection.forEach(function(d, i) {
            d.taggedWords = tagger.tag(lexer.lex(d.text));
        });

        // Find out which adjectives are potentially important and worth keeping
        var keyAdjectives = getKeyAdjectives(collection);

        // Create each item's document to be processed by tf*idf
        // Save all selected words in allTokens (nouns and key adjectives)
        collection.forEach(function(d) {
            var document = getFilteredDocument(d);
            tfidf.addDocument(document.map(function(term){ return term.stem(); }).join(' '));    // argument = string of stemmed terms in document array
            $.merge(allTokens, document);  // all words without stemming
        });


        // Save keywords for each document
        collection.forEach(function(d, i){
            documentKeywords.push(getDocumentKeywords(i));
        });
    }



    function getKeyAdjectives(_collection) {

        var candidateAdjectives = [],
            keyAdjectives = [];

        _collection.forEach(function(d, i) {
            // Find out which adjectives are potentially important and worth keeping
            d.taggedWords.forEach(function(tw){
                if(tw[1] == 'JJ'){
                    var adjIndex = candidateAdjectives.getIndexOf(tw[0].toLowerCase(), 'adj');
                    if(adjIndex == -1)
                        candidateAdjectives.push({ 'adj': tw[0].toLowerCase(), 'repeated': 1 });
                    else
                        candidateAdjectives[adjIndex].repeated++;
                }
            });
        });

        candidateAdjectives.forEach(function(ca){
            if(ca.repeated >= parseInt(_collection.length * 0.5))
                keyAdjectives.push(ca.adj);
        });
        return keyAdjectives;
    }


    // Filter out meaningless words, keeping only nouns (plurals are singularized) and key adjectives
    function getFilteredDocument(d) {
        var document = [];
        d.taggedWords.forEach(function(tw){
            switch(tw[1]){
                case 'NN':          // singular noun
                    tw[0] = (tw[0].isAllUpperCase()) ? tw[0] : tw[0].toLowerCase();
                    document.push(tw[0]); break;
                case 'NNS':         // plural noun
                    document.push(tw[0].toLowerCase().singularizeNoun());
                    break;
                case 'NNP':         // proper noun
                    tw[0] = (tagger.wordInLexicon(tw[0].toLowerCase())) ? tw[0].toLowerCase().singularizeNoun() : tw[0];
                    document.push(tw[0]); break;
                case 'JJ':
                    if(keyAdjectives.indexOf(tw[0]) > -1)
                        document.push(tw[0]); break;
            }
        });
        return document;
    }


    function getDocumentKeywords(dIndex) {
        var aDocumentKeywords = new Array();

        tfidf.listTerms(dIndex).forEach(function(item){
            if(isNaN(item.term) && parseFloat(item.tfidf) > 0 ){
                aDocumentKeywords.push({ 'term': item.term, 'score': item.tfidf });
            }
        });
        return aDocumentKeywords;
    }



    /////////////////////////////////////////////////////////////////////////////

    var extractGlobalKeywords = function() {
        var sortedKeywords = [];
        var minRepetitions = (parseInt(data.length * 0.05) > 1) ? parseInt(data.length * 0.05) : 2;
        var candidateKeywords = getCandidateKeywords(documentKeywords);

        candidateKeywords.forEach(function(k){
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


    function getCandidateKeywords(_documentKeywords) {

        var _candidateKeywords = [];
        _documentKeywords.forEach(function(aDocumentKeywords){

            var sum = 0;
            aDocumentKeywords.forEach(function(k){
                sum += k.score;
            }):

            var mean = sum / aDocumentKeywords.length;
            aDocumentKeywords.forEach(function(k){
                var kIndex = _candidateKeywords.getIndexOf(k.term, 'stem')
                if(k.score >= mean && kIndex == -1)
                    _candidateKeywords.push({ 'stem': k.term, 'term': '', 'repeated': 1, 'variations': [] });
                else if(kIndex > -1)
                    _candidateKeywords[kIndex].repeated++;
            });
        });
        return _candidateKeywords;
    }



    function findIndexToInsert(kArray, keyword){
        var i = 0;
        while(i < kArray.length && keyword.repeated < kArray[i].repeated)
            i++;
        return i;
    }



    function getTerm(k){
        // Only one variations
        if(k.variations.length == 1)
            return k.variations[0].term;

        // 2 variations, one in lower case and the other starting in uppercase --> return in lower case
        if(k.variations.length == 2 && !k.variations[0].term.isAllUpperCase() && !k.variations[1].term.isAllUpperCase() && k.variations[0].term.toLowerCase() === k.variations[1].term.toLowerCase())
            return k.variations[0].term.toLowerCase();

        // One variation is repeated >= 75%
        var repetitions = 0;
        for(var i = 0; i < k.variations.length; ++i)
            repetitions += k.variations[i].repeated;

        for(var i = 0; i < k.variations.length; ++i)
            if(k.variations[i].repeated >= parseInt(repetitions * 0.75))
                return k.variations[i].term;

        // One variation end in 'ion', 'ment', 'ism' or 'ty'
        for(var i = 0; i < k.variations.length; ++i)
            if(k.variations[i].term.match(/ion$/) || k.variations[i].term.match(/ment$/) || k.variations[i].term.match(/ism$/) || k.variations[i].term.match(/ty$/))
                return k.variations[i].term.toLowerCase();

        // One variation == keyword stem
        var stemIndex = k.variations.getIndexOf(k.stem, 'term');
        if(stemIndex > -1)
            return k.variations[stemIndex].term;

        // Pick shortest variation
        var shortestTerm = k.variations[0].term;
        for(var i = 1; i < k.variations.length; i++){
            if(k.variations[i].term.length < shortestTerm.length)
                shortestTerm = k.variations[i].term;
        }
        return shortestTerm.toLowerCase();
    }




/*****************************************************************************************************************************************************************************
*
*   PROTOTYPE
*
*****************************************************************************************************************************************************************************/

    KeywordExtractor.prototype = {
        addDocument: function(document) {
            document = (!Array.isArray(document)) ? document : document.join(' ');
            collection.push({ text: document });
        },
        processCollection: function() {
            extractDocumentKeywords();
            extractGlobalKeywords();

        },
        listDocumentKeywords: function(index) {
            return documentKeywords[index];
        },
        getCollectionKeywords: function() {
            return collectionKeywords;
        }

    };


};
