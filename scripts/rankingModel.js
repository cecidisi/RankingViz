
function RankingModel(data) {

    this.ranking = new RankingArray();
    this.previousRanking = new RankingArray();
    this.data = data;
    this.status = RANKING_STATUS.no_ranking;

    var self = this;

    /**
     *	Creates the ranking items with default values and calculates the weighted score for each selected keyword (tags in tag box)
     *
     * */
    var computeScores =  function(keywords){

//        self.previousRanking = self.ranking.slice();
        self.previousRanking.clone(self.ranking);
        self.ranking.clear();
        self.data.forEach(function(d, i) {
            self.ranking.push({
                'originalIndex': i,
                'rankingPos': 0,
                'overallScore': 0,
                'maxScore' : 0,
                'positionsChanged': 1000,
                'weightedKeywords': new Array()
            });

            var max = 0;
            keywords.forEach(function(wk, j) {
                var index = d.keywords.getIndexOf(wk.stem, 'term');

                if(index > -1){ // item contains keyword in box
                    var score = (parseFloat(d.keywords[index].score) *  parseFloat(wk.weight)).round(3);
                    max = (score > max) ? score : max;

                    self.ranking[i].overallScore = parseFloat(self.ranking[i].overallScore) + score;
                    self.ranking[i].maxScore = max;
                    self.ranking[i].weightedKeywords.push({ 'term': wk.stem, 'weightedScore': score });
                }
                else{   // item doesn't contain keyword in box => maxScore and overallScore are set to 0
                    self.ranking[i].weightedKeywords.push({ 'term': wk.stem, 'weightedScore': 0, 'maxScore': 0 });
                }
            });
            self.ranking[i].overallScore = self.ranking[i].overallScore.round(3);
        });
    };



    /**
     *	Sorts the dataRanking array by overall or maximum score, using the quicksort algorithm
     *
     * */

    var sort = function(rankingMode){

        var attr = (rankingMode == 'overall_score') ? 'overallScore' : 'maxScore';
        quicksort(self.ranking);
        assignRankingPosition(self.ranking);

        function quicksort(array){
            qsort(array, 0, array.length);
        }

        function qsort(array, begin, end) {
            if(end-1 > begin) {
                var pivot = begin +  Math.floor((end - begin) / 2); //begin + Math.floor(Math.random() * (end - begin));
                pivot = partition(array, begin, end, pivot);
                qsort(array, begin, pivot);
                qsort(array, pivot+1, end);
            }
        }

        function partition(array, begin, end, pivot) {
            var piv = array[pivot];
            array.swap(pivot, end-1);
            var store = begin;
            var ix;
            for(ix = begin; ix < end-1; ++ix) {
                //if(array[ix].overallScore >= piv.overallScore) {
                if(array[ix][attr] >= piv[attr]) {
                    array.swap(store, ix);
                    ++store;
                }
            }
            array.swap(end-1, store);
            return store;
        }

        function assignRankingPosition(array){
            var currentScore = Number.MAX_VALUE;
            var currentPos = 1;
            var itemsInCurrentPos = 0;
            array.forEach(function(d, i){
                if(d[attr] > 0){
                    if( d[attr] < currentScore ){
                        currentPos = currentPos + itemsInCurrentPos;
                        d.rankingPos = currentPos;
                        currentScore = d[attr];
                        itemsInCurrentPos = 1;
                    }
                    else{
                        d.rankingPos = currentPos;
                        itemsInCurrentPos++;
                    }
                }
                else{
                    d.rankingPos = 0;
                }
            });
        }
    };


    /**
     *	Calculates the number of positions changed by each recommendations, basing on the array "previousRanking"
     *	If there doesn't exist a previous ranking or a recommendation wasn't previously ranked, then the value 1000 is assigned
     *
     * */
    var addPositionsChanged = function(){

        self.ranking.forEach(function(d, i){

            if(self.previousRanking.length == 0){
                d['positionsChanged'] = 1000;
                d['lastIndex'] = d.originalIndex;
            }
            else{
                var originalIndex = d['originalIndex'];
                var currentRankingPos = d['rankingPos'];
                var j = 0;
                while( j < self.previousRanking.length  &&  self.previousRanking[j].originalIndex !== d['originalIndex'] )
                    j++;

                d['lastIndex'] = j;
                if(self.previousRanking[j].rankingPos === 0 )
                    d['positionsChanged'] = 1000;
                else
                    d['positionsChanged'] = self.previousRanking[j]['rankingPos'] - d['rankingPos'];
            }
        });
    };


    var setStatus =  function() {

        if(self.ranking.length == 0) {
            self.status =  RANKING_STATUS.no_ranking;
            return;
        }

        if(self.previousRanking.length == 0) {
            self.status = RANKING_STATUS.new;
            return;
        }

        if(self.ranking.length != self.previousRanking.length) {
            self.status = RANKING_STATUS.update;
            return;
        }


        for(var i = 0; i < self.ranking.length; i++){
            var j = self.ranking.getIndexOf(self.ranking[i].originalIndex, 'originalIndex');
            if(j == -1 || self.ranking[i]['rankingPos'] !== self.previousRanking[j]['rankingPos']) {
                self.status = RANKING_STATUS.update;
                return;
            }
        }
        self.status = RANKING_STATUS.unchanged;
    };





/****************************************************************************************************
 *
 *   RankingModel Prototype
 *
 ****************************************************************************************************/




    RankingModel.prototype.update = function(keywords, rankingMode) {
        computeScores(keywords);
        sort(rankingMode);
        addPositionsChanged();
        setStatus();
        return self.ranking;
    };



    RankingModel.prototype.reset = function() {
        self.previousRanking.clear();
        self.ranking.clear();
        setStatus();
    };


    RankingModel.prototype.getRanking = function() {
        return self.ranking;
    };




    RankingModel.prototype.getStatus = function() {
        return self.status;
    };



    RankingModel.prototype.getActualIndex = function(index){
        if(self.status == RANKING_STATUS.no_ranking)
            return index;
        return self.ranking[index].originalIndex;
    };


    RankingModel.prototype.getOriginalData = function() {
        return self.data;
    };


};



