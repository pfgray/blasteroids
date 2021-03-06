
var requirejs = require('requirejs');
var fs = require('fs');
var ejs = require('ejs');
var GameState = requirejs('public/script/blasteroids/gamestate.js');
var Ship = requirejs('public/script/blasteroids/ship.js');
var games = {};
var GAMESTATE_HEARTBEAT_INTERVAL = 10;
module.exports = function(app, io, config) {

    io.sockets.on('connection', function(socket) {
        console.log('got connection request...');

        var currentGameOnSocket = null;
        var ship = null;
        socket.on('watch', function(data) {
            console.log('recieved request to watch:' + JSON.stringify(data.name));
            if (games[data.name]) {
                setInterval(function() {
                    socket.emit('game', games[data.name].getInfo());
                }, GAMESTATE_HEARTBEAT_INTERVAL);
                currentGameOnSocket = games[data.name];
                currentGameOnSocket.addSocket(socket);
            }
        });
        socket.on('join', function(data) {
            console.log('recieved join request for game:' + currentGameOnSocket.name);
            console.log('request holds: ' + JSON.stringify(data));

            if (currentGameOnSocket !== null) {
                ship = new Ship(data.name, 0, {width: 1200, height: 600}, "#000000", data.shipColor);
                if (!currentGameOnSocket.addShip(ship)) {
                    ship = null;
                }
            }
        });
        socket.on('action', function(data) {
            if (ship !== null) {
                var action = {player: ship.name, data: data.data};
                currentGameOnSocket.processAction(action);
            }
        });
        socket.on('chatmessage', function(data) {
            if (currentGameOnSocket !== null) {
                var currentShip = 'Anonymous';
                if(ship !== null){
                    currentShip = ship.name;   
                }
                currentGameOnSocket.emitMessage(data.message, currentShip);
            }
        });
        socket.on('disconnect', function() {
            if (ship !== null) {
                console.log(ship.name + " disconnected.");
                currentGameOnSocket.removeShip(ship.name);
            }
        });
    });


    app.get('/createGame', function(req, res) {
        fs.readFile('views/createGame.ejs', 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            } else {
                res.send(ejs.render(data, {filename: __dirname + '/../views/createGame.ejs'}));
            }
        });
    });
    app.post('/createGame', function(req, res) {
        req.body.gameName;
        if (games[req.body.gameName] || req.body.gameName == '') {
            fs.readFile('views/createGame.ejs', 'utf8', function(err, data) {
                if (err) {
                    return console.log(err);
                } else {
                    res.send(ejs.render(data, {filename: __dirname + '/../views/createGame.ejs'}));
                }
            });
        } else {
            var game = new GameState(req.body.gameName);
            games[req.body.gameName] = game;
            game.start();
            res.redirect('/games/' + req.body.gameName);
        }
    });

    app.get('/games/:gameId', function(req, res) {
        var gameId = req.params.gameId;
        fs.readFile('views/game.ejs', 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            } else {
                res.send(ejs.render(data, {gameName: gameId, host:req.headers.host, filename: __dirname + '/../views/game.ejs'}));
            }
        });
    });

    app.get('/games', function(req, res) {
        //get the game List and send it!
        fs.readFile('views/gameList.ejs', 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            } else {
                if(games["test"] && games["test"].ships){
                   console.log("****" + JSON.stringify(games["test"].ships));
                }
                res.send(ejs.render(data, {games: games, filename: __dirname + '/../views/gameList.ejs'}));
            }
        });
    });
};
