define(["./point"], function(Point) {
    return function(x,y,theta, color){
        this.x = x;
        this.y = y;
        this.angle = theta;
        this.speed = 2000;//pixels per second
        this.size = 4;
        this.color = color;
			
        this.update = function(seconds){
            //move in the direction of the angle
            var dx = seconds*this.speed*Math.cos(this.angle);
            var dy = seconds*this.speed*Math.sin(this.angle);
		
            this.x = this.x + dx;
            this.y = this.y + dy;
        //point,angle,length
        };
        this.remove = function(width, height){
            //also turned at the correct angle
            if(this.x > width || this.x < 0 || this.y < 0 || this.y > height){
                return true;
            }else{
                return false;
            }
        };
	
        this.draw = function(context){
            console.log("drawing bullet!");
            //also turned at the correct angle
            context.save();
            context.translate(this.x,this.y);
            context.rotate(this.angle);
            context.fillStyle = this.color;
            context.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            context.restore();
        };
        this.getInfo = function(){
            return {
                x:this.x,
                y:this.y,
                angle:this.angle
            };
        };
        this.setInfo = function(info){
            this.x = info.x;
            this.y = info.y;
            this.angle= info.angle;
        };
        this.getLocation = function(){
            return new Point(this.x, this.y);
        }
    }  
});

