/**
 * Created by Farkas on 2015.09.21..
 */

"use strict";

var MillAdapter = (function () {
            return {

                xOffset:39.0,
                yOffset:39.6,
                yLength:39.6,
                xLength:39.0,
                zClearence:10,
                lastPosition:{x:0,y:0},

                splitFile: function (file) {
                    return file.split("\n");
                },

                commandStripper: function (rawCommands) {
                    var tmpCommands = [];
                    for (var i in rawCommands) {
                        if (rawCommands[i].indexOf('G00') > -1) {
                            tmpCommands.push(rawCommands[i].split(' ')[1]);
                        }
                        if (rawCommands[i].indexOf('G01') > -1) {
                            tmpCommands.push(rawCommands[i].split(' ')[1]);

                        }
                    }
                    return tmpCommands;
                },

                xyConverter: function (data) {
                    var obj = {x: 0, y: 0};
                    var delimeter = data.indexOf('Y');
                    obj.y = parseFloat(data.slice(1, delimeter));
                    obj.x = parseFloat(data.slice(delimeter + 1));
                    return obj;
                },

                zConverter: function (data, nullPoint) {
                    var obj = {z: 0};
                    obj.z = (parseFloat(data.slice(1)) <= 0) ? nullPoint : nullPoint - this.zClearence;
                    return obj;
                },

                displaceByOffest: function (data, offset) {
                    var calc = data;

                    if (offset === '2') {
                        calc.x = calc.x - this.xOffset;
                    }
                    if (offset === '3') {
                        calc.x = calc.x - this.xOffset;
                        calc.y = calc.y - this.yOffset;
                    }
                    if (offset === '4') {
                        calc.y = calc.y - this.yOffset;
                    }

                    return calc;
                },

                interpolate:function(displaced){
                    var tmpArray = [];
                    var dx = displaced.x -this.lastPosition.x;
                    var dy = displaced.y - this.lastPosition.y;

                    var max = (Math.abs(dx) >= Math.abs(dy)) ? Math.abs(dx) : Math.abs(dy);

                    var steps = Math.round(max)*2;
                    dx=dx/steps;
                    dy=dy/steps;

                    for (var i = 0 ; i <= steps; i++){
                        var tmp = {x:this.lastPosition.x+i*dx,y:this.lastPosition.y+i*dy};
                        if (this.isReachable(tmp)) {
                            tmpArray.push(tmp);
                        }
                    }

                    //tmpArray.push(displaced);
                    this.lastPosition=displaced;

                    return tmpArray;
                },

                gCode2Object: function (tmpCommands, data) {
                    var commandArray = [];
                    for (var i in tmpCommands) {
                        if (tmpCommands[i].indexOf('X') > -1 && tmpCommands[i].indexOf('Y') > -1) {
                            var xy = this.xyConverter(tmpCommands[i]);
                            var displaced = this.displaceByOffest(xy, data.offset);
                            if (this.isReachable(displaced)) {
                                commandArray=commandArray.concat(this.interpolate(displaced));
                            }
                        }
                        else {
                            var z = this.zConverter(tmpCommands[i], parseFloat(data.millNullPoint));
                            commandArray.push(z);
                            commandArray.push({x:0,y:0});
                        }
                    }
                    return commandArray;
                },

                isReachable: function (data) {
                    return (data.x >= 0.0 && data.y >= 0.0 && data.x <= this.xLength && data.y <= this.yLength);
                },

                generate: function (data) {
                    var tmpFile = this.splitFile(data.millFile);
                    var tmpCommands = this.commandStripper(tmpFile);
                    return this.gCode2Object(tmpCommands, {
                        offset: data.offset,
                        millNullPoint: data.millNullPoint
                    });
                }
            }
}());

exports.MillAdapter = MillAdapter;