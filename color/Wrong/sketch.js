alert("Click or drag mouse to drop a ball.\nTry dragging at different speeds to create interesting effects.");

var c; // canvas
var cwidth = window.innerWidth;
var cheight = window.innerHeight;

var gravity = 0.98;
// gravity = 1;

var endless = true;

var balls = [];
var bce = [255,66,3];
var bc = [128,60,37];
var maxball = 150;
var minball = 25;

function setup() {
	c = createCanvas(cwidth, cheight);
	frameRate(30);
	// background(255);
	noStroke();
}

window.onresize = function() { 
	cwidth = window.innerWidth;
	cheight = window.innerHeight;
	c.size(cwidth, cheight);
}

function draw() {
	fill(252,207,124,200);
	fill(117,96,57);
	rect(0,0,cwidth,cheight);

	for(var i=0; i<balls.length; i++) {
		balls[i].draw();
	}
}

function mouseDragged() {
  balls.push(new Ball(mouseX, mouseY));
}

function mouseClicked() {
  balls.push(new Ball(mouseX, mouseY));
}

function Ball(x,y) {
	this.cx = x;
	this.cy = y;
	this.v = 0;
	this.d = maxball;
	this.dead = false;

	this.draw = function() {
		this.update();

		var perc = constrain(map(this.d, minball, maxball, 100, 0), 0, 100);
		var r = mix(bc[0], bce[0], perc);
		var g = mix(bc[1], bce[1], perc);
		var b = mix(bc[2], bce[2], perc);
		fill(r,g,b);

		ellipse(this.cx, this.cy, this.d, this.d);
	}

	this.update = function() {
		// var offset_x = map(this.cx, min(), width/2);
		// var offset_y = 0;
		// console.log(this.d);
		if(!endless && !this.dead) {
			this.v += gravity;
			this.d -= this.v;
			if(this.d < minball) {
				this.v *= -1*gravity;
				if(this.v < 1 && this.v > -1) this.dead = true;
			}
		}
		if(endless) {
			console.log("being called?")
			this.v += 1;
			this.d -= this.v;
			if(this.d < minball) this.d = minball;
			if(this.d <= minball) {
				this.v *= -1;
			}
		}
	}
}

function mix(start, end, perc) {
  return constrain(map(perc, 0, 100, start, end), min(start,end), max(start,end));
}