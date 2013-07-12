
define(function () {
    return function(x,y){
        this.x = x;
        this.y = y;
        this.fireColor = '#9C2A00';
        this.smallColor = '#585858';
        this.medColor = '#989898';
        this.largeColor = '#C8C8C8';
        this.timeSinceLastUpdate = 0;
        this.increaseSizeTime = .05;

        this.radius = 1;
        this.dead = false;
        this.remove = function(){
            if(this.dead){
                return true;
            }
        };

        this.draw = function(ctx){
            if(!this.dead){
                var nowColor;
                if(this.radius < 2){
                    nowColor = this.fireColor;
                }else if(this.radius < 4){
                    nowColor = this.smallColor;
                }else if(this.radius < 7){
                    nowColor = this.medColor;
                }else {
                    nowColor = this.largeColor;
                }

                ctx.beginPath();
                ctx.fillStyle = nowColor;
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true); 
                ctx.closePath();
                ctx.fill();
            }
        };
        
        this.update = function(modifier){
            if(this.timeSinceLastUpdate - modifier > this.increaseSizeTime){
                this.radius += 1;
                this.timeSinceLastUpdate = 0;
                if(this.radius > 9){
                    this.dead = true;
                }
            }else {
                this.timeSinceLastUpdate += modifier;
            }
        };
    };
});
