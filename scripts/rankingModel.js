
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
    var computeScores =  function(_data, keywords){

        var ranking = new RankingArray();
        _data.forEach(function(d, i) {
            ranking.addEmptyElement();

            var max = 0;
            keywords.forEach(function(wk, j) {
                var index = d.keywords.getIndexOf(wk.stem, 'term');

                if(index > -1){ // item contains keyword in box
                    var score = (parseFloat(d.keywords[index].score) *  parseFloat(wk.weight)).round(3);
                    max = (score > max) ? score : max;

                    ranking[i].overallScore = parseFloat(ranking[i].overallScore) + score;
                    ranking[i].maxScore = max;
                    ranking[i].weightedKeywords.push({ 'term': wk.stem, 'weightedScore': score });
                }
                else{   // item doesn't contain keyword in box => maxScore and overallScore are set to 0
                    ranking[i].weightedKeywords.push({ 'term': wk.stem, 'weightedScore': 0, 'maxScore': 0 });
                }
            });
            ranking[i].overallScore = ranking[i].overallScore.round(3);
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




