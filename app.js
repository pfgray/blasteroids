

var requirejs = require('requirejs');
var Mustache = require('mustache');
var config = require('config')


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
    
    var path = require('path');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.bodyParser());
    var gameController = require('gameController.js')(app, io, config);//(app);
    console.log(JSON.stringify(gameController));

    var GAMESTATE_HEARTBEAT_INTERVAL = 5;//in ms

    
    app.get('/', function(req, res) {
        res.sendfile('views/index.html');
    });
    /*
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
        fs.readFile('views/game.html', 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            } else {
                res.send(Mustache.render(data, {token: id}));
            }
        });
    });
*/
    
    server.listen(config.host.port);

    //game
    var gameState = new GameState();

});

