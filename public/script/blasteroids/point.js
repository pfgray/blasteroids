define(
function () {	
    var Point = function(x,y){
        this.x = x;
        this.y = y;
    
        this.dot = function(point){
            return this.x*point.x + this.y*point.y;
        };
        this.add = function(point){
            var toReturn = new Point();
            toReturn.x = this.x+point.x;
            toReturn.y = this.y+point.y;
            return toReturn;
        };
        this.subtract = function(point){
            var toReturn = new Point();
            toReturn.x = this.x-point.x;
            toReturn.y = this.y-point.y;
            return toReturn;
        };
        this.rotate = function(theta, referencePoint){
            var toReturn = new Point();
            toReturn.x = Math.cos(theta)*(this.x-referencePoint.x) - Math.sin(theta)*(this.y-referencePoint.y) + referencePoint.x
            toReturn.y = Math.sin(theta)*(this.x-referencePoint.x) + Math.cos(theta)*(this.y-referencePoint.y) + referencePoint.y;
            return toReturn;
        };
    };
    return Point;
});
