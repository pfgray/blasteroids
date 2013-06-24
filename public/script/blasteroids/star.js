
define(function () {	
    return function(widthMax, heightMax){
        this.x =  Math.floor((Math.random()*widthMax)+1);
        this.y =  Math.floor((Math.random()*heightMax)+1);
        this.angle = Math.random()*2*Math.PI;
        this.color = '#ffffff';
        this.size = 1;
        this.speed = 5; //pixels per second
    
        this.draw = function(context){
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.size, this.size);
        };
        this.update = function(time){
            var dx = time*this.speed*Math.cos(this.angle);
            var dy = time*this.speed*Math.sin(this.angle);
	
            this.x = this.x + dx;
            this.y = this.y + dy;
        
            if(this.x > widthMax){
                this.x = 0;
            }else if(this.x <0){
                this.x = widthMax;
            }
            if(this.y > heightMax){
                this.y = 0;
            }else if(this.y <0){
                this.y = heightMax;
            }  
        };
    };
});