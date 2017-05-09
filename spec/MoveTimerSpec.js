/**
 * Created by Farkas on 2015.09.24..
 */

"use strict";

var MoveTimer = require("../components/MoveTimer.js");

describe('Move timer',function(){

    var timer;

    beforeEach(function(){
        timer = MoveTimer.MoveTimer;
    });

    it('should calculate the longest distance between old and new command when all positive',function(){
        var result = timer.getLongestDistance({x:10,y:5});
        expect(result).toEqual(10);
    });

    it('should calculate the longest distance between old and new command when all negative',function(){
        var result = timer.getLongestDistance({x:-5,y:-10});
        expect(result).toEqual(10);
    });

    it('should calculate the longest distance between old and new command when mixed1',function(){
        var result = timer.getLongestDistance({x:-5,y:5});
        expect(result).toEqual(5);
    });

    it('should calculate the longest distance between old and new command when mixed2',function(){
        var result = timer.getLongestDistance({x:5,y:-5});
        expect(result).toEqual(5);
    });

    it('should return with time',function(){
        var result = timer.calculate({x:6.88,y:3.89});
        expect(result).toEqual(3.44);

    });

    it('should store last command',function(){
        timer.calculate({x:6.88,y:3.89});
        expect(timer.lastCommand).toEqual({x:6.88,y:3.89});
    });

});