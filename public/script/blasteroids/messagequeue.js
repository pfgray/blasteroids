
define(['jquery', './message'], function ($, Message) {
    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
    var MessageQueue = function(x,y){
        this.x = x;
        this.y = y;
        this.messages = new Array();
        var self = this;
    
        this.addMessage = function(message){
            this.messages.push(new Message(this.x, this.y, message, MessageQueue.messageLifeLength));
            //add message to the bottom,
            //set all the messages in motion
            $.each(this.messages, function(index, value){
                value.moveUp(MessageQueue.messageMoveSpeed, MessageQueue.lineHeight, true);
            });
        };

        this.draw = function(context){
            $.each(this.messages, function(index, value){
                value.draw(context);
            });
        };
        this.update = function(modifier){
            for(var i=0; i< this.messages.length; i++){
                this.messages[i].update(modifier);
                if(this.messages[i].removable){
                    this.messages.remove(i);
                    i--;
                }
            }
        };
    };
    MessageQueue.messageMoveSpeed = 100;
    MessageQueue.messageLifeLength = 3;
    MessageQueue.messageLimit = 1000;
    MessageQueue.lineHeight = 15;
    return MessageQueue;
});
