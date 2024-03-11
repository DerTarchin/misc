let particles = [];
const numParticles = 300;

class Particle {
  constructor(offset) {
    this.x = random(0, width);
    const offsetPixels = CELL_SIZE * offset;
    this.y = random(height - CELL_SIZE, height) - offsetPixels;
    this.vx = random(-2, 2);
    this.vy = random(0, -5);
    this.alphaSpeed = random(2, 8);
    this.alpha = 255;
  }

  finished() {
    return this.alpha < 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.alphaSpeed;
  }

  show() {
    push();
    translate(this.x, this.y);

    this.c2 = color(darkBlue, this.alpha);
    stroke(this.c2);
    strokeWeight(3);
    line(this.vx, this.vy, this.vx, this.vy);
    pop();
  }
}

const initParticles = (rowOffset=0) => {
  for (let i = 0; i < numParticles; i++) {
    let p = new Particle(rowOffset);
    particles.push(p);
  }
}
