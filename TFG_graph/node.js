class Node {
  constructor(id, info=0, x=random(width/2)+width/4, y=random(height/2)+height/4) {
    
    // Data inside each node
    this.id = id;
    this.info = info;
    
    // Layout data
    this.pos = createVector(x, y);
    this.vel = createVector(0,0);
    this.acc = createVector(0,0);
    this.friction = 0.01;
    
    // Edges info
    this.edgesSet = new Set();

    //Drawing info
    this.radius = 30;
    this.flags = {
      hover : false,
      dragging : false,
    };


  }
  
  addAdjacentNode(id, node) {
    this.edgesSet.add(id);
  }

  checkAdjacentNode(id) {
    return this.edgesSet.has(id);
  }
  
  updatePos() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    
    this.pos.x = clamp(this.pos.x, this.radius + 15, LENGTH_CANVAS - this.radius - 15);
    this.pos.y = clamp(this.pos.y, this.radius + 15, WIDTH_CANVAS - this.radius - 15);

    this.acc.mult(0);
    
    this.vel.mult(this.friction);
  }
  
  applyForce(f) {
    this.acc.add(f);
  }

  // Drawing methods
  render() {
    this.render_circle();
    this.render_text();
  }

  render_text() {
    noStroke();
    fill(0);
    textSize(20);
    text(this.info, this.pos.x - (textWidth(this.info) / 2), this.pos.y + ((textAscent() + textDescent()) / 4));
  }
  
  render_circle() {
    stroke(0);
    strokeWeight(2);
    fill(255);
    if (this.flags.hover) {
      stroke(255, 0, 0);
      strokeWeight(3);
    }
    if (this.flags.dragging) {
      fill(100, 255, 255);
    }
    
    ellipse(this.pos.x, this.pos.y, this.radius*2, this.radius*2);
  }

  isInside(x, y) {
    const d = dist(this.pos.x, this.pos.y, x, y);
    return d <= this.radius;
  }
}