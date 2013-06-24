
require(['blasteroids/gamestate', 'blasteroids/ship', 'blasteroids/star', 'blasteroids/images', 'jquery'], function(GameState, Ship, Star, Images, $) {

    var controls = {
        40: 'shoot',
        13: 'respawn',
        38: 'accelerate',
        37: 'left',
        39: 'right',
        81: 'viewStats'
    };
    var keysDown = {};
    var gameState = new GameState();

    $(function() {
        "use strict";

        // I'll have to add the hostname to a template eventually \/
        var socket = io.connect('http://localhost');

        //send the token back to the server to redeem it and to begin sending actions back to the server!
        socket.emit('join', {
            'token': ship_token
        });
        
        // whenever we recieve the gameInfo object, we want to apply it to our local gamestate, so we can draw it
        socket.on('game', function(data) {
            gameState.setInfo(data);
            //console.log(data);
        });

        addEventListener("keydown", function(e) {
            var actionText = '';
            if (controls[e.keyCode] === 'shoot') {
                actionText = 'shoot';
            } else if (controls[e.keyCode] === 'respawn') {
                actionText = 'respawn';
            } else if (controls[e.keyCode] === 'accelerate') {
                    actionText = 'accelerate';
            } else if (controls[e.keyCode] === 'left') {
                actionText = 'turnLeft';
            } else if (controls[e.keyCode] === 'right') {
                actionText = 'turnRight';
            }
            if (actionText !== '') {
                socket.emit('action', {
                    data: actionText
                });
            }

            if (controls[e.keyCode]) {
                keysDown[controls[e.keyCode]] = true;
            }
        }, false);

        addEventListener("keyup", function(e) {
            var actionText = '';
            if (controls[e.keyCode] === 'shoot') {
                actionText = 'reload';
            } else if (controls[e.keyCode] === 'accelerate') {
                actionText = 'unaccelerate';
            } else if (controls[e.keyCode] === 'left') {
                actionText = 'unTurnLeft';
            } else if (controls[e.keyCode] === 'right') {
                actionText = 'unTurnRight';
            }
            if (actionText !== '') {
                socket.emit('action', {
                    data: actionText
                });
            }
            if (controls[e.keyCode]) {
                delete keysDown[controls[e.keyCode]];
            }
        }, false);
    });

    //canvas stuff
    //add the canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 1200;
    canvas.height = 600;
    $('#canvasBox').html('');
    $('#canvasBox').append(canvas);
    var objects = new Array();

    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };

    // Draw everything
    var drawGame = function() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        $.each(objects, function(index, value) {
            value.draw(ctx);
        });
        gameState.draw(ctx, Images);
        if (keysDown['viewStats']) {
            drawStats(ctx);
        }
    };

    for (var i = 0; i < 100; i++) {
        objects.push(new Star(canvas.width, canvas.height));
    }

    setInterval(drawGame, 1);

    var drawStats = function(context) {
        var location = {
            x: 400,
            y: 200
        };
        context.fillStyle = '#FFFFFF';
        context.font = "bold 16px monospace";
        context.fillText('                Name|' + '  ' + 'kills|' + '  ' + 'death|' + '  ' + 'score|', location.x, location.y);
        $.each(gameState.ships, function(key, value) {
            location.y += 20;
            context.fillStyle = value.color;
            context.fillText(JSON.stringify(value.getStatsInfo()), location.x, location.y);
        });
    };
});
