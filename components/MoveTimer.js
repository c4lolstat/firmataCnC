/**
 * Created by Farkas on 2015.09.24..
 */
"use strict";

var MoveTimer = (function(){
    return {
        lastCommand:{x:0.0,y:0.0},
        feedRate:2.0, // mm/s

        getLongestDistance:function(obj){
            var a = Math.abs(this.lastCommand.x-obj.x);
            var b = Math.abs(this.lastCommand.y-obj.y);
                if (a > b) {
                    return a;
                }
                if (a < b) {
                    return b;
                }
                if (a === b) {
                    return a;
                }
        },

        calculate:function(obj){
            var distance = this.getLongestDistance(obj);
            this.lastCommand = obj;
            return Math.round(distance/this.feedRate);
        }

    }
}());

exports.MoveTimer = MoveTimer;