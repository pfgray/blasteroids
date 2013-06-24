define(["./point", "jquery"], function(Point, $) {
    var crossProduct = function(point1, point2){
        return (point1.x*point2.y)-(point1.y*point2.x);
    };
    var distance = function(point1, point2){
        var dx2 = Math.pow(point1.x-point2.x, 2);
        var dy2 = Math.pow(point1.y-point2.y, 2);
        return Math.sqrt(dx2-dy2);
    };
    
    //Polygon function
    return function(x, y, theta, points){
        this.location = new Point(x,y);
        this.angle = theta;
        this.points = points;
        var self = this;
        this.color = "#FFFFFF";
        this.radius = 20;
        $.each(points, function(index, point){
            var dist = distance({
                x:0,
                y:0
            }, point);
            if(Math.abs(dist > self.radius)){
                self.radius = dist;
            }
        });
    
        this.update = function(theta, location){
            this.angle = theta;
            this.location = location;
        };
    
        this.getAllSides = function(){
            var pointsCount = this.points.length;
            var sides = new Array();
            //p'x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
            //p'y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy
            for(var i=0; i<pointsCount; i++){
                sides.push(new Array(this.points[i].add(this.location).rotate(this.angle, this.location), this.points[(i+1)%pointsCount].add(this.location).rotate(this.angle, this.location)));
            }
            return sides;
        };
    
        this.contains = function(point){
            
            console.log("checking if point: " + JSON.stringify(point) + " is located near ship with location: " + JSON.stringify(this.location) );
            
            //this is checking based on radius: if this passes, then we'll check the actual hitbox, but if not, we know it's not anywhere near here
            if(Math.sqrt(Math.pow(point.x-this.location.x, 2)+Math.pow(point.y-this.location.y, 2)) > this.radius){
                return false;
            }
            console.log("got past the radius check! ");
        
            var vertices = this.getAllSides();
            var sign = 0;
            var n_vertices = vertices.length;
            for(var i=0; i<n_vertices; i++){
                //segment = vertices[n], vertices[(n+1)%n_vertices]
                var affine_segment = vertices[i][1].subtract(vertices[i][0]);
                var affine_point = point.subtract(vertices[i][0]);
                var cross_product = crossProduct(affine_segment, affine_point);
                cross_product /= Math.abs(cross_product); //normalized to 1 or -1
                if (sign === 0){ //the first case
                    sign = cross_product ;
                }else if(cross_product !== sign){
                    console.log("cross product:   >" + cross_product + "!=" + sign + "<    :sign");
                    return false;
                }
            }
            return true;
        };

        this.collides = function(polygon){
            //this needs to still be implemented
        };

        this.draw = function(context){
            console.log("drawing polygon for points: " + this.points);
            context.save();
            //context.translate(this.location.x,this.location.y);
            //context.rotate(this.angle);
            context.beginPath();
            context.strokeStyle = this.color;
            context.lineWidth = 1;
            context.moveTo(this.location.x, this.location.y);
            if(this.points[0]){
                context.moveTo(this.points[0].add(this.location).rotate(this.angle, this.location).x, this.points[0].add(this.location).rotate(this.angle, this.location).y);
            }
            var pointsCount = this.points.length;
            for(var i=1; i<pointsCount; i++){
                context.lineTo(this.points[i].add(this.location).rotate(this.angle, this.location).x, this.points[i].add(this.location).rotate(this.angle, this.location).y);
            }
            context.lineTo(this.points[0].add(this.location).rotate(this.angle, this.location).x, this.points[0].add(this.location).rotate(this.angle, this.location).y);
            context.stroke();
            context.restore();
        };
    };
});