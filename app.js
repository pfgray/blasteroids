

var requirejs = require('requirejs');
var Mustache = require('mustache');
var config = require('./config')

requirejs(['public/script/blasteroids/ship', 'public/script/blasteroids/gamestate'], function(Ship, GameState) {

    var shipTokenMap = {};
    //webapp
    var fs = require('fs');
    var express = require('express');
    var http = require('http');
    var app = express();
    var server = http.createServer(app);
    var io = require('socket.io').listen(server, {log: false});
    var ejs = require('ejs');
    
    var path = require('path');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.bodyParser());
    var gameController = require('./controllers/gameController.js')(app, io, config);//(app);

    var GAMESTATE_HEARTBEAT_INTERVAL = 5;//in ms

    
    app.get('/', function(req, res) {
        fs.readFile('views/index.ejs', 'utf8', function(err, data){
            res.send(ejs.render(data, {}));
        });
    });


    //start the serve on the configured port
    server.listen(config.host.port);

    //game
    var gameState = new GameState();

});

