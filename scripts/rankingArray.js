
var RankingArray = (function() {

    function RankingArray() {

        var rankingData = Object.create(Array.prototype);
        rankingData = Array.apply(rankingData, arguments) || rankingData;
        rankingData = RankingArray.injectOwnMethods(rankingData);
        return rankingData;
    }

    RankingArray.injectOwnMethods = function(rankingData) {
        for(var method in RankingArray.prototype) {
            if(RankingArray.prototype.hasOwnProperty(method)) {
                rankingData[method] = RankingArray.prototype[method];
            }
        }
        return rankingData;
    }

    RankingArray.prototype = {

        clear: function() {
            this.splice(0, this.length);
        },

        swap: function(index1, index2){
            var tmp = this[index1];
            this[index1] = this[index2];
            this[index2] = tmp;
        },
        clone: function(rankingArray) {
            return rankingArray;
        }
    };

    return RankingArray;
})();




//var RankingArray = (function() {
//
//    function RankingArray() {
//        console.log('contructor');
//
//        for(var method in Array.prototype) {
//            console.log(method);
//            RankingArray.prototype[method] = Array.prototype[method];
//        }
//    }
//
//    RankingArray.prototype = Object.create(Array.prototype);
//
//
//
//    RankingArray.prototype = {
//        clear: function() {
//            this.splice(0, this.length);
//        },
//
//        swap: function(index1, index2){
//            var tmp = this[index1];
//            this[index1] = this[index2];
//            this[index2] = tmp;
//        }
//    };
//
//    return RankingArray;
//})();









//var foo = new RankingArray();
//console.log(foo);
//foo.push({aa:'aa', bb: 'bb'});
//console.log(foo);


