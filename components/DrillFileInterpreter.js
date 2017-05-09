/**
 * Created by Farkas on 2015.09.07..
 */

"use strict";

var DrillAdapter = (function () {
    return {

        inch: 25.4,
        xOffset: 40.0,
        yOffset: 40.0,
        yLength: 40.0,
        xLength: 40.0,
        neutralZPoint: 5.0,

        splitFile: function (file) {
            return file.split('\r\n');
        },

        commandStripper: function (rawCommands) {
            var tmpCommands = [];
            for (var i in rawCommands) {
                if (rawCommands[i].indexOf('X') > -1 && rawCommands[i].indexOf('Y') > -1) {
                    tmpCommands.push(rawCommands[i]);
                }
            }
            return tmpCommands;
        },

        xyConverter: function (data, measure) {
            var obj = {x: 0, y: 0};
            var delimeter = data.indexOf('Y');
            obj.x = parseFloat(data.slice(1, delimeter)) / measure * this.inch;
            obj.y = parseFloat(data.slice(delimeter + 1)) / measure * this.inch;
            return obj;
        },

        displaceByOffest: function (data, offset) {
            var calc = data;

            if (offset === '2') {
                calc.x = calc.x - this.xOffset;
            }
            if (offset === '3') {
                calc.y = calc.y - this.yOffset;
            }
            if (offset === '4') {
                calc.x = calc.x - this.xOffset;
                calc.y = calc.y - this.yOffset;
            }
            return calc;
        },

        addZMovement: function (tmparray, drillNullPoint, pcbThickness) {
            var innerArray = tmparray;
            innerArray.push({z: (parseFloat(drillNullPoint) + parseFloat(pcbThickness) + 1.0)});
            innerArray.push({z: (parseFloat(drillNullPoint) - 5.0)});
            return innerArray;
        },

        isReachable: function (data) {
            return (data.x >= 0.0 && data.y >= 0.0 && data.x <= this.xLength && data.y <= this.yLength);
        },


        excallon2Object: function (tmpCommands, data) {
            var commandArray = [{z:0.0}];
            for (var i in tmpCommands) {
                var xy = this.xyConverter(tmpCommands[i], data.measure);
                var displaced = this.displaceByOffest(xy, data.offset);
                if (this.isReachable(displaced)) {
                    commandArray.push(displaced)
                }
                commandArray = this.addZMovement(commandArray, Math.round(data.drillNullPoint), data.pcbThickness);
            }
            return commandArray;
        },

        generate: function (data) {


            var tmpFile = this.splitFile(data.drillFile);
            var tmpCommands = this.commandStripper(tmpFile);
            return this.excallon2Object(tmpCommands, {
                measure: data.measure,
                offset:data.offset,
                drillNullPoint: data.drillNullPoint,
                pcbThickness: data.pcbThickness
            })


        }
    }
}());

exports.DrillAdapter = DrillAdapter;