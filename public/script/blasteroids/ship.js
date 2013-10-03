define(["./point", "./polygon", "./bullet", "jquery"], function(Point, Polygon, Bullet, $) {
    
    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
    
    return function(name, theta, canvasSize, color, image){
        var self = this;
        this.name = name;      //server
        this.canShoot = true;  //server
        this.kills = 0;        //server
        this.deaths = 0;    //server
        this.color = color; //server
        this.velocityLimit = 500; //pixels per second
        this.acceleration = 1000; //pixels per second^2
        this.deceleration = -0.5;
        this.turnSpeed=20;
        this.image = image;
    
        this.dead = false; //server
        this.velocity = {
            y:0,
            x:0
        };  //server: is in pixels per second
        
        this.accelerating = false; //server
        this.turningLeft = false;
        this.turningRight = false;

        this.x = Math.floor((Math.random()*canvasSize.width)+1);
        this.y = Math.floor((Math.random()*canvasSize.height)+1);
        this.angle = theta; //server
        this.bullets = new Array();

        //smoke stuff
        this.smokes = new Array();
        this.timeSinceLastSmoke = 0;
        this.smokeInterval =.000000000005;
        this.smokeDensity = 3;

    
        this.shape = new Polygon(this.x,this.y, this.angle, new Array(
            new Point(-18, 30),
            new Point(27, 5),
            new Point(27, -5),
            new Point(-18, -30)
            ));

        this.draw = function(context, Images){
            context.save();
            context.translate(this.x,this.y);
            context.rotate(this.angle);
            if(this.dead){
                //context.drawImage(Images.ships.shipDEAD.normal, -Images.ships.shipDEAD.normal.width/2, -Images.ships.shipDEAD.normal.height/2);
                context.drawImage(Images.ships[this.image].normal, -Images.ships[this.image].normal.width/2, -Images.ships[this.image].normal.height/2);
            }else if(!this.accelerating){
                context.drawImage(Images.ships[this.image].normal, -Images.ships[this.image].normal.width/2, -Images.ships[this.image].normal.height/2);
            }else{
                context.drawImage(Images.ships[this.image].accelerating, -Images.ships[this.image].accelerating.width/2, -Images.ships[this.image].accelerating.height/2);
            }
            context.restore();
        
            var bulletCount = this.bullets.length;
            for(var i=0; i< bulletCount; i++){
                this.bullets[i].draw(context, Images.ships[this.image].color);
            }
            
            //  \/make this configurable\/
            //this.shape.draw(context);
            
            context.save();
            context.fillStyle = Images.ships[this.image].color;
            context.font = "10pt sans";
            //context.fillText("poop", 200, 500);
            var x = this.x - (Images.ships.shipDEAD.normal.width/2);
            var y = this.y - (Images.ships.shipDEAD.normal.height/2)-6;
            context.fillText(this.name, x, y);
            
            context.restore();
            //console.log("done drawing name!");
        };
    
        this.getStatsInfo = function(){
            return {
                name:this.name, 
                kills:this.kills, 
                deaths:this.deaths,
                score:this.kills*10
            };
        }
    
        this.processAction = function(action){
            //keydown: shoot, accelerate, respawn, turnLeft, turnRight    keyup: unaccelerate, reload
            if(!this.dead){
                if(action === 'shoot'){
                    this.shoot();
                }else if(action === 'accelerate'){
                    this.accelerating = true;
                }else if(action === 'unaccelerate'){
                    this.accelerating = false;
                }else if(action === 'reload'){
                    this.canShoot = true;
                }else if(action === 'turnLeft'){
                    this.turningLeft = true;
                }else if(action === 'turnRight'){
                    this.turningRight = true;
                }else if(action === 'unTurnLeft'){
                    this.turningLeft = false;
                }else if(action === 'unTurnRight'){
                    this.turningRight = false;
                }
            }else if(action === 'respawn'){
                this.respawn();
            }
        };
    
        this.shoot = function(){
            if(this.canShoot){
                this.bullets.push(new Bullet(this.x, this.y, this.angle, this.color));
                this.canShoot = false;
            }
        };
    
        this.respawn = function(){
            this.x = Math.floor((Math.random()*canvasSize.width)+1);
            this.y = Math.floor((Math.random()*canvasSize.height)+1);
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.angle = 0;
            this.dead = false;
        };
        this.destroy = function(){
            this.deaths++;
            this.dead = true;
        };
    
        this.accelerate = function(modifier){
            //add velocity to the x and y components
            this.velocity.x += this.acceleration*modifier*Math.cos(this.angle);
            if(this.velocity.x >= this.velocityLimit){
                this.velocity.x = this.velocityLimit;
            }else if(this.velocity.x <= -this.velocityLimit){
                this.velocity.x = -this.velocityLimit;
            }
            this.velocity.y += this.acceleration*modifier*Math.sin(this.angle);
            if(this.velocity.y >= this.velocityLimit){
                this.velocity.y = this.velocityLimit;
            }else if(this.velocity.y <= -this.velocityLimit){
                this.velocity.y = -this.velocityLimit;
            }
        };
        this.decelerate = function(modifier){
            if(this.velocity.x < 0){
                //make velocity.x go to 0
                this.velocity.x += -this.deceleration*modifier;
            }else if(this.velocity.x > 0){
                //make velocity.x go to 0
                this.velocity.x += this.deceleration*modifier;
            }
            if(this.velocity.y < 0){
                //make velocity.y go to 0
                this.velocity.y += -this.deceleration*modifier;//*Math.sin(this.angle);
            }else if(this.velocity.y > 0){
                //make velocity.y go to 0
                this.velocity.y += this.deceleration*modifier;//*Math.sin(this.angle);
            }
        };
        this.turnLeft= function(modifier){
            this.angle = this.angle - (Math.PI/10*modifier*this.turnSpeed);
            if(this.angle < 0){
                this.angle = Math.PI*2;
            }
        };
        this.turnRight= function(modifier){
            this.angle = this.angle + (Math.PI/10*modifier*this.turnSpeed);
            if(this.angle > Math.PI*2){
                this.angle = 0;
            }
        };
    
        this.update = function(modifier){
            if(!this.dead){
                if (this.accelerating) { // Player holding up
                    this.accelerate(modifier);
                }else{
                    this.decelerate(modifier);
                }
                if (this.turningLeft) { // Player holding left
                    this.turnLeft(modifier);
                }
                if (this.turningRight) { // Player holding right
                    this.turnRight(modifier);
                }
            }else{
                this.angle += 10*modifier;
                this.decelerate(modifier);
            }

            this.x += this.velocity.x*modifier;
            this.y += this.velocity.y*modifier;
            if(this.x > canvasSize.width){
                this.x = 0;
            }else if(this.x < 0){
                this.x = canvasSize.width;
            }
            if(this.y > canvasSize.height){
                this.y = 0;
            }else if(this.y < 0){
                this.y = canvasSize.height;
            }

            for(var i=0; i< this.bullets.length; i++){
                this.bullets[i].update(modifier);
                if(this.bullets[i].remove && this.bullets[i].remove(canvasSize.width, canvasSize.height)){
                    this.removeBullet(i);
                    i--;
                }
            }
            this.shape.update(this.angle, new Point(this.x, this.y));
        };
        this.removeBullet = function(i){
            this.bullets.remove(i);
        };
        this.contains = function(point){
            return this.shape.contains(point);
        };
        this.setInfo = function(info){
            this.color = info.color;
            this.kills = info.kills;
            this.deaths = info.deaths;
            this.dead = info.dead;
            this.accelerating = info.accelerating;
            this.image = info.image;
            this.x = info.x;
            this.y = info.y;
            this.angle = info.angle;
            this.shape.update(info.angle, new Point(info.x, info.y));
            self.bullets = new Array();
            //console.log("setting bullets from: " + JSON.stringify(info.bullets));
            $.each(info.bullets, function(index, value){
                self.bullets[index] = new Bullet(value.x, value.y, value.angle);
            });
        };
        this.getInfo = function(){
            var bulletInfo = new Array();
            $.each(this.bullets, function(index, value){
                bulletInfo.push(value.getInfo());
            });
            
            return {
                name:this.name,
                color:this.color,
                kills:this.kills,
                deaths:this.deaths,
                dead:this.dead,
                accelerating:this.accelerating,
                x:this.x,
                y:this.y,
                angle:this.angle,
                image:this.image,
                bullets:bulletInfo
            };
        };
    };
});
