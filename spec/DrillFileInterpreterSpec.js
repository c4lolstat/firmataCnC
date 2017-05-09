/**
 * Created by Farkas on 2015.09.13..
 */

"use strict";

var DrillAdapter = require("../components/DrillFileInterpreter.js");

describe('drill interpreter',function(){
    var data;
    var interpreter;
    var file = "%\r\n48\r\nM72\r\nX31500Y11500\r\nX71500Y11500\r\nX46500Y56500";
    var rawCommands =["%","48","M72","X31500Y11500"];
    var strippedCommands= ["X31500Y11500","X46500Y56500"];
    var commands =[{z:0.0},{x:8.001,y:2.921},{z:12.52},{z:5},{x:18.160999999999998,y:2.921},{z:12.52},{z:5},{x:11.811,y:14.350999999999997},{z:12.52},{z:5}];

    beforeEach(function(){
    interpreter = DrillAdapter.DrillAdapter;
    });

    it('should split the file to lines',function(){
        var result = interpreter.splitFile(file);
        expect(result.length).toEqual(6);
    });

    it ('should remove unwanted commands',function(){
        var result = interpreter.commandStripper(rawCommands);
        expect(result[0]).toEqual("X31500Y11500");
    });

    it ('should convert xy to object',function(){
        var result = interpreter.xyConverter("X31500Y11500",100000);
        expect(result).toEqual({x:8.001,y:2.921});
    });

    it('should displace by offset 1 ',function(){
        var result = interpreter.displaceByOffest({x:50,y:50},'1');
        expect(result).toEqual({x:50,y:50});
    });

    it('should displace by offset 2 ',function(){
        var result = interpreter.displaceByOffest({x:50,y:50},'2');
        expect(result).toEqual({x:10,y:50});
    });

    it('should displace by offset 3 ',function(){
        var result = interpreter.displaceByOffest({x:50,y:50},'3');
        expect(result).toEqual({x:50,y:10});
    });

    it('should displace by offset 4 ',function(){
        var result = interpreter.displaceByOffest({x:50,y:50},'4');
        expect(result).toEqual({x:10,y:10});
    });

    it('should add z movement',function(){
        var tmp = [];
        var result = interpreter.addZMovement(tmp,10.0,1.52);
        expect(result.length).toEqual(2);
    });

    it('should give false on unreachable coordinates',function(){
        var result = interpreter.isReachable({x:100,y:45});
        expect(result).toEqual(false);
    });

    it('should give true on reachable coordinates',function(){
        var result = interpreter.isReachable({x:10,y:4.5});
        expect(result).toEqual(true);
    });

    it('should convert string to javascript object',function(){
        data={measure:100000,drillOffset:1,drillNullPoint:10,pcbThickness:1.52};
        var result = interpreter.excallon2Object(strippedCommands,data);
        expect(result.length).toEqual(7);
    });

    it('should generate correct command list',function(){
        data={measure:100000,drillOffset:1,drillNullPoint:10,pcbThickness:1.52,drillFile:file};
        var result = interpreter.generate(data);
        expect(result).toEqual(commands);
    });

});