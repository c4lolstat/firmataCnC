/**
 * Created by Farkas on 2015.06.07..
 */

"use strict";
var five = require("johnny-five");
var q = require("q");

var Controller = (function () {
    return {

        handleUndefinedState: function (i) {
            if (this.ports[i].state === 'undefined') {
                if (this.far[i] === 0) {
                    this.ports[i].state = 'initStart';
                } else {
                    this.ports[i].lastStep = (this.ports[i].lastStep - 1 < 0) ? 3 : (this.ports[i].lastStep - 1);
                }
            }
        },

        handleInitStartState: function (i) {
            if (this.ports[i].state === 'undefined') {
                if (this.near[i] === 0) {
                    this.ports[i].state = 'initialized';
                    this.ports[i].position = 0;
                    this.ports[i].nextPosition = 0;
                    this.ports[i].dl = this.ports[i].length / this.ports[i].axisSteps;
                    this.ports[i].run = false;
                }                 else {
                    //this.ports[i].axisSteps++;
                    this.ports[i].lastStep = (this.ports[i].lastStep + 1 > 3) ? 0 : (this.ports[i].lastStep + 1);
                }
            }
        },

        handleInitializedState: function (i) {
            if (this.ports[i].state === 'initialized') {
                if ( this.ports[i].nextPosition < 0 || this.ports[i].position === this.ports[i].nextPosition) {
                    this.ports[i].run = false;
                } else {
                    if (this.ports[i].position < this.ports[i].nextPosition) {
                        this.ports[i].lastStep = (this.ports[i].lastStep - 1 < 0) ? 3 : (this.ports[i].lastStep - 1);
                        this.ports[i].position += 1;
                    }

                    if (this.ports[i].position > this.ports[i].nextPosition) {
                        this.ports[i].lastStep = (this.ports[i].lastStep + 1 > 3) ? 0 : (this.ports[i].lastStep + 1);
                        this.ports[i].position -= 1;
                    }
                }
            }
        },

        mainLoop: function () {
            var self = this;
            this.time += this.stepTime;
            for (var i in this.ports) {
                if (this.ports[i].run) {
                    if (new Date().getTime() >= this.ports[i].nextTicks) {

                        this.handleInitializedState(i);
                        //this.handleUndefinedState(i);
                        this.handleInitStartState(i);

                        if (this.ports[i].lastStep === 0) {
                            this.ports[i].motor1.high();
                            this.ports[i].motor2.low();
                        }
                        if (this.ports[i].lastStep === 1) {
                            this.ports[i].motor1.high();
                            this.ports[i].motor2.high();
                        }
                        if (this.ports[i].lastStep === 2) {
                            this.ports[i].motor1.low();
                            this.ports[i].motor2.high();
                        }
                        if (this.ports[i].lastStep === 3) {
                            this.ports[i].motor1.low();
                            this.ports[i].motor2.low();
                        }

                        this.ports[i].nextTicks = new Date().getTime() + this.ports[i].stepDelay
                    }
                }
            }

            if (!this.ports[0].run && !this.ports[1].run && !this.ports[2].run) {
                this.disablePorts();
                this.eventEmitter.resolve(this.ports[1].position * this.ports[1].dl + ',' + this.ports[0].position * this.ports[0].dl + ',' + this.ports[2].position * this.ports[2].dl);
                //console.log(this.ports[1].position + ',' + this.ports[0].position + ',' + this.ports[2].position);
                clearTimeout(this.loop);
            } else {
                var diff = (new Date().getTime() - self.start) - self.time;
                this.loop = setTimeout(function () {
                    self.mainLoop();
                }, self.stepTime - diff);
            }
        },

        disablePorts: function () {
            for (var i in this.ports) {
                this.ports[i].enablePin.low();
            }
        },

        enableRunningPorts: function () {
            for (var i in this.ports) {
                if (this.ports[i].run) {
                    this.ports[i].enablePin.high();
                }
            }
        },

        init: function () {
            this.enableRunningPorts();
            this.start = new Date().getTime();
            this.time = 0;
            this.mainLoop();
            return this.eventEmitter.promise;
        },

        addAxis: function (port) {
            this.ports.push(port);
            return this;
        },

        //setPort1: function (position, time) {
        //    //TODO handle 0 movement -> infinite time
        //    this.ports[0].run = true;
        //    this.ports[0].nextPosition = Math.round(position / this.ports[0].dl);
        //    var deltay = (this.ports[0].nextPosition - this.ports[0].position) === 0 ? 1 : (this.ports[0].nextPosition - this.ports[0].position);
        //    this.ports[0].stepDelay = Math.round(Math.abs(time / delta) * 1000);
        //
        //    console.log('d pos1: ' + (this.ports[0].nextPosition - this.ports[0].position));
        //    console.log('delay1: ' + this.ports[0].stepDelay);
        //    //console.log('time1: ' + (this.ports[0].stepDelay*(this.ports[0].nextPosition - this.ports[0].position)));
        //},
        //
        //setPort2: function (position, time) {
        //    this.ports[1].run = true;
        //    this.ports[1].nextPosition = Math.round(position / this.ports[1].dl);
        //    var deltax = (this.ports[1].nextPosition - this.ports[1].position) === 0 ? 1 : (this.ports[1].nextPosition - this.ports[1].position);
        //    this.ports[1].stepDelay = Math.round(Math.abs(time / delta) * 1000);
        //
        //    console.log('d pos2: ' + (this.ports[1].nextPosition - this.ports[1].position));
        //    console.log('delay2: ' + this.ports[1].stepDelay);
        //    //console.log('time2: ' + (this.ports[1].stepDelay*(this.ports[1].nextPosition - this.ports[1].position)));
        //},

        setPort3: function (position) {
            this.ports[2].run = true;
            this.ports[2].nextPosition = Math.ceil(position / this.ports[2].dl);
        },

        setTimedPort: function (command, time) {

            this.ports[0].nextPosition = Math.ceil(command.y / this.ports[0].dl);
            this.ports[1].nextPosition = Math.ceil(command.x / this.ports[1].dl);

            var deltay = (this.ports[0].nextPosition - this.ports[0].position);
            var deltax = (this.ports[1].nextPosition - this.ports[1].position);

            if (deltax === 0 && deltay != 0) {
                this.ports[0].run = true;
                this.ports[0].stepDelay = Math.round(Math.abs(time / deltay) );
            }

            if (deltay === 0 && deltax != 0) {
                this.ports[1].run = true;
                this.ports[1].stepDelay = Math.round(Math.abs(time / deltax) );
            }

            if (deltax != 0 && deltay != 0) {
                this.ports[0].run = true;
                this.ports[1].run = true;
                this.ports[0].stepDelay = Math.round(Math.abs(time / deltay));
                this.ports[1].stepDelay = Math.round(Math.abs(deltay * this.ports[0].stepDelay / deltax));
            }
            console.log('d pos1: ' + (this.ports[0].nextPosition - this.ports[0].position));
            //console.log('delay1: ' + this.ports[0].stepDelay);
            console.log('d pos2: ' + (this.ports[1].nextPosition - this.ports[1].position));
            //console.log('delay2: ' + this.ports[1].stepDelay);
        },

        execute: function () {
            this.enableRunningPorts();
            this.eventEmitter = q.defer();
            this.start = new Date().getTime();
            this.time = 0;
            this.mainLoop();
            return this.eventEmitter.promise;
        },

        setup: function () {
            this.loop = {};
            this.ports = [];
            this.eventEmitter = q.defer();
            this.stepTime = 25;
            this.near = [10, 10, 10];
            this.far = [10, 10, 10];
            return this;
        },

        assembly: function (board) {
            var self = this;
            this.board = board;

            //var a0 = new five.Button({
            //    pin: "A0",
            //    isPullup: true
            //});
            //
            //a0.on("down", function () {
            //    self.near[0]=0;
            //});
            //
            //a0.on("up", function () {
            //    self.near[0]=1;
            //});
            //
            //var a1 = new five.Button({
            //    pin: "A1",
            //    isPullup: true
            //});
            //
            //a1.on("down", function () {
            //    self.far[0]=0;
            //});
            //
            //a1.on("up", function () {
            //    self.far[0]=1;
            //});
            //
            //var a2 = new five.Button({
            //    pin: "A2",
            //    isPullup: true
            //});
            //
            //a2.on("down", function () {
            //    self.near[1]=0;
            //});
            //
            //a2.on("up", function () {
            //    self.near[1]=1;
            //});
            //
            //var a3 = new five.Button({
            //    pin: "A3",
            //    isPullup: true
            //});
            //
            //a3.on("down", function () {
            //    self.far[1]=0;
            //});
            //
            //a3.on("up", function () {
            //    self.far[1]=1;
            //});
            //
            //var a4 = new five.Button({
            //    pin: "A4",
            //    isPullup: true
            //});
            //
            //a4.on("down", function () {
            //    self.near[2]=0;
            //});
            //
            //a4.on("up", function () {
            //    self.near[2]=1;
            //});
            //
            //var a5 = new five.Button({
            //    pin: "A5",
            //    isPullup: true
            //});
            //
            //a5.on("down", function () {
            //    self.far[2]=0;
            //});
            //
            //a5.on("up", function () {
            //    self.far[2]=1;
            //});

            this.board.pinMode(14, five.Pin.INPUT);
            this.board.digitalWrite(14, 1);  //pull up resistor
            this.board.pinMode(15, five.Pin.INPUT);
            this.board.digitalWrite(15, 1);
            this.board.pinMode(16, five.Pin.INPUT);
            this.board.digitalWrite(16, 1);
            this.board.pinMode(17, five.Pin.INPUT);
            this.board.digitalWrite(17, 1);
            this.board.pinMode(18, five.Pin.INPUT);
            this.board.digitalWrite(18, 1);
            this.board.pinMode(19, five.Pin.INPUT);
            this.board.digitalWrite(19, 1);

            this.board.digitalRead(14, function (voltage) {
                self.near[0] = voltage;
            });
            this.board.digitalRead(15, function (voltage) {
                self.far[0] = voltage;
            });
            this.board.digitalRead(16, function (voltage) {
                self.near[1] = voltage;
            });
            this.board.digitalRead(17, function (voltage) {
                self.far[1] = voltage;
            });
            this.board.digitalRead(18, function (voltage) {
                self.near[2] = voltage;
            });
            this.board.digitalRead(19, function (voltage) {
                self.far[2] = voltage;
            });

            return this;
        }

    }
}());

exports.Controller = Controller;