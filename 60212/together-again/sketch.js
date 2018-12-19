var c; // canvas
var cwidth = window.innerWidth;
var cheight = window.innerHeight;
var nervous; var biko; // fonts

var gravity = 0.3;
var mouseBuffer = -3;
var bounce = -0.6;
var p2mouse = [];
var boxSize = 50;

var gameState = "menu";
var vizState = "static";
var transitionVal = 0;
var level = 1;
var boxState = "forward";
var offscreen = false;
var offscreenCounter = 0;
var keyWasDown = false;
var gameCounter = 0;

var currBox = null;
var currCirc = null;
var ghosts = [];

function setup() {
	c = createCanvas(cwidth, cheight);
	background(255);
	frameRate(30);
	noCursor();
	nervous = loadFont("Nervous.ttf");
	biko = loadFont("Biko_Regular.otf");
}

window.onresize = function() { 
	cwidth = window.innerWidth;
	cheight = window.innerHeight;
	c.size(cwidth, cheight);
}

function draw() {
	background(255);

	// splash menu
	if(gameState == "menu") {
		noStroke();
		fill(121,151,73)
		textFont(nervous);
		textSize(min(cwidth,cheight)*.1);
		textAlign(CENTER,CENTER);
		text("Together Again", cwidth/2, cheight/2);

		fill(218,225,213);
		textFont(biko);
		textSize(min(cwidth,cheight)*.03);
		text("hold SPACE to go turn back time", cwidth/2, cheight-cheight/5);

		if(keyIsDown(32)) { vizState = "transition"; }
		if(keyIsDown(68)) { gravity = 1; }

		if(vizState == "transition") {
			transitionVal += 10;
			fill(255,255,255,transitionVal);
			rect(0,0,cwidth,cheight);
			if(transitionVal>255) {
				gameState = "game";
			}
		}
	}

	// actual game
	if(gameState == "game") {
		if(currBox == null) currBox = new Box(null);
		if(currCirc == null) currCirc = new Circle();

		if(vizState == "transition") {
			currBox.draw();
			currCirc.draw();
			transitionVal -= 10;
			fill(255,255,255,transitionVal);
			rect(0,0,cwidth,cheight);
			if(transitionVal < 0 && !keyIsDown(32)) {
				vizState = "static";
			}
		}
		else {
			// check if space is being pressed
			if(keyIsDown(32)) {
				boxState = "rewind"
				if(!keyWasDown) { 
					ghosts.push(currBox);
					keyWasDown = true;
				}
			}
			else if(keyWasDown) {
				keyWasDown = false;
				boxState = "forward";
				var prevCount = 1;
				var prev = null;
				while(prev == null) {
					// console.log(ghosts.length-prevCount);
					prev = ghosts[ghosts.length-prevCount].getCurrPos();
					prevCount++;
					if(prevCount > ghosts.length) {
						for(var i=0; i<ghosts.length; i++) {
							ghosts[i].update();
							ghosts[i].draw();
						}
						prevCount = 1
					}
				}
				currBox = new Box(prev);
			}

			if(boxState == "reunited") {
				
				transitionVal+=10;
				if(transitionVal-150 > 255) {
					console.log("new level");
					level++;
					gravity = constrain(gravity+.2, 0, 3);
					currBox = new Box([random(cwidth-boxSize), random(cheight/2), 0, 0]);
					// currBox = new Box(null);
					currCirc = new Circle();
					ghosts = [];
					vizState = "transition";
					boxState = "forward"
					transitionVal = 255;
				}
				else if(transitionVal-150 > 150) {
					currBox.draw();
					currCirc.draw();
					fill(255,255,255,transitionVal-150);
					rect(0,0,cwidth,cheight);
				}
				else {
					currBox.draw();
					currCirc.draw();
				}
			}
			else if(boxState == "rewind") {
				gameCounter--;
				if(gameCounter>0) {
					for(var i=0; i<ghosts.length; i++) {
						ghosts[i].rewind();
						ghosts[i].draw();
					}
				}
				else {
					ghosts[0].draw();
					gameCounter = 0;
				}
				if(offscreen) {
					offscreenCounter--;
					if(offscreenCounter < 0) {
						offscreen = false;
					}
					else {
						lostMessage();
					}
				}
				currCirc.draw();
			}
			else { //forward in time
				gameCounter++;
				var poffscreen = offscreen;
				for(var i=0; i<ghosts.length; i++) {
					ghosts[i].update();
					ghosts[i].draw();
				}
				currBox.update(); 
				currBox.draw();
				currCirc.draw();

				if(poffscreen != offscreen) {
					offscreenCounter = 0;
				}
				if(offscreen) {
					offscreenCounter++;
					lostMessage();
				}
			}

		}
	}

	// draw mouse tail
	noFill();
	stroke(218,225,213);
	strokeWeight(10);
	beginShape();
	curveVertex(mouseX, mouseY);
	curveVertex(mouseX, mouseY);
	curveVertex(pmouseX, pmouseY);
	curveVertex(p2mouse[0], p2mouse[1]);
	endShape();
	stroke(239,240,235);
	strokeWeight(5);
	beginShape();
	curveVertex(mouseX, mouseY);
	curveVertex(pmouseX, pmouseY);
	curveVertex(p2mouse[0], p2mouse[1]);
	curveVertex(p2mouse[0], p2mouse[1]);
	endShape();
	p2mouse = [pmouseX, pmouseY];
}

function Box(startVals) {
	this.active = true;
	this.history = []; //position & velocity history
	this.pos = []; //[x,y]
	this.currIndex = 0;
	this.vx = 0; //x-direction velocity
	this.vy = 0; //y-direction velocity
	this.corner = 0; // corner radius

	this.init = function(startVals) {
		if(startVals == null) {
			this.pos = [cwidth/2-boxSize/2,cheight*.3]
		}
		else {
			this.pos = [startVals[0], startVals[1]];
			this.vx = startVals[2];
			this.vy = startVals[3];
		}
		this.history.push([this.pos[0], this.pos[1], this.vx, this.vy]);
	}

	this.getCurrPos = function() {
		if(this.currIndex < 0)
			return null;
		return this.history[constrain(this.currIndex, 0, this.history.length-1)];
	}

	this.update = function() {
		this.corner = constrain(this.corner-0.2, 0, this.corner);
		if(!this.active) {
			this.currIndex++;
			return;
		}
		// check if level over
		if(areReunited(this, currCirc)) { boxState="reunited"; transitionVal=0; }

		// check for interaction with the mouse
		var collision = this.getMouseCollisionPoint();
		if(collision != null) { this.corner = 10; }

		// update vertical bounce
		if (collision != null && (collision[2]=="bottom" || collision[2]=="top")) {
			// ========== UPDATE VERTICAL ========== //
			var vm = (mouseY - pmouseY); // velocity of the mouse in y direction

			if(collision[2]=="bottom") {
				if(this.vy <= 0) { this.vy += constrain(vm, -40, 40); }
				else { this.vy *= bounce; }
				this.pos[1] = mouseY-boxSize+mouseBuffer;
			}
			else {
				if(this.vy >= 0) { this.vy += constrain(vm, -40, 40); }
				else { this.vy *= bounce; }
				this.pos[1] = mouseY+mouseBuffer;
			}

			// ========== UPDATE HORIZONTAL ========== //
			var hpos = map(mouseX, this.pos[0], this.pos[0]+boxSize, -1, 1);
			this.vx += 10 * bounce * hpos;
		}

		// update horizontal bounce
		if (collision != null && (collision[2]=="left" || collision[2]=="right")) {
			var vm = (mouseX - pmouseX); // velocity of the mouse in x direction
			this.vx += constrain(vm, -40, 40);

			if(collision[2] == "left") {
				if(this.vx > 0) { this.pos[0] = mouseX; }
				else { this.vx *= bounce; }
				this.pos[0] = mouseX;
			}
			if(collision[2] == "right") {
				if(this.vx < 0) { this.pos[0] = mouseX-boxSize; }
				else { this.vx *= bounce; }
				this.pos[0] = mouseX-boxSize;
			}
		}

		// update position
		if(this.vx > 20*gravity || this.vx < -20*gravity) { this.vx *= 0.85; }
		if(this.vy > 35*gravity || this.vy < -35*gravity) { this.vy *= 0.85; }
		this.vy = constrain(this.vy + gravity, -30, 50);
		this.pos[0] += this.vx;
		this.pos[1] += this.vy;
		
		//debug
		if(this.pos[1]-boxSize>cheight || this.pos[0]+boxSize<0 || this.pos[0]>cwidth) {
			offscreen = true;
		}
		this.history.push([this.pos[0], this.pos[1], this.vx, this.vy]);
		this.currIndex++;
	}

	this.draw = function() {
		noStroke();
		fill(57,67,7);
		if(!this.active)
			fill(239,240,235);
		if(this.currIndex >= 0 && this.currIndex < this.history.length) {
			if(boxState == "reunited") { 
				this.corner = constrain(this.corner+1, 0, 18); 
				var r = map(this.corner, 0, 18, 57, 121);
				var g = map(this.corner, 0, 18, 67, 151);
				var b = map(this.corner, 0, 18, 7, 73);
				fill(r,g,b);
			}
			rect(this.history[this.currIndex][0], this.history[this.currIndex][1], boxSize, boxSize, this.corner);
		}
	}

	this.getMouseCollisionPoint = function() {
		var top = new Line(this.pos[0],this.pos[1],this.pos[0]+boxSize,this.pos[1])
		var left = new Line(this.pos[0],this.pos[1],this.pos[0],this.pos[1]+boxSize)
		var bottom = new Line(this.pos[0],this.pos[1]+boxSize,this.pos[0]+boxSize,this.pos[1]+boxSize)
		var right = new Line(this.pos[0]+boxSize,this.pos[1],this.pos[0]+boxSize,this.pos[1]+boxSize)
		var mouse = new Line(mouseX, mouseY+mouseBuffer, pmouseX, pmouseY+mouseBuffer);
		var coords = null;
		if(pmouseX <= mouseX) {
			var result = getMouseCollision(mouse, left);
			if(result != null) {
				result.push("left");
				return result;
			}
		}
		if(pmouseX >= mouseX) {
			var result = getMouseCollision(mouse, right);
			if(result != null) {
				result.push("right");
				return result;
			}
		}
		if(pmouseY <= mouseY) {
			var result = getMouseCollision(mouse, top);
			if(result != null) {
				result.push("top");
				return result;
			}
		}
		if(pmouseY >= mouseY){
			var result = getMouseCollision(mouse, bottom);
			if(result != null) {
				result.push("bottom");
				return result;
			}
		}
		if(this.vx < 0 && 
			mouseX >= this.pos[0] &&
			pmouseX < this.pos[0]-this.vx &&
			mouseY+mouseBuffer >= this.pos[1] && 
			mouseY+mouseBuffer <= this.pos[1]+boxSize) {
			return [mouseX, mouseY+mouseBuffer, "left"];
		}
		if(this.vx > 0 && 
			mouseX <= this.pos[0]+boxSize &&
			pmouseX > this.pos[0]+boxSize-this.vx &&
			mouseY+mouseBuffer >= this.pos[1] && 
			mouseY+mouseBuffer <= this.pos[1]+boxSize) {
			return [mouseX, mouseY+mouseBuffer, "right"];
		}
		if(this.vy < 0 && 
			mouseY+mouseBuffer >= this.pos[1] &&
			pmouseY+mouseBuffer < this.pos[1]+this.vy &&
			mouseX >= this.pos[0] && 
			mouseX <= this.pos[0]+boxSize) {
			return [mouseX, mouseY+mouseBuffer, "top"];
		}
		if(this.vy > 0 && 
			mouseY+mouseBuffer <= this.pos[1]+boxSize &&
			pmouseY+mouseBuffer >= this.pos[1]+boxSize-this.vy &&
			mouseX >= this.pos[0] && 
			mouseX <= this.pos[0]+boxSize) {
			return [mouseX, mouseY+mouseBuffer, "bottom"];
		}
		return null;
	}

	this.rewind = function() {
		this.currIndex--;
		this.active = false;
	}

	this.init(startVals);
}

function Circle() {
	this.pos = [];
	this.ring = 6;
	this.corner = 25; //18 mid-point

	this.init = function() {
		this.pos = [random(cwidth), random(cheight)];
	}

	this.pulse = function() {
		this.ring-= .2;
		if(this.ring<0.5 && boxState != "reunited") {
			this.ring = 6;
		}
		else if(this.ring<0 && boxState == "reunited") {
			this.ring = 0;
		}
	}

	this.draw = function() {
		this.pulse();
		fill(176, 196, 134);
		strokeWeight(this.ring);
		stroke(239,240,235);
		// ellipse(this.pos[0], this.pos[1], boxSize, boxSize);
		if(boxState == "reunited") { 
			noStroke();
			this.corner = constrain(this.corner-1, 18, 25); 
			var r = map(this.corner, 18, 25, 121, 176);
			var g = map(this.corner, 18, 25, 151, 196);
			var b = map(this.corner, 18, 25, 73, 235);
			fill(r,g,b);
		}
		rect(this.pos[0]-boxSize/2, this.pos[1]-boxSize/2, boxSize, boxSize, this.corner)
	}

	this.init();
}

function lostMessage() {
	noStroke();
	fill(218,225,213);
	textFont(nervous);
	textSize(min(cwidth,cheight)*.08);
	text("lost your way", cwidth/2, cheight/2);
	textFont(biko);
	var sec = "seconds";
	textSize(min(cwidth,cheight)*.05);
	if(round(offscreenCounter/30)==1) sec = "second";
	text("for "+round(offscreenCounter/30)+" "+sec, cwidth/2, cheight/2+cheight/10);
	textSize(min(cwidth,cheight)*.03);
	text("hold SPACE to go turn back time", cwidth/2, cheight-cheight/5);
}

function getMouseCollision(a, b) {
	var coord = null;
	var de = ((b.y2-b.y1)*(a.x2-a.x1))-((b.x2-b.x1)*(a.y2-a.y1));
	var ua = (((b.x2-b.x1)*(a.y1-b.y1))-((b.y2-b.y1)*(a.x1-b.x1))) / de;
	var ub = (((a.x2-a.x1)*(a.y1-b.y1))-((a.y2-a.y1)*(a.x1-b.x1))) / de;
	if((ua > 0) && (ua < 1) && (ub > 0) && (ub < 1)) {
		var x = a.x1 + (ua * (a.x2-a.x1));
		var y = a.y1 + (ua * (a.y2-a.y1));
		coord = [x, y];
	}
	return coord;
}

function Line(x1, y1, x2, y2) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
}

function areReunited(box, circle) {
	var distX = Math.abs(circle.pos[0] - box.pos[0] - boxSize / 2);
    var distY = Math.abs(circle.pos[1] - box.pos[1] - boxSize / 2);

    if (distX > (boxSize / 2 + boxSize/2)) {
        return false;
    }
    if (distY > (boxSize / 2 + boxSize/2)) {
        return false;
    }

    if (distX <= (boxSize / 2)) {
        return true;
    }
    if (distY <= (boxSize / 2)) {
        return true;
    }

    var dx = distX - boxSize / 2;
    var dy = distY - boxSize / 2;
    return (dx * dx + dy * dy <= (boxSize/2 * boxSize));
}