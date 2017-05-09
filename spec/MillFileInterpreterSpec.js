/**
 * Created by Farkas on 2015.09.21..
 */

"use strict";

var MillAdapter = require("../components/MillFileInterpreter.js");

describe('Mill interpreter ',function(){
    var data;
    var interpreter;
    var file = "M03\nG04 P1\nG00 X7.5925Y8.5018\nG01 Z-0.0020\nG01 X7.4100Y8.6800\nG01 X7.1185Y8.9786";
    var rawCommands = ["M03","G04 P1","G00 X7.5925Y8.5018","G01 Z-0.002","G01 X7.4100Y8.6800"];
    var strippedCommands=["X7.5925Y8.5018","Z-0.002","X7.4100Y8.6800","X7.1185Y8.9786"];
    var commands =[{x:7.5925,y:8.5018},{z:5.44},{x:7.4100,y:8.6800},{x:7.1185,y:8.9786}];

    beforeEach(function(){
        interpreter = MillAdapter.MillAdapter;
    });

    it ('should split file',function(){
        var result = interpreter.splitFile(file);
        expect(result.length).toEqual(6);
    });

    it ('should remove unwanted commands',function(){
        var result = interpreter.commandStripper(rawCommands);
        expect(result[0]).toEqual("X7.5925Y8.5018");
        expect(result[1]).toEqual("Z-0.002");
    });

    it ('should convert xy to object',function(){
        var result = interpreter.xyConverter("X7.5925Y8.5018");
        expect(result).toEqual({x:7.5925,y:8.5018});
    });

    it('should convert -z object',function(){
        var result = interpreter.zConverter("Z-0.002",1,5.2);
        expect(result).toEqual({z:6.4});
    });

    it('should convert +z object',function(){
        var result = interpreter.zConverter("Z0.002",1,5);
        expect(result).toEqual({z:0});
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

    it('should convert string to javascript object',function(){
        data={millOffset:1,millNullPoint:5.2,copperThickness:0.2};
        var result = interpreter.gCode2Object(strippedCommands,data);
        expect(result).toEqual(commands);
    });

    it('should generate correct command list',function(){
        data={millOffset:1,millNullPoint:5.2,copperThickness:0.2,millFile:file};
        var result = interpreter.generate(data);
        expect(result).toEqual(commands);
    });

    it('should give false on unreachable coordinates',function(){
        var result = interpreter.isReachable({x:100,y:45});
        expect(result).toEqual(false);
    });

    it('should give true on reachable coordinates',function(){
        var result = interpreter.isReachable({x:10,y:4.5});
        expect(result).toEqual(true);
    });

});