
class Node {
  constructor(id, info=0, x=random(width/2)+width/4, y=random(height/2)+height/4, edgesSet = undefined, new_node=false) {
    
    // Data inside each node
    this.id = id;
    this.info = info;
    
    // Layout data
    this.pos = createVector(x, y);
    this.vel = createVector(0,0);
    this.acc = createVector(0,0);
    
    // Edges info
    if (!edgesSet) this.edgesSet = new Set();
    else this.edgesSet = new Set(edgesSet);

    //Drawing info
    this.radius = 30;
    this.flags = {
      hover : false, // If the mouse is above the node
      dragging : false, // If we are moving it
      selected : false, // Operations like adding edges
      pinned: false, // The node is pinned in the canvas
      new_node: new_node // The node has just been created through barabasi or other algorithm
    };
  }
  
  addAdjacentNode(id) {
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
    
    this.vel.mult(0.1);
  }

  applyForce(f) {
    this.acc.add(f);
  }

  // Drawing methods
  render(x=this.pos.x, y=this.pos.y, radius=this.radius, info=false, color=255) {
    this.render_circle(x, y, radius, info, color);
    this.render_text(x, y, info);
  }

  render_text(x, y, info) {
    noStroke();
    fill(0);
    textSize(20);
    if (info) {
      infoWindow.textSize(30)
      infoWindow.textAlign(CENTER, CENTER);
      infoWindow.text(this.info.toFixed(2), x, y);
      
    } else text(this.info.toFixed(2), x - (textWidth(this.info.toFixed(2)) / 2), y + ((textAscent() + textDescent()) / 4));
  }
  
  render_circle(x, y, radius, info, color) {
    stroke(0);
    strokeWeight(2);
    fill(255, color, color);

    if (!info) { 
      if (this.flags.new_node){
        fill(color, 255, color);        
      }
      if (this.flags.hover) {
        stroke(0,0,255);
        strokeWeight(5);
      }
      if (this.flags.pinned) {
        stroke(255, 186, 109);
        strokeWeight(5);
      }
      if (this.flags.dragging) {
        fill(100, 255, 255);
      }
      if (this.flags.selected) {
        stroke(0,0,255);
        strokeWeight(5);
      }
      ellipse(x, y, radius*2, radius*2);
    } else {
      infoWindow.strokeWeight(5);
      infoWindow.ellipse(x, y, radius*2, radius*2);
    } 
  }

  isInside(x, y) {
    const d = dist(this.pos.x, this.pos.y, x, y);
    return d <= this.radius;
  }
}