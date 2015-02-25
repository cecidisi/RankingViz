function KeywordExtractor(documentCorpora) {

    this.allTokens = [];
    this.keywordsArray = [];

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













};
