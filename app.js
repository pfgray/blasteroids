

var requirejs = require('requirejs');
var Mustache = require('mustache');



function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 20; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

requirejs(['public/script/blasteroids/ship', 'public/script/blasteroids/gamestate'], function(Ship, GameState) {

    var shipTokenMap = {};
    //webapp
    var fs = require('fs');
    var express = require('express');
    var http = require('http');
    var app = express();
    var server = http.createServer(app);
    var io = require('socket.io').listen(server, {log: false});
    var GAMESTATE_HEARTBEAT_INTERVAL = 5;//in ms

    var path = require('path');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.bodyParser());
    app.get('/', function(req, res) {
        res.sendfile('public/index.html');
    });
    app.post('/', function(req, res) {
        console.log("New request to join received:");
        console.log("    username: " + req.body.username);
        console.log("    shipColor: " + req.body.shipColor);

        var username = req.body.username;
        var shipColor = req.body.shipColor;

        //check to see if the user already exists, if not, then add them!
        var ship = new Ship(username, 1.0, {'width': 1200, 'height': 600}, 'red', shipColor);
        var id = makeid();
        shipTokenMap[id] = ship;

        //send them back the token!
        fs.readFile('public/game.html', 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            } else {
                res.send(Mustache.render(data, {token: id}));
            }
        });
    });
    server.listen(1337);


    //game
    var gameState = new GameState();
    io.sockets.on('connection', function(socket) {
        var ship = null;
        setInterval(function() {
            socket.emit('game', gameState.getInfo());
        }, GAMESTATE_HEARTBEAT_INTERVAL);
        socket.on('join', function(data) {
            console.log('recieved token:' + JSON.stringify(data.token));
            console.log("checking map: " + JSON.stringify(shipTokenMap));
            console.log('recieved join token for:' + shipTokenMap[data.token].name);
            ship = shipTokenMap[data.token];
            gameState.addShip(ship);
        });
        socket.on('action', function(data) {
            var action = {player: ship.name, data: data.data};
            gameState.processAction(action);
        });
    });
    var then = new Date();
    var update = function() {
        var now = new Date();
        var modifier = ((now - then) / 1000);
        gameState.update(modifier);
        then = now;
    };

    setInterval(update, 1);

});

