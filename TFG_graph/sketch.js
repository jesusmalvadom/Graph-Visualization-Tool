const NUM_NODES = 10;
const MAX_NODE_DEG = 2;

const LENGTH_CANVAS = 1500;
const WIDTH_CANVAS = 1500;

const LENGTH_CONTROL = 600;
const MARGIN_CONTROL = 50;

const LENGTH_BUTTON = 150;
const WIDTH_BUTTON = 50;

const TIME_BUFFERING = NUM_NODES*5;

const COLOR_BACKGROUND = 100;

let graph;
let opt_flags;
let controlBuffer;
let infoBuffer;

function setup() {
  createCanvas(LENGTH_CANVAS + LENGTH_CONTROL, WIDTH_CANVAS);

  controlBuffer = createGraphics(LENGTH_CONTROL, WIDTH_CANVAS);
  infoBuffer = createGraphics(LENGTH_CONTROL - (2 * MARGIN_CONTROL), LENGTH_CONTROL - (2 * MARGIN_CONTROL));
  

  opt_flags = {
    add_node : false,
    delete_node : false,
    add_edge : false,
    delete_edge: false
  };
  
  graph = new Graph();
  
  // Create nodes
  for (let i = 0; i < NUM_NODES; i++) {
    graph.addNode('id'+i, graph.n_nodes);
  }
  
  // all nodes are added, now it's time to add edges
  for (let i = 0; i < NUM_NODES; i++) {
    let node_deg = ceil(random(MAX_NODE_DEG));
    for (let j = 0; j < node_deg; j++) {
      let other_node = floor(random(NUM_NODES));
      if (i!=other_node) graph.addEdge('id'+i, 'id'+other_node);
    }
  }
  
  // Add nodes button
  add_node_button = createButton('Add Node');
  add_node_button.position(30, 30);
  add_node_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  add_node_button.mousePressed(function (){
    if (opt_flags.add_node) opt_flags.add_node = false;
    else {
      opt_flags.add_node = true;
      opt_flags.delete_node = false;
      opt_flags.add_edge = false;
      opt_flags.delete_edge = false;
    }
  });

  // Delete nodes button
  delete_node_button = createButton('Delete Node');
  delete_node_button.position(30 + 1 * (LENGTH_BUTTON + 10), 30);
  delete_node_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  delete_node_button.mousePressed(function (){
    if (opt_flags.delete_node) opt_flags.delete_node = false;
    else {
      opt_flags.add_node = false;
      opt_flags.delete_node = true;
      opt_flags.add_edge = false;
      opt_flags.delete_edge = false;
    }
  });

  // Add Edge button
  add_edge_button = createButton('Add Edge');
  add_edge_button.position(30 + 2 * (LENGTH_BUTTON + 10), 30);
  add_edge_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  add_edge_button.mousePressed(function (){
    if (opt_flags.add_edge) opt_flags.add_edge = false;
    else {
      opt_flags.add_node = false;
      opt_flags.delete_node = false;
      opt_flags.add_edge = true;
      opt_flags.delete_edge = false;
    }
  });

  // Delete Edge button
  delete_edge_button = createButton('Delete Edge');
  delete_edge_button.position(30 + 3 * (LENGTH_BUTTON + 10), 30);
  delete_edge_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  delete_edge_button.mousePressed(function (){
    if (opt_flags.delete_edge) opt_flags.delete_edge = false;
    else {
      opt_flags.add_node = false;
      opt_flags.delete_node = false;
      opt_flags.add_edge = false;
      opt_flags.delete_edge = true;
    }
  });
  
}

let buffering = 0;
function draw() {
  if (buffering < TIME_BUFFERING){
    graph.autoCorrectPos();
    buffering++;
    return;
  }

  background(COLOR_BACKGROUND);
  drawControlBuffer();
  graph.show();
  graph.autoCorrectPos();
  buttons_show();



  // TODO Little trick to make the line not disappear, might fix it later 
  if (pinned_node) {
    stroke(74, 244, 255);
    strokeWeight(3);
    line(pinned_node.pos.x, pinned_node.pos.y, mouseX, mouseY);
  }


}

// Control panel situated at the right side
function drawControlBuffer() {
  image(controlBuffer, LENGTH_CANVAS, 0);
  controlBuffer.background(150, 0, 0);

  // We draw the information window
  drawInfoBuffer();
}

// Information panel situated in the control buffer
function drawInfoBuffer() {
  image(infoBuffer, LENGTH_CANVAS + MARGIN_CONTROL, WIDTH_CANVAS - LENGTH_CONTROL - MARGIN_CONTROL);
  infoBuffer.background(COLOR_BACKGROUND);

  // Draw the nodes
  if (hovered_node_flag == true){
    var posX = LENGTH_CANVAS + MARGIN_CONTROL + (LENGTH_CONTROL - (2 * MARGIN_CONTROL))/2;
    var posY = WIDTH_CANVAS - LENGTH_CONTROL - MARGIN_CONTROL + (LENGTH_CONTROL - (2 * MARGIN_CONTROL))/2;
    hovered_node.render(posX, posY, 50, true);
    return;
  }

  if (hovered_edge_flag == true){
    var posX = LENGTH_CANVAS + MARGIN_CONTROL + (LENGTH_CONTROL - (2 * MARGIN_CONTROL))/2;
    var posY = WIDTH_CANVAS - LENGTH_CONTROL - MARGIN_CONTROL + (LENGTH_CONTROL - (2 * MARGIN_CONTROL))/2;
    hovered_edge.render(posX-150+hovered_edge.node1.radius, posY, posX+150-hovered_edge.node2.radius, posY, true);
    hovered_edge.node1.render(posX-150, posY, hovered_edge.node1.radius, true);
    hovered_edge.node2.render(posX+150, posY, hovered_edge.node2.radius, true);
    return;
  }
  
}


// User Interactions
let dx = 0;
let dy = 0;
let dragged_node;
let pinned_node;

function mousePressed() {

  // Add nodes
  if (opt_flags.add_node) {

    graph.addNode('id'+graph.n_nodes, 0, mouseX, mouseY);

  } else if (opt_flags.delete_node) { // Delete Nodes

    for (let node of graph.nodeList) {
      if (node.flags.hover) {
        graph.deleteNode(node);
      }
    }

  } else if (opt_flags.add_edge) { // Add Edges

    for (let node of graph.nodeList) {
      if (node.flags.hover) {
        node.flags.pinned = true;
        pinned_node = node;
        break;
      }
    }

  } else if (opt_flags.delete_edge) { // Delete Edge

    for (let i = 0; i < graph.edgeList.length; i++) {
      edge = graph.edgeList[i];
      if (edge.flags.hover) {
        graph.deleteEdge(edge);
      }
    }

  } else { // Move nodes
    //If user clicks on a node, with no options activated, we preparate it to get moving
    for (let i = 0; i < graph.nodeList.length; i++) {
      node = graph.nodeList[i];
      if (node.flags.hover) {
        node.flags.dragging = true;
        dragged_node = node;
        break;
      }
    }
    
    if (!dragged_node) {
      return;
    } else { 
      dx = mouseX - dragged_node.pos.x;
      dy = mouseY - dragged_node.pos.y;
    }


  }
}

function mouseDragged() {

  // We are moving a node around
  if (dragged_node) {
    dragged_node.pos.x = clamp(mouseX - dx, dragged_node.radius + 15, LENGTH_CANVAS - dragged_node.radius - 15);
    dragged_node.pos.y = clamp(mouseY - dy, dragged_node.radius + 15, WIDTH_CANVAS - dragged_node.radius - 15);
  }

  // We have pinned a node to create an edge
  // if (pinned_node) {
  //   stroke(0);
  //   strokeWeight(3);
  //   line(pinned_node.pos.x, pinned_node.pos.y, mouseX, mouseY);
  // }
}

function mouseReleased() {
  if (dragged_node) {
    dragged_node.flags.dragging = false;
    dragged_node = undefined;
  }

  if (pinned_node) {
    if (hovered_node_flag) {
      graph.addEdge(pinned_node.id, hovered_node.id);
    }

    pinned_node.flags.pinned = false;
    pinned_node = undefined;
  }
}

let color_selected = "#FF8080"
let font_selected = "#FFFFFF"
let color_normal = "#FFFFFF"
let font_normal = "#000000" 

function buttons_show() {

  if (opt_flags.add_node){
    add_node_button.style("background-color", color_selected);
    add_node_button.style("color", font_selected);
  } else {
    add_node_button.style("background-color",color_normal);
    add_node_button.style("color", font_normal);
  }

  if (opt_flags.delete_node) {
    delete_node_button.style("background-color",color_selected);
    delete_node_button.style("color", font_selected);
  } else {
    delete_node_button.style("background-color", color_normal);
    delete_node_button.style("color", font_normal);
  }

  if (opt_flags.add_edge) {
    add_edge_button.style("background-color",color_selected);
    add_edge_button.style("color", font_selected);
  } else {
    add_edge_button.style("background-color", color_normal);
    add_edge_button.style("color", font_normal);
  }

  if (opt_flags.delete_edge) {
    delete_edge_button.style("background-color",color_selected);
    delete_edge_button.style("color", font_selected);
  } else {
    delete_edge_button.style("background-color", color_normal);
    delete_edge_button.style("color", font_normal);
  }
}
