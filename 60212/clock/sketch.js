var debug = false;
var ignoreTime = false;
var instantDraw = false;
var spoofHour = false;
var spoofedHour = 3; //1, 2 is broken
var speedTime = false;

var cwidth = window.innerWidth;
var cheight = window.innerHeight;
// var cwidth = 800;
// var cheight = 800;
var c;
var stopDraw = false;

var HR = 0;
var MIN = 0;
var SEC = 0;
var prevSec;
var prevMin;
var prevHr;

var OSL = cheight/100; // original segment length
var OSW = OSL*3.5; // original segment width
var ACD = 30; // angle change degree
var BCA = .7; // branch curve amount
var BAMn = 20; // branch angle min
var BAMx = 90; // branch angle max
var BSF = cheight/50; // blossom spread factor
var BCS = 10; // blossom cluster size
// var BCS = 1;
var BS = cheight/130; // blossom size

var branches;
var blossoms = [];
var dieBlossoms = [];
var drawGeneration = 0;

// 270 degrees is straight up

function setup() {
   c = createCanvas(cwidth, cheight);
   background(200);

   refreshTime();
   prevSec = SEC;
   prevMin = MIN;
   prevHr = HR;
   growTree();
}

window.onresize = function() { 
   cwidth = window.innerWidth;
   cheight = window.innerHeight;
   OSL = cheight/100;
   OSW = OSL*3.5;
   BS = cheight/130;
   BSF = cheight/50;
   c.size(cwidth, cheight);
   growTree();
}

function growTree() {
   drawGeneration = 0;
   var numBranches = HR;
   branches = [];
   if(ignoreTime) numBranches = 23;
   for(var hr = 0; hr <= numBranches; hr++) {
      if(hr==0)
         branches.push(new Branch(hr, true));
      else {
         var branch = new Branch(hr, false);
         var p_index = 0;
         var parent = null;
         while(parent == null) {
            var p = branches[p_index];
            if(p.generation < 3 && p.children.length < 5)
               parent = p;
            p_index++;
         }
         branch.setParent(parent);
         branches.push(branch);
      }
   }
   for(var i=0; i<branches.length; i++) {
      branches[i].draw();
   }
   blossoms = [];
   dieBlossoms = [];
   if(HR>1) {
      var numBlossoms = SEC;
      if(ignoreTime) numBlossoms = 60;
      for(var sec=0; sec<numBlossoms; sec++) {
         var branch = branches[round(random(1,branches.length-1))];
         while(branch.hour == HR)  {
            branch = branches[round(random(1,branches.length-1))];
         }
         var segment = random(branch.segments);
         blossoms.push(new Blossom(segment));
      }
   }
}

function mouseClicked() {
   if(!stopDraw) {
      refreshScene();
      growTree();
   }
}

function keyTyped() {
   if (key === 'q') {
      stopDraw = true;
      noLoop();
   }
   if (key === 'd') {
      debug = !debug;
   }
   if (key === 'r' && !stopDraw) {
      refreshScene();
      growTree();
   }
   // uncomment to prevent any default behavior
   return false;
}

function draw() {
   refreshTime();
   refreshScene();
   refreshBranches();
   refreshBlossoms();

   if (prevMin != MIN) {
      if(!ignoreTime && HR != 0) {
         dieBlossoms = [];
         for(var b=0; b<blossoms.length; b++) {
            blossoms[b].die = true;
            dieBlossoms.push(blossoms[b]);
         }
         blossoms = [];
      }
      prevMin = MIN;
   }
   if (prevSec != SEC) {
      if(!ignoreTime && HR > 1) {
         var branch = branches[round(random(1,branches.length-1))];
         var segmentIndex = round(random(0,60));
         if(segmentIndex==60) segmentIndex = 59;
         while(branch.hour == HR && segmentIndex >= SEC) {
            branch = branches[round(random(1,branches.length-1))];
            segmentIndex = round(random(0,60));
            if(segmentIndex==60) segmentIndex = 59;
         }
         var segment = branch.segments[segmentIndex]
         blossoms.push(new Blossom(segment));
      }
      prevSec = SEC;
   }
   if (prevHr != HR) {
      if(HR==0) {
         growTree();
      }
      else {
         var branch = new Branch(HR, false);
         var p_index = 0;
         var parent = null;
         while(parent == null) {
            var p = branches[p_index];
            if(p.generation < 3 && p.children.length < 5)
               parent = p;
            p_index++;
         }
         branch.setParent(parent);
         branches.push(branch);
      }
      prevHr = HR; 
   }
}

function refreshTime() {
   if(speedTime) {
      SEC+=5;
      if(SEC==60) {
         SEC = 0;
         MIN++;
         if(MIN==60) {
            MIN = 0;
            HR++;
            if(HR==24) {
               HR = 0;
               SEC = 0;
               MIN = 0;
            }
         }
      }
   }
   else {
      HR = hour();
      MIN = minute();
      SEC = second();
   }

   if(spoofHour) HR = spoofedHour;
}

function refreshScene() {
   var curr = (HR*60*60)+(MIN*60)+SEC;
   var morningMaxTime = 60*60*12;
   var eveningMaxTime = 60*60*24;
   var sunDown = cheight*2;
   var sunHeight;
   if(curr<morningMaxTime) sunHeight = map(curr,0,morningMaxTime,sunDown,0);
   else sunHeight = map(curr,morningMaxTime,eveningMaxTime,0,sunDown);
   var bgRGB = [0,0,0];
   if(curr<morningMaxTime) bgRGB[0] = map(curr,0,morningMaxTime,181,252);
   else bgRGB[0] = map(curr,morningMaxTime,eveningMaxTime,252,181);
   if(curr<morningMaxTime) bgRGB[1] = map(curr,0,morningMaxTime,163,237);
   else bgRGB[1] = map(curr,morningMaxTime,eveningMaxTime,237,163);
   if(curr<morningMaxTime) bgRGB[2] = map(curr,0,morningMaxTime,123,204);
   else bgRGB[2] = map(curr,morningMaxTime,eveningMaxTime,204,123);
   
   background(bgRGB[0],bgRGB[1],bgRGB[2]);

   if(debug) {
      fill('rgba(0,0,0,0.35)');
      strokeWeight(0);
      text("Hour: "   + HR, 10, 22);
      text("Minute: " + MIN, 10, 42);
      text("Second: " + SEC, 10, 62);
   }

   fill(255);
   strokeWeight(0);
   ellipse(cwidth/2, sunHeight, cheight/2, cheight/2);

   strokeWeight(cheight/4);
   stroke(0);
   noFill();
   arc(cwidth/2, 0, cwidth*2, cheight*2, TWO_PI, PI);
}

function refreshBranches() {
   var b = 0;
   while(b<branches.length && branches[b].generation <= drawGeneration) {
      if(branches[b].generation == drawGeneration 
         && branches[b].segments[branches[b].segments.length-1].show) {
         drawGeneration++;
      }
      if(branches[b].generation <= drawGeneration) {
         var s = 0;
         var keepSearching = true;
         while(s<branches[b].segments.length && keepSearching) {
            if(!branches[b].segments[s].show) {
               branches[b].segments[s].show = true;
               if(s+1<branches[b].segments.length 
                  && !branches[b].segments[s+1].show)
                  branches[b].segments[s+1].show = true;
               keepSearching = false;
            }
            s++;
         }
      }
      b++;
   }

   for(var i=0; i<branches.length; i++) {
      branches[i].draw();
   } 
}

function refreshBlossoms() {
   BCS = round(map(HR, 0, 23, 0, 10));
   for(var i=0; i<blossoms.length; i++) {
      blossoms[i].draw();
   }
   for(var i=0; i<dieBlossoms.length; i++) {
      dieBlossoms[i].draw();
   }
}

function Coord(x,y) { 
   this.x = x;
   this.y = y;
}

function Branch(hr, trunk) {
   this.branch = this;
   this.hour = hr;
   this.children = [];
   this.angles = []; //0=orig, 1=joint, 2=segment
   this.jointIndex = 30;//random()
   this.parent = null;
   this.parent_start = null;
   this.generation = null;
   this.segments = [];
   this.start = null;

   this.init = function() {
      var factor = 1;
      for(var i=0; i<this.generation; i++) factor = factor * 0.5;
      var strokeWeightFactor = 1.0;
      if(this.generation > 0) {
         var pSeg = this.parent.segments[this.parent_start];
         strokeWeightFactor = 0.75 * (pSeg.factor - (pSeg.factor * pSeg.position));
      }
      for(var i=0; i<60; i++) {
         var start = this.start;
         var angle = this.angles[0]+(i*this.angles[2]);
         if(i>=this.jointIndex) var angle = this.angles[1]+(i*this.angles[2])
         if(i>0) start = this.segments[i-1].end;
         var x = start.x + cos(radians(angle))*(OSL*factor);
         var y = start.y + sin(radians(angle))*(OSL*factor);
         var end = new Coord(x,y);
         var position = (i*1.0)/60;
         this.segments.push(new Segment(start, end, angle, position, strokeWeightFactor));
      }
   }

   if(trunk) {
      this.generation = 0;
      this.angles.push(random(260,281)); //include 280
      // this.angles.push(randomGaussian(this.angles[0],ACD));
      this.angles.push(random(this.angles[0]-ACD, this.angles[0]+ACD+1));
      this.angles.push(random(-1*BCA,BCA));
      this.start = new Coord(cwidth/2, cheight-(cheight/10));
      this.init();
   }

   this.setParent = function(p) {
      this.parent = p;
      this.parent.children.push(this.branch);
      this.generation = p.generation+1;
      this.parent_start = round(random(15,45));
      this.start = this.parent.segments[this.parent_start].start;
      var pAngle = this.parent.segments[this.parent_start].angle;
      this.angles.push(random([random(pAngle-BAMx,pAngle-BAMn),random(pAngle+BAMn,pAngle+BAMx)]));
      if(this.parent.children.length>2) {
         var negCount = 0;
         var posCount = 0;
         for(var i=0; i<this.parent.children.length-1; i++) {
            var pcAngle = this.parent.children[i].angles[0];
            if(pcAngle-pAngle < 0) negCount++;
            else posCount++;
         }
         if(negCount>(this.parent.children.length-1)/2)
            this.angles[0] = random(pAngle+BAMn,pAngle+BAMx);
         if(posCount>(this.parent.children.length-1)/2)
            this.angles[0] = random(pAngle-BAMx,pAngle-BAMn);
      }
      this.angles.push(random(this.angles[0]-ACD, this.angles[0]+ACD+1));
      this.angles.push(random(-1*BCA,BCA));
      this.init();
   }

   this.getNumSegmentsVisible = function() {
      var count = 0;
      for(var i=0; i<this.segments.length; i++)
         if(this.segments[i].show)
            count++
      return count;
   }

   this.draw = function() {
      var limit = this.segments.length;
      stroke(0);
      if(!ignoreTime) {
         if(HR == this.hour) {
            // stroke('rgba(255,0,0,.15)');
            var alpha = map(this.getNumSegmentsVisible(), 0, this.segments.length, .05, 1);
            stroke('rgba(0,0,0,'+alpha+')');
            limit = MIN;
         }
      }
      for(var i=0; i<limit; i++) {
         this.segments[i].draw();
      }
   }
}

function Segment(s, e, a, p, f) {
   this.start = s;
   this.end = e;
   this.angle = a;
   this.position = p; // % value from end tip
   this.factor = f;
   this.show = false;

   if(instantDraw) this.show = true;

   this.draw = function() {
      if(this.show) {
         strokeWeight(constrain(((OSW-(OSW*this.position))*this.factor), OSW*.03, OSW));
         line(this.start.x, this.start.y, this.end.x, this.end.y);
      }
   }
}

function Blossom(s) {
   this.segment = s;
   this.petals = [];
   this.showCount = 0;
   this.die = false;

   this.createPetal = function() {
      var x = random(BSF*(-1), BSF) + this.segment.start.x; //*** error
      var y = random(BSF*(-1), BSF) + this.segment.start.y;
      this.petals.push(new Petal(new Coord(x,y)));
   }

   this.draw = function() {
      if(this.segment.show && this.showCount < BCS)
         this.showCount++;
      if(this.showCount > this.petals.length)
         this.createPetal()
      for(var i=0; i<this.showCount; i++) {
         if(this.die && !speedTime) {
            this.petals[i].die();
         }
         else
            this.petals[i].draw();
      } 
   }

   for(var i=0; i<BCS; i++)
      this.createPetal();
}

function Petal(p) {
   this.pos = p;
   this.show = 0;
   this.deathAngle = randomGaussian(360, 45);
   this.deathPos = 1.0;
   this.deathTime = random(10,100);
   this.deathDelay = round(random(0, 60));

   this.draw = function() {      
      var curr = (HR*60*60)+(MIN*60)+SEC;
      var morningMaxTime = 60*60*12;
      var eveningMaxTime = 60*60*24;
      
      var bgRGB = [255,0,0];
      if(curr<morningMaxTime) bgRGB[1] = round(map(curr,0,morningMaxTime,50,100));
      else bgRGB[1] = round(map(curr,morningMaxTime,eveningMaxTime,100,50));
      if(curr<morningMaxTime) bgRGB[2] = round(map(curr,0,morningMaxTime,50,105));
      else bgRGB[2] = round(map(curr,morningMaxTime,eveningMaxTime,105,50));
      
      var fgRGB = [255,0,0];
      if(curr<morningMaxTime) fgRGB[1] = round(map(curr,0,morningMaxTime,0,110));
      else fgRGB[1] = round(map(curr,morningMaxTime,eveningMaxTime,110,0));
      if(curr<morningMaxTime) fgRGB[2] = round(map(curr,0,morningMaxTime,0,175));
      else fgRGB[2] = round(map(curr,morningMaxTime,eveningMaxTime,175,0));
      
      strokeWeight(0);
      fill('rgba('+bgRGB[0]+','+bgRGB[1]+','+bgRGB[2]+',0.25)');
      ellipse(this.pos.x, this.pos.y, BS*2, BS*2);
      fill('rgba('+bgRGB[0]+','+bgRGB[1]+','+bgRGB[2]+',0.5)');
      ellipse(this.pos.x, this.pos.y, BS, BS);
   }

   this.die = function() {
      var curr = (HR*60*60)+(MIN*60)+SEC;
      var morningMaxTime = 60*60*12;
      var eveningMaxTime = 60*60*24;
      
      var bgRGB = [255,0,0];
      if(curr<morningMaxTime) bgRGB[1] = round(map(curr,0,morningMaxTime,50,100));
      else bgRGB[1] = round(map(curr,morningMaxTime,eveningMaxTime,100,50));
      if(curr<morningMaxTime) bgRGB[2] = round(map(curr,0,morningMaxTime,50,105));
      else bgRGB[2] = round(map(curr,morningMaxTime,eveningMaxTime,105,50));
      
      var fgRGB = [255,0,0];
      if(curr<morningMaxTime) fgRGB[1] = round(map(curr,0,morningMaxTime,0,110));
      else fgRGB[1] = round(map(curr,morningMaxTime,eveningMaxTime,110,0));
      if(curr<morningMaxTime) fgRGB[2] = round(map(curr,0,morningMaxTime,0,175));
      else fgRGB[2] = round(map(curr,morningMaxTime,eveningMaxTime,175,0));

      var x = this.pos.x + cos(radians(this.deathAngle))*(this.deathPos);
      var y = this.pos.y + sin(radians(this.deathAngle))*(this.deathPos);

      var bgAlpha = constrain(map(this.deathPos, 1, this.deathTime, 0.25, 0), 0, 1);
      var fgAlpha = constrain(map(this.deathPos, 1, this.deathTime, 0.5, 0), 0, 1);
      strokeWeight(0);
      fill('rgba('+bgRGB[0]+','+bgRGB[1]+','+bgRGB[2]+','+bgAlpha+')');
      ellipse(x, y, BS*2, BS*2);
      fill('rgba('+bgRGB[0]+','+bgRGB[1]+','+bgRGB[2]+','+fgAlpha+')');
      ellipse(x, y, BS, BS);

      if(this.deathDelay > 0)
         this.deathDelay--;
      else
         this.deathPos++;//+(this.deathPos/0.05);
   }
}