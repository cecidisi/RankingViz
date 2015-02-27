
var RankingModel = (function(){

    function RankingModel(data) {
        this.ranking = new RankingArray();
        this.previousRanking = new RankingArray();
        this.data = data;
        this.status = RANKING_STATUS.no_ranking;
        this.mode = RANKING_MODE.overall_score;
    }


    /**
     *	Creates the ranking items with default values and calculates the weighted score for each selected keyword (tags in tag box)
     *
     * */
    var computeScores =  function(_data, query){

        var queryNorm = Math.sqrt(query.length);        // |q|
        console.log('|q| = ' + queryNorm);
        var unitVectorQueryTerm = parseFloat(1.00 / queryNorm);                // term score in query unit vector = 1/|q|

        var ranking = new RankingArray();
        _data.forEach(function(d, i) {
            ranking.addEmptyElement();

            var documentNorm = 0;
            query.forEach(function(q){
                documentNorm += Math.pow(d.keywords[q.stem], 2);
            });

            documentNorm = Math.sqrt(documentNorm) || 0;

            var divider = documentNorm * queryNorm;

            if(i<2)
                console.log('*************   Doc ' + i);

            var max = 0;
            query.forEach(function(q) {
                var score = 0;
                if(d.keywords[q.stem]){ // item contains keyword in box
                    var weightedQueryTerm = unitVectorQueryTerm * parseFloat(q.weight);
                    score = ((parseFloat(d.keywords[q.stem]) * weightedQueryTerm) / documentNorm).round(3) || 0;
                    max = (score > max) ? score : max;

                    if(i < 2){
                        console.log('-------------------------------------');
                        console.log(q.stem + ' = ' + d.keywords[q.stem]);
                        console.log('query term UV = ' + unitVectorQueryTerm);
                        console.log('term weight = ' + q.weight);
                        console.log('document norm = ' + documentNorm);
                        console.log('score = ' + score);


                    }
                }   // if item doesn't contain query term => maxScore and overallScore are not changed
                ranking[i].overallScore = parseFloat(ranking[i].overallScore) + score;
                ranking[i].maxScore = max;
                ranking[i].weightedKeywords.push({ term: q.term, stem: q.stem, weightedScore: score });






            });
            //ranking[i].overallScore = ranking[i].overallScore.round(3);
        });

        return ranking;
    };




    var updateStatus =  function(_ranking, _previousRanking) {

        if(_ranking.length == 0)
            return RANKING_STATUS.no_ranking;

        if(_previousRanking.length == 0)
            return RANKING_STATUS.new;

        if(_ranking.length != _previousRanking.length)
            return RANKING_STATUS.update;


        for(var i = 0; i < _ranking.length; i++){
            var j = _ranking.getIndexOf(_ranking[i].originalIndex, 'originalIndex');
            if(j == -1 || _ranking[i]['rankingPos'] !== _previousRanking[j]['rankingPos'])
                return RANKING_STATUS.update;
        }
        return RANKING_STATUS.unchanged;
    };



/****************************************************************************************************
 *
 *   RankingModel Prototype
 *
 ****************************************************************************************************/


    RankingModel.prototype = {
        update: function(keywords, rankingMode) {
            this.mode = rankingMode || RANKING_MODE.overall_score;
            this.previousRanking = this.ranking.clone();
            this.ranking = computeScores(this.data, keywords).sortBy(this.mode).addPositionsChanged(this.previousRanking);
            this.status = updateStatus(this.ranking, this.previousRanking);
            console.log('RANKING');
            console.log(this.ranking);
            return this.ranking;
        },

        reset: function() {
            this.previousRanking.clear();
            this.ranking.clear();
            this.status = updateStatus(this);
        },

        getRanking: function() {
            return this.ranking;
        },

        getStatus: function() {
            return this.status;
        },

        getOriginalData: function() {
            return this.data;
        },

        getMode: function() {
            return this.mode;
        },

        getActualIndex: function(index){
            if(this.status == RANKING_STATUS.no_ranking)
                return index;
            return this.ranking[index].originalIndex;
        }
    };


    return RankingModel;

})();




