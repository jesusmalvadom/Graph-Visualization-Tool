class Edge {
  constructor(node1Id, node2Id) {
    this.node1 = graph.findNode(node1Id);
    this.node2 = graph.findNode(node2Id);
    
    this.flags = {
      hover : false,
      dragging : false,
    };
  }
  
  render(node1posX=this.node1.pos.x, node1posY=this.node1.pos.y, node2posX=this.node2.pos.x, node2posY=this.node2.pos.y, info=false) {
    this.render_line(node1posX, node1posY, node2posX, node2posY, info);
  }
  
  render_line(node1posX, node1posY, node2posX, node2posY, info) {
    stroke(0);
    strokeWeight(2);
    if (!info) {
      if (this.flags.hover) {
        stroke(200, 0, 0);
        strokeWeight(3);
      }
      if (this.flags.dragging) {
        fill(100, 255, 255);
      }
    }
    
    line(node1posX, node1posY, node2posX, node2posY);
  }
  
  isInside(x, y) {

    const d1 = dist(this.node1.pos.x, this.node1.pos.y, x, y);
    const d2 = dist(this.node2.pos.x, this.node2.pos.y, x, y);
    
    if (d1 <= this.node1.radius || d2 <= this.node2.radius) return false;
    
    const length = dist(this.node1.pos.x, this.node1.pos.y, this.node2.pos.x, this.node2.pos.y);
    
    const cond1 = (d1 + d2)-0.5 <= length;
    const cond2 = (d1 + d2)+0.5 >= length;
    
    return cond1 && cond2;
  }
  
}