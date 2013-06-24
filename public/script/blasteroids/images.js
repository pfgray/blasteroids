define([], function() {
    var image11 = new Image();
    image11.src = 'images/ship1.png';
    var image12 = new Image();
    image12.src = 'images/accship1.png';
    
    var image21 = new Image();
    image21.src = 'images/ship2.png';
    var image22 = new Image();
    image22.src = 'images/accship2.png';
    
    var image31 = new Image();
    image31.src = 'images/ship3.png';
    var image32 = new Image();
    image32.src = 'images/accship3.png';
    
    var image41 = new Image();
    image41.src = 'images/ship4.png';
    var image42 = new Image();
    image42.src = 'images/accship4.png';
    
    var image51 = new Image();
    image51.src = 'images/ship5.png';
    var image52 = new Image();
    image52.src = 'images/accship5.png';
    
    var image61 = new Image();
    image61.src = 'images/ship6.png';
    var image62 = new Image();
    image62.src = 'images/accship6.png';
    
    var imageDEAD = new Image();
    imageDEAD.src = 'images/shipDEAD.png';
    
    return {
        ships:{
            ship1:{
                normal:image11,
                accelerating:image12
            },ship2:{
                normal:image21,
                accelerating:image22
            },ship3:{
                normal:image31,
                accelerating:image32
            },ship4:{
                normal:image41,
                accelerating:image42
            },ship5:{
                normal:image51,
                accelerating:image52
            },ship6:{
                normal:image61,
                accelerating:image62
            },shipDEAD:{
                normal:imageDEAD
            }
        }
    };
});