/**
 * Created by Farkas on 2015.12.03..
 */
"use strict";
/**
 * connections:
 * GND - GND
 * 5V - 5V
 *
 * 1 2 3
 *
 * A E
 * B
 *
 * 2 - 1A
 * 3 -1B
 * 4 - 2A
 * 5 - 2B
 * 6 - 3A
 * 7 - 3B
 * 8 - 1E
 * 9 -2E
 * 10 -3E
 *
 * from LTP side
 * a0 - zold
 * a1 - zold fehér
 * a2 - zold
 * a3 - zold fehér
 * a4 - barna
 * a5 - barna fehér
 *
 * */
var five = require("johnny-five");
var Driver = require("./components/SingleCicleController.js");
var MoveTimer = require("./components/MoveTimer.js");
var MillAdapter = require("./components/MillFileInterpreter.js");

var board;
var driver, port1, port2, port3;
var moveTimer = Object.create(MoveTimer.MoveTimer);
var port;

var buildAndInit = function(port){
    board = new five.Board({port: "COM" + port, repl: false});
    board.on('ready', function () {

        port1 = function () {
            return {
                run: true,
                lastStep: 3,
                axisSteps: 255,
                length: 39,
                dl: 0,
                position: 0,
                nextPosition: 0,
                stepDelay: 30,
                initDelay: 30,
                state: 'undefined',
                nextTicks: 0,
                motor1: new five.Pin({
                    pin: 2,
                    mode: 1,
                    type: "digital"
                }),
                motor2: new five.Pin({
                    pin: 3,
                    mode: 1,
                    type: "digital"
                }),
                enablePin: new five.Pin({
                    pin: 8,
                    mode: 1,
                    type: "digital"
                })
            }
        }();

        port2 = function () {
            return {
                run: true,
                lastStep: 3,
                axisSteps: 371,
                length: 39.6,
                dl: 0,
                position: 0,
                nextPosition: 0,
                stepDelay: 30,
                initDelay: 30,
                state: 'undefined',
                nextTicks: 0,
                motor1: new five.Pin({
                    pin: 4,
                    mode: 1,
                    type: "digital"
                }),
                motor2: new five.Pin({
                    pin: 5,
                    mode: 1,
                    type: "digital"
                }),
                enablePin: new five.Pin({
                    pin: 9,
                    mode: 1,
                    type: "digital"
                })
            }
        }();

        port3 = function () {
            return {
                run: true,
                lastStep: 3,
                length: 39.3,
                dl: 0,
                position: 0,
                nextPosition: 0,
                stepDelay: 50,
                initDelay: 50,
                axisSteps: 222,
                state: 'undefined',
                nextTicks: 0,
                motor1: new five.Pin({
                    pin: 6,
                    mode: 1,
                    type: "digital"
                }),
                motor2: new five.Pin({
                    pin: 7,
                    mode: 1,
                    type: "digital"
                }),
                enablePin: new five.Pin({
                    pin: 10,
                    mode: 1,
                    type: "digital"
                })
            }
        }();

        driver = Object.create(Driver.Controller)
            .setup()
            .assembly(board)
            .addAxis(port1)  //x
            .addAxis(port2) //y
            .addAxis(port3); //z

        var start = driver.init();
        start.done(function () {
            process.send({init:'finished'});
        });
    });
};

function commandExecutor(commands) {
    //console.log(commands.length);
    if (commands.length > 0) {
        var command = commands.shift();
        //console.log(commands.length);
        if (command.hasOwnProperty('z')) {
            console.log('z: ' + command.z);
            driver.setPort3(command.z);
        }
        if (command.hasOwnProperty('x') && command.hasOwnProperty('y')) {
            console.log('x: ' + command.x);
            console.log('y: ' + command.y);
            var time = moveTimer.calculate(command);
            //console.log('time: '+time);
            //driver.setPort2(command.x, time);
            //driver.setPort1(command.y, time);
            driver.setTimedPort(command,time);
        }
        //console.log('execute');
        var move = driver.execute();
        move.done(function (data) {
            process.send({ step: 'step' });
            commandExecutor(commands);
        });
    } else {
        process.send({ command: 'finished' });
    }
};

buildAndInit(3);

var zPosition = 0;
process.on('message', function(m) {
    console.log(m);
    if (m.hasOwnProperty('setup')){
        zPosition += m.setup;
        driver.setPort3(zPosition);
        var step = driver.execute();
        step.done(function (data) {
            process.send({answare: data});
        });
    }
    if(m.hasOwnProperty ('start')){
        console.log(m.start);
        var commands = MillAdapter.MillAdapter.generate(m.start);
        process.send({allSteps: commands.length});
        commandExecutor(commands);
    }
});