define(['jquery'], function ($) {
    var Message = function(x,y, textArray, lifeLength){
        this.textArray = textArray;
        this.x = x;
        this.y = y;
        this.lifeLength = lifeLength;
        this.alpha = 1;
    
        this.speed = 0; //pixels per second
        this.pixelsMoved = 0;
        this.inMotion = false;
        this.limit= 0;
        this.removable = false;
        this.fadingOut = false;
        var self = this;
    
        this.draw = function(context){

            var previousLength = 0;
            $.each(this.textArray, function(index, value){
                var color = null;
                var text = null;
                if(value.color){
                    color = value.color;
                }else{
                    color = Message.color;
                }
                context.save();
                context.globalAlpha = self.alpha;
                context.fillStyle = color;
                context.font = Message.font;
                context.fillText(value.text, self.x+previousLength, self.y);                
                previousLength += context.measureText(value.text).width;
                context.restore();
            });
        };
    
        //this function will set the message in motion, moving up
        this.moveUp = function(speed, limit){
            //if it's already in motion, i think we just need to increase the limit
            if(this.inMotion){
                this.limit += limit;
            }else{
                this.inMotion = true;
                this.speed = speed;
                this.limit = limit;
            }
        };
    
        this.update = function(seconds){
            if(this.pixelsMoved > this.limit){
                this.stopMoving();
            }else if(this.inMotion){
                var dy = seconds*this.speed;//update the location of the message relative to the speed and time increased.
                this.y -= dy;
                this.pixelsMoved += dy;
            }
            if(this.fadingOut){
                //decrease the alpha!
                this.alpha -= Message.fadeOutSpeed*seconds;
                if(this.alpha <=0){
                    this.removable = true;
                }
            }
            else{
                this.lifeLength -= seconds;
                if(this.lifeLength <= 0){
                    this.fadeOut();
                }
            }
        };
    
        this.stopMoving = function(){
            this.inMotion = false;
            this.pixelsMoved = 0;
        }
        
        this.fadeOut = function(){
            this.fadingOut = true;
        }
        
    }
    Message.fontSize = 16;
    Message.color = "#FFFFFF";
    Message.font = "bold "+Message.fontSize+"px Arial";
    Message.fadeOutSpeed = 1;
    return Message;
});
