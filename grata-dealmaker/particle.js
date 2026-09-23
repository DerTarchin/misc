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
    const [red, green, blue] = isDarkMode ? DARK_SPARKLE : LIGHT_SPARKLE;
    // color(p5.Color, alpha) ignores the alpha and returns the original color.
    stroke(red, green, blue, this.alpha);
    strokeWeight(4);
    point(this.x, this.y);
  }
}

const initParticles = (rowOffset=0) => {
  for (let i = 0; i < numParticles; i++) {
    let p = new Particle(rowOffset);
    particles.push(p);
  }
}

const drawParticles = () => {
  particles = particles.filter((particle) => !particle.finished());
  particles.forEach((particle) => {
    particle.update();
    particle.show();
  });
};

// p5play paints every block in its post hook, which runs after draw().
// This file loads after p5play.js, so this hook runs second and the burst
// stays visible on top of the rows that just locked in.
p5.prototype.registerMethod("post", function drawRowClearParticles() {
  drawParticles();
});
