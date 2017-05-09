"use strict";

/**
 * @author Zoltan_Biro
 * Created on 4/3/2015.
 */

var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');
var app = express();
var baseDir = path.join(__dirname, '');

var cp = require('child_process');
var n = cp.fork(__dirname + '/child.js');

var mill = false;


/**Enable servicing static files from hdd*/
app.use(express.static(baseDir));
app.use(bodyparser.json({limit: '50mb'}));


/**Mapping for root url
 * @param {object} req - request
 * @param {object} re - response*/
app.get('/', function (req, res) {
    res.sendFile(path.join(baseDir, 'index.html'));
});

app.post('/startmill', function (req, res) {
    var body = req.body;
    //console.log(body);
    if (!mill) {
        n.send({start: body});
        mill = true;
    }
    res.sendStatus(200);
});

var server = require('http').createServer(app);
var io = require('socket.io')(server);

n.on('message', function (m) {

    console.log(m);
    if (m.hasOwnProperty('init')) {
        io.sockets.emit('init:finished');
    }
    if (m.hasOwnProperty('step')) {
        io.sockets.emit('step');
    }
    if (m.hasOwnProperty('command')) {
        io.sockets.emit('finished');
    }
    if (m.hasOwnProperty('allSteps')) {
        io.sockets.emit('allSteps', m.allSteps);
    }
    if (m.hasOwnProperty('answare')) {
        io.sockets.emit('answare', m.answare);
    }
});

io.on('connection', function (socket) {

    socket.on('reset', function () {
        mill = false;
    });

    socket.on('moveUp', function (data) {
        n.send({setup: -0.5});
    });
    socket.on('moveDown', function (data) {
        n.send({setup: +0.5});
    });
    socket.on('moveUpTen', function (data) {
        n.send({setup: -5.0});
    });
    socket.on('moveDownTen', function (data) {
        n.send({setup: +5.0});
    });
});


server.listen(8090);
