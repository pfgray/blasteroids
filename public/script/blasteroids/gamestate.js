define(["jquery", './ship'], function($, Ship) {
    return function(name, isServer) {
        var self = this;
        this.ships = {};
        this.canvasSize = {
            'width': 1200,
            'height': 600
        };
        this.started = false;
        this.paused = false;
        this.sockets = [];
        this.name = name;

        this.addSocket = function(socket) {
            this.sockets.push(socket);
        };

        this.addShip = function(ship) {
            //console.log("testing if this ship is already in the game or not. name: ship.name " + )
            if (!typeof this.ships[ship.name] === "undefined") {
                return false;
            } else {
                this.ships[ship.name] = ship;
                return true;
            }
        };
        this.removeShip = function(name) {
            delete this.ships[name];
            $.each(this.sockets, function(index, value) {
                value.emit('drop', {name: name});
            });
        };
        this.setInfo = function(info) {
            this.started = info.started;
            //console.log("setting ships info from: " + JSON.stringify(info));
            
            $.each(info.ships, function(index, value) {
                if (typeof self.ships[value.name] === "undefined" || self.ships[value.name] === null) {
                    self.ships[value.name] = new Ship(value.name, value.angle, self.canvasSize, value.color, value.image);//(name, theta, canvasSize, color, image, useImage)
                } else {
                    self.ships[value.name].setInfo(value);
                }
            });
        };
        this.getInfo = function() {
            var shipInfos = new Array();
            $.each(this.ships, function(key, value) {
                shipInfos.push(value.getInfo());
            });
            return {
                started: this.started,
                ships: shipInfos
            };
        };
        this.processAction = function(action) {
            //console.log('Processing action: ' + JSON.stringify(action));
            this.ships[action.player].processAction(action.data);
        };
        this.draw = function(context, Images) {
            $.each(this.ships, function(key, value) {
                value.draw(context, Images);
            });
        };
        this.update = function(modifier) {
            //update all the ships
            var shipList = this.ships;
            $.each(shipList, function(key, value) {
                value.update(modifier);
            });

            //check collision on all the ships
            $.each(shipList, function(key, value) {
                if (!value.dead) {
                    //console.log("checking collisions for: " + value.name);
                    $.each(shipList, function(innerKey, innerValue) {
                        if (key !== innerKey) {
                            $.each(innerValue.bullets, function(index, bullet) {
                                //console.log("checking collisions for: " + value.name + " against: " + innerValue.name);
                                if (value.contains(bullet.getLocation())) {
                                    //console.log(innerValue.name + " destroyed " + value.name);
                                    value.destroy();
                                    innerValue.kills++;

                                    var message = new Array({ship:innerValue.name,text:innerValue.name},{text:' killed '},{ship:value.name,text:value.name},{text:' with bullets'});
                                    $.each(self.sockets, function(index, value) {
                                        value.emit('message', {message: message});
                                    });
                                }
                            });
                        }
                    });
                }
            });

        };
        this.start = function() {
            this.started = true;
            var then = new Date();
            var update = function() {
                var now = new Date();
                var modifier = ((now - then) / 1000);
                if (self.paused === false) {
                    self.update(modifier);
                }
                then = now;
            };
            setInterval(update, 1);
        };
        this.emitMessage = function(message, player){
            var message = new Array({ship:player, text:player + ': '}, {text:message});
            $.each(this.sockets, function(index, value) {
                value.emit('message', {message: message});
            });
        }
    };

});
