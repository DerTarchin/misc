alert("Press 'B' to toggle blur.\nClick or drag mouse to drop a ball.");

var c; // canvas
var cwidth = window.innerWidth;
var cheight = window.innerHeight;

var maxcreateCanvas = 150;
var mincreateCanvas = maxcreateCanvas/3;
var startg = 172;
var startb = 240;
var end;
var gravity = 0.015;

var circles = [];
// var blur;

var isblur = false;

function setup() {
	c = createCanvas(cwidth, cheight);
	frameRate(30);
	noStroke();
	// blur = loadShader("blur.glsl");
	end = [209,208,239];
	background(end[0], end[1], end[2]);
}

window.onresize = function() { 
	cwidth = window.innerWidth;
	cheight = window.innerHeight;
	c.size(cwidth, cheight);
}    

function draw() {
  var opacity = 150;
  if(isblur) opacity = 0;
  //else background(end);
	noStroke();
	fill(end[0], end[1], end[2], opacity);
	rect(0,0,width,height);
  
  for(var i=0; i<circles.length; i++) {
    circles[i].draw();
    // if(circles.[i].isDead()) circles.remove(circles.indexOf(circles.get(i)));
  }
}

function mousePressed() {
    circles.push(new Circle(mouseX, mouseY));
}

function mouseDragged() {
  circles.push(new Circle(mouseX, mouseY));
}

function keyTyped() {
  if(key == 'b') isblur = !isblur;
}

function Circle(x,y) {
  this.x = x;
  this.y = y;
  this.d = maxcreateCanvas;
  this.c = [random(256), startg, startb];
  
  this.draw = function() {
    this.d -= this.d*gravity;
    var perc = constrain(map(this.d, mincreateCanvas, maxcreateCanvas, 100, 0), 0, 100);    
    var r = mix(this.c[0], end[0], perc);
    var g = mix(this.c[1], end[1], perc);
    var b = mix(this.c[2], end[2], perc);
    
    var newx = mix(x, width/2, perc);
    var newy = mix(y, height/2, perc);
    noStroke();
    fill(r,g,b);
    ellipse(newx,newy,this.d,this.d);
  }
  
  this.isDead = function() {
    return d <= mincreateCanvas;
  }
}

function mix(s, e, perc) {
  return constrain(map(perc, 0, 100, s, e), min(s,e), max(s,e));
}