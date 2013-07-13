
require(['blasteroids/gamestate', 'blasteroids/ship', 'blasteroids/star', 'blasteroids/images', 'jquery', 'blasteroids/smokeparticle', 'blasteroids/messagequeue'], function(GameState, Ship, Star, Images, $, SmokeParticle, MessageQueue) {

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

        var socket = io.connect('http://'+hostname);

        //send the token back to the server to redeem it and to begin sending actions back to the server!
        //socket.emit('join', {
        //    'token': ship_token
        //});

        $('#joinGame').click(function() {
            //get the name and the ship color, and emit it on the socket!
            var name = $('#name').val();
            var shipColor = $('input[name=shipColor]:checked').val();
            socket.emit('join', {
                'name': name, 
                'shipColor': shipColor
            });
        });

        socket.emit('watch', {
            'name': game_name
        });

        // whenever we recieve the gameInfo object, we want to apply it to our local gamestate, so we can draw it
        socket.on('game', function(data) {
            gameState.setInfo(data);
            //console.log(data);
        });

        
        socket.on('message', function(data) {
            var finalMessage = new Array();

            var messageCount = data.message.length;
            for(var i=0; i< messageCount; i++){
                var incMessage = {};
                if(typeof data.message[i].ship != "undefined"){
                    incMessage.color = Images.ships[gameState.ships[data.message[i].ship].image].color;
                }
                incMessage.text = data.message[i].text;
                finalMessage.push(incMessage);
            }
            queue.addMessage(finalMessage);
        });
        
        socket.on('drop', function(data) {
            delete gameState.ships[data.name];
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


    //this will hold all the messages coming in
    var queue = new MessageQueue(0,canvas.height + 10);
   

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
        
        var smokeCount = smokes.length;
        gameState.draw(ctx, Images);
        for(var i=0; i< smokeCount; i++){
            smokes[i].draw(ctx);
        }
        queue.draw(ctx);
        if (keysDown['viewStats']) {
            drawStats(ctx);
        }   
    };


    //start the smoke stuff:
    var smokes = new Array();
    var timeSinceLastSmoke = 0;
    var smokeInterval =.000000000005;
    var smokeDensity = 3;

    var then = new Date();
    var update = function() {
        var now = new Date();
        var modifier = ((now - then) / 1000);
        $.each(objects, function(index, value) {
            value.update(modifier);
        });

        $.each(gameState.ships, function(key, value) {
            if(value.dead == true){
                if(timeSinceLastSmoke - modifier > smokeInterval){
                    //randomize x to be within the width/height
                    for(var i=0; i<smokeDensity; i++){
                        var x =  Math.floor((Math.random()*(Images.ships.shipDEAD.normal.width/2))+1);
                        var y =  Math.floor((Math.random()*(Images.ships.shipDEAD.normal.height/2))+1);
                        smokes.push(new SmokeParticle(value.x-Images.ships.shipDEAD.normal.width/2 + x, value.y-Images.ships.shipDEAD.normal.width/2 + y));
                    }
                    timeSinceLastSmoke = 0;
                }else{
                    timeSinceLastSmoke  += modifier;
                }
            }
        });
        var smokeCount = smokes.length;
        for(var i=0; i< smokeCount; i++){
            smokes[i].update(modifier);
        }
        
        queue.update(modifier);
        then = now;
    };

    for (var i = 0; i < 100; i++) {
        objects.push(new Star(canvas.width, canvas.height));
    }

    function main() {
        update();
        drawGame();
    }

    setInterval(main, 1);


    var drawStats = function(context) {
        var location = {
            x: 400,
            y: 200
        };
        context.fillStyle = '#FFFFFF';
        context.font = "bold 16px monospace";
        context.fillText('                Name|' + '  ' + 'kills|' + '  ' + 'deaths|' + '  ' + 'score|', location.x, location.y);
        $.each(gameState.ships, function(key, value) {
            location.y += 20;
            context.fillStyle =  Images.ships[value.image].color;
            var stats = value.getStatsInfo();
            var name = S(stats.name).padLeft(20).s;
            var kills = S(stats.kills).padLeft(7).s;
            var deaths = S(stats.deaths).padLeft(8).s;
            var score = S(stats.score).padLeft(7).s;
            context.fillText(name +'|'+ kills +'|'+ deaths+'|' + score+'|', location.x, location.y);
        });
    };
});
