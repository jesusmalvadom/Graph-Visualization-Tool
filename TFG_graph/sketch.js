const NUM_NODES = 5;
const MAX_NODE_DEG = 5;

const LENGTH_CONTROL = 600; // Length of the control panel on the right
const MARGIN_CONTROL = 50; // Margin for the infowindow that display information of the nodes 
const MARGIN_BUTTONS = 1000; // Separation between first control button and top
const BUTTON_BAR = 80; // Length of selection buttons 

const LENGTH_CANVAS = window.innerWidth-LENGTH_CONTROL; // Length of the graph canvas
const WIDTH_CANVAS = window.innerHeight; // Width of the graph canvas

const LENGTH_BUTTON = 400; // Length of control buttons and diffusion selection scroll
const WIDTH_BUTTON = 70; // Width of control buttons and diffusion selection scroll

const TIME_BUFFERING = 0;

const COLOR_BACKGROUND = 0;


let graph;
let opt_flags;
let controlBuffer;
let infoBuffer;
let infoWindow;

// Buttons in Info Panel
let pin_node_button;
let change_info_input;
let change_info_button;

//Buttons in Control Pannel
let clear_graph_button;
let pin_graph_button;
let add_node_button;
let delete_node_button;
let add_edge_button;
let delete_edge_button;

// Elements in Diffusion Pannel
let diff_selection;
let play_diff_button;
let pause_diff_button;
let rewind_diff_button;
let velocity_diff_button;
let barabasi_button;


// Selection Buttons to change pannels
let info_button;
let control_button;
let diff_button;

let graph_copy;




function setup() {
  // Canvas where the graph is located
  createCanvas(LENGTH_CANVAS, WIDTH_CANVAS);

  opt_flags = {
    pin_graph : false,
    pin_node : false,
    add_node : false,
    delete_node : false,
    add_edge : false,
    delete_edge : false,

    info_panel : true,
    control_panel : false,
    diff_panel : false,

    diff_pause : true,
    diff_play : false,
    diff_forward : false
  };

  // Different panels and windows
  // To change the structure of the graph
  controlBuffer = createGraphics(LENGTH_CONTROL, WIDTH_CANVAS - BUTTON_BAR);
  controlBuffer.position(LENGTH_CANVAS, BUTTON_BAR);
  controlBuffer.background(150, 0, 0);
  controlBuffer.hide();

  // To see the information of nodes and edges
  infoBuffer = createGraphics(LENGTH_CONTROL, WIDTH_CANVAS - BUTTON_BAR);
  infoBuffer.position(LENGTH_CANVAS, BUTTON_BAR);
  infoBuffer.background(0,155,0);
  infoBuffer.hide();

  infoWindow = createGraphics(LENGTH_CONTROL - (2 * MARGIN_CONTROL), LENGTH_CONTROL - (2 * MARGIN_CONTROL));
  infoWindow.position(LENGTH_CANVAS + MARGIN_CONTROL, WIDTH_CANVAS - LENGTH_CONTROL - MARGIN_CONTROL);
  infoWindow.background(100);
  infoBuffer.strokeWeight();
  infoBuffer.textSize(32);
  infoWindow.hide();

  // To apply a diffusion algorithm
  diffBuffer = createGraphics(LENGTH_CONTROL, WIDTH_CANVAS - BUTTON_BAR);
  diffBuffer.position(LENGTH_CANVAS, BUTTON_BAR);
  diffBuffer.background(0,0,155);
  diffBuffer.hide();

  // Selection panel
  optionBuffer = createGraphics(LENGTH_CONTROL, BUTTON_BAR);
  optionBuffer.position(LENGTH_CANVAS, 0);
  optionBuffer.background(COLOR_BACKGROUND);
  optionBuffer.hide();

    /****************************** Info ******************************/
  // Info Buttons
  pin_node_button = createButton('Seleccionar Nodo');
  pin_node_button.position(LENGTH_CANVAS + (2 * MARGIN_CONTROL), BUTTON_BAR + MARGIN_CONTROL);
  pin_node_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  pin_node_button.mousePressed(function (){
    opt_flags.add_node = false;
    opt_flags.delete_node = false;
    opt_flags.add_edge = false;
    opt_flags.delete_edge = false;
    opt_flags.pin_node = !opt_flags.pin_node;
    if (!opt_flags.pin_node) {
      pinned_node = undefined;
      for (let node of graph.nodeList) {
        node.flags.pinned = false;
      }
    }
  });

  change_info_input = createInput();
  change_info_input.size(200, 40)
  change_info_input.style('font-size', '30px')
  change_info_input.position(infoWindow.x, infoWindow.y-70)

  change_info_button = createButton('Cambiar Información');
  change_info_button.position(change_info_input.x+ change_info_input.width + 10, change_info_input.y );
  change_info_button.size(change_info_input.width, 45);
  change_info_button.mousePressed(function() {
    if (!pinned_node){ 
      alert("Seleccione un nodo");
      return;
    }
    if (!change_info_input.value()) {
      alert("Introduzca un número");
      return;
    }
    if (/^\d+\.\d+$/.test(change_info_input.value()) == false && /^\d+$/.test(change_info_input.value()) == false) {
      alert("Introduzca un número positivo válido");
      return;
    }
    graph.infoSum -= pinned_node.info;
    pinned_node.info = parseFloat(change_info_input.value());
    graph.infoSum += parseFloat(change_info_input.value());
  });


    /****************************** Control ******************************/
  // Control buttons
  clear_graph_button = createButton('Borrar Grafo');
  clear_graph_button.position(LENGTH_CANVAS + (LENGTH_CONTROL - LENGTH_BUTTON)/2, BUTTON_BAR + MARGIN_BUTTONS + (WIDTH_BUTTON + 30) * -3);
  clear_graph_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  clear_graph_button.mousePressed(function (){
    opt_flags.pin_node = false;
    var nodeList_cpy = graph.nodeList.map(a => ({...a}));
    for (let node of nodeList_cpy) {
      graph.deleteNode(node);
    }
    graph.n_nodes_created = 0;
    graph.infoSum = 0;
    nodeList_cpy = undefined;
  });

  pin_graph_button = createButton('Bloquear Grafo');
  pin_graph_button.position(LENGTH_CANVAS + (LENGTH_CONTROL - LENGTH_BUTTON)/2, BUTTON_BAR + MARGIN_BUTTONS + (WIDTH_BUTTON + 30) * -2);
  pin_graph_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  pin_graph_button.mousePressed(function (){
    opt_flags.pin_graph = !opt_flags.pin_graph;
    opt_flags.pin_node = false;

    for (let node of graph.nodeList) {
      node.flags.pinned = opt_flags.pin_graph;
    }
  });

  add_node_button = createButton('Añadir Nodo');
  add_node_button.position(LENGTH_CANVAS + (LENGTH_CONTROL - LENGTH_BUTTON)/2, BUTTON_BAR + MARGIN_BUTTONS + (WIDTH_BUTTON + 30) * 0);
  add_node_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  add_node_button.mousePressed(function (){
    if (opt_flags.add_node) opt_flags.add_node = false;
    else {
      opt_flags.add_node = true;
      opt_flags.delete_node = false;
      opt_flags.add_edge = false;
      opt_flags.delete_edge = false;
      opt_flags.pin_node = false;
    }
  });

  delete_node_button = createButton('Eliminar Nodo');
  delete_node_button.position(LENGTH_CANVAS + (LENGTH_CONTROL - LENGTH_BUTTON)/2, BUTTON_BAR + MARGIN_BUTTONS + (WIDTH_BUTTON + 30) * 1);
  delete_node_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  delete_node_button.mousePressed(function (){
    if (opt_flags.delete_node) opt_flags.delete_node = false;
    else {
      opt_flags.add_node = false;
      opt_flags.delete_node = true;
      opt_flags.add_edge = false;
      opt_flags.delete_edge = false;
      opt_flags.pin_node = false;
    }
  });

  add_edge_button = createButton('Añadir Arista');
  add_edge_button.position(LENGTH_CANVAS + (LENGTH_CONTROL - LENGTH_BUTTON)/2, BUTTON_BAR + MARGIN_BUTTONS + (WIDTH_BUTTON + 30) * 2);
  add_edge_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  add_edge_button.mousePressed(function (){
    if (opt_flags.add_edge) opt_flags.add_edge = false;
    else {
      opt_flags.add_node = false;
      opt_flags.delete_node = false;
      opt_flags.add_edge = true;
      opt_flags.delete_edge = false;
      opt_flags.pin_node = false;
    }
  });

  delete_edge_button = createButton('Eliminar Arista');
  delete_edge_button.position(LENGTH_CANVAS + (LENGTH_CONTROL - LENGTH_BUTTON)/2, BUTTON_BAR + MARGIN_BUTTONS + (WIDTH_BUTTON + 30) * 3);
  delete_edge_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  delete_edge_button.mousePressed(function (){
    if (opt_flags.delete_edge) opt_flags.delete_edge = false;
    else {
      opt_flags.add_node = false;
      opt_flags.delete_node = false;
      opt_flags.add_edge = false;
      opt_flags.delete_edge = true;
      opt_flags.pin_node = false;
    }
  });


  // Selection buttons for the panels
  info_button = createButton('Información');
  control_button = createButton('Control');
  diff_button = createButton('Difusión');

  // Option panel
  drawOptionBuffer();


  /****************************** Diffusion ******************************/
  // Dropdown selection for diffusion algorithm
  diff_selection = createSelect();
  diff_selection.position(LENGTH_CANVAS + (LENGTH_CONTROL - LENGTH_BUTTON)/2, BUTTON_BAR + MARGIN_BUTTONS);
  diff_selection.size(LENGTH_BUTTON, 50);
  diff_selection.option('Random Walk');
  diff_selection.option('Lazy Random Walk');
  diff_selection.option('Preferencial');
  diff_selection.option('Page Rank');
  diff_selection.option('-- Seleccione un algoritmo de difusión --');
  diff_selection.selected('-- Seleccione un algoritmo de difusión --');
  diff_selection.changed(function() {
    opt_flags.diff_pause = true;
    opt_flags.diff_play = false;
    opt_flags.diff_forward = false;
    stop_diffusion();
  })

  var diff_button_dim = 70;
  play_diff_button = createImg('play_button.png');
  play_diff_button.size(diff_button_dim, diff_button_dim);
  play_diff_button.position(diff_selection.x, diff_selection.y + 20 + diff_button_dim);
  play_diff_button.mousePressed(function() {
    opt_flags.diff_pause = false;
    opt_flags.diff_play = true;
    opt_flags.diff_forward = false;

    // copy the graph to get back to it if needed
    if (!graph_copy) graph_copy = new Graph(graph);
    // the parameter is the number of seconds per tick
    stop_diffusion();
    start_diffusion(1, diff_selection.value());
  });

  pause_diff_button = createImg('pause_button.png');
  pause_diff_button.size(diff_button_dim, diff_button_dim);
  pause_diff_button.position(play_diff_button.x + (37 + diff_button_dim), play_diff_button.y);
  pause_diff_button.mousePressed(function() {
    opt_flags.diff_pause = true;
    opt_flags.diff_play = false;
    opt_flags.diff_forward = false;
    stop_diffusion();
  });

  velocity_diff_button = createImg('velocity_button.png');
  velocity_diff_button.size(diff_button_dim, diff_button_dim);
  velocity_diff_button.position(play_diff_button.x + 2*(37 + diff_button_dim), play_diff_button.y);
  velocity_diff_button.mousePressed(function() {
    opt_flags.diff_pause = false;
    opt_flags.diff_play = false;
    opt_flags.diff_forward = true;

    // copy the graph to get back to it if needed
    if (!graph_copy) graph_copy = new Graph(graph);

    stop_diffusion();
    start_diffusion(0.1, diff_selection.value());
  });

  rewind_diff_button = createImg('replay_button.png');
  rewind_diff_button.size(diff_button_dim, diff_button_dim);
  rewind_diff_button.position(play_diff_button.x + 3*(37 + diff_button_dim), play_diff_button.y);
  rewind_diff_button.mousePressed(function() {
    opt_flags.diff_pause = true;
    opt_flags.diff_play = false;
    opt_flags.diff_forward = false;
    stop_diffusion();
    // copy the graph to get back to it if needed
    if (!graph_copy) alert("No ha sido ejecutado ningún algoritmo aún");
    else {
      graph = new Graph(graph_copy);
      graph_copy = undefined;
    }
  });


  barabasi_button = createButton('Nodos con Conexión Preferencial');
  barabasi_button.position(play_diff_button.x, play_diff_button.y + diff_button_dim + 40);
  barabasi_button.size(LENGTH_BUTTON, WIDTH_BUTTON);
  barabasi_button.mousePressed(function (){
    var prompt_input = prompt("\"El modelo Barabási–Albert (BA) es un algoritmo para generar redes aleatorias libres de escala usando el mecanismo de conexión preferencial\"\n\n¿Cuántos nodos desea añadir con este criterio?", "0");
    if (!prompt_input.match(/^\d+$/)) {
      alert("Introduzca un número entero positivo");
      return;
    }
    if (prompt_input != null || prompt_input != "") {
      // TODO error control of type and magnitude
      var n_barabasi = parseInt(prompt_input, 10);
      if (n_barabasi > 100){
        alert("Introduzca un número menor que 100");  
        return;      
      }
      for (let i = 0; i < n_barabasi; i++) {
        var new_node = graph.addNode('id'+graph.n_nodes_created, 0);
        new_node.flags.new_node = true;
        preferential_attachment(new_node);
      }

    }
  });
  

  /****************************** Graph ******************************/
  graph = new Graph();
  
  // Create nodes
  for (let i = 0; i < NUM_NODES; i++) {
    graph.addNode('id'+i, 1);
  }
  
  // all nodes are added, now it's time to add edges
  for (let i = 0; i < NUM_NODES; i++) {
    let node_deg = ceil(random(MAX_NODE_DEG));
    for (let j = 0; j < node_deg; j++) {
      let other_node = floor(random(NUM_NODES));
      if (i!=other_node) graph.addEdge('id'+i, 'id'+other_node);
    }
  }
  
}

// Time buffering
let buffering = 0;

function draw() {
  if (buffering < TIME_BUFFERING){
    graph.autoCorrectPos();
    buffering++;
    return;
  }

  background(100);

  // Draw the corresponding pannel
  if (opt_flags.control_panel) drawControlBuffer();
  else if (opt_flags.diff_panel) drawDiffBuffer();
  else if (opt_flags.info_panel) drawInfoBuffer();

  // Information about the state of the algorithms (running, paused...)
  var diffText;
  if (opt_flags.diff_pause) diffText = "Algoritmo Pausado";
  else if (opt_flags.diff_play) diffText = "Ejecutando el Algoritmo \"" + diff_selection.value() + "\" -> 1 segundo por tick";
  else if (opt_flags.diff_forward) diffText = "Ejecutando el Algoritmo \"" + diff_selection.value() + "\" -> 0.1 segundos por tick";

  textStyle(NORMAL);
  strokeWeight()
  textSize(30)
  text(diffText, 10, WIDTH_CANVAS - 20);
  

  graph.show();
  graph.autoCorrectPos();


  // Aestethic lines for better visualitation 
  stroke(0);
  strokeWeight(5);
  line(3, 3, 3, LENGTH_CANVAS-3); // Left window constraint
  line(3, 3, LENGTH_CANVAS+3, 3); // Upper window Constraint
  line(3, WIDTH_CANVAS-3, LENGTH_CANVAS+100, WIDTH_CANVAS-3); // Down window Constraint
  line(LENGTH_CANVAS-3, 3, LENGTH_CANVAS-3, WIDTH_CANVAS); // Line between canvas and option panel

  // TODO Little trick to make the line not disappear, might fix it later 
  if (selected_node) {
    stroke(74, 244, 255);
    strokeWeight(3);
    line(selected_node.pos.x, selected_node.pos.y, mouseX, mouseY);
  }
}

// Option selection bar
function drawOptionBuffer() {
  optionBuffer.show();

  var margin_btw_buttons = 5;
  var margin_from_top = 10;
  var length_opt_button = (LENGTH_CONTROL / 3) - (margin_btw_buttons * 2);
  var width_opt_button = BUTTON_BAR - margin_from_top; 
  

  // Info Panel button
  info_button.position(LENGTH_CANVAS + margin_btw_buttons, margin_from_top);
  info_button.size(length_opt_button, width_opt_button);
  info_button.mousePressed(function (){
    opt_flags.info_panel = true;
    opt_flags.control_panel = false;
    opt_flags.diff_panel = false;
  });

  // Info Panel button
  control_button.position(LENGTH_CANVAS + margin_btw_buttons + (length_opt_button+margin_btw_buttons*2) * 1, margin_from_top);
  control_button.size(length_opt_button, width_opt_button);
  control_button.mousePressed(function (){
    opt_flags.info_panel = false;
    opt_flags.control_panel = true;
    opt_flags.diff_panel = false;
  });

  // Info Panel button
  diff_button.position(LENGTH_CANVAS + margin_btw_buttons + (length_opt_button+margin_btw_buttons*2) * 2, margin_from_top);
  diff_button.size(length_opt_button, width_opt_button);
  diff_button.mousePressed(function (){
    opt_flags.info_panel = false;
    opt_flags.control_panel = false;
    opt_flags.diff_panel = true; 
  });
}


// Control panel situated at the right side
function drawControlBuffer() {
  hide_diff_panel();
  hide_info_panel();

  show_control_panel();

}

// Information panel situated in the control buffer
function drawInfoBuffer() {
  hide_diff_panel();
  hide_control_panel();

  show_info_panel();
  infoWindow.background(100);
  infoBuffer.background(0,155,0);

  // Line constraints for the infoWindow
  infoBuffer.stroke(10);
  infoBuffer.strokeWeight(15);
  infoBuffer.rect(MARGIN_CONTROL, WIDTH_CANVAS-LENGTH_CONTROL-MARGIN_CONTROL-BUTTON_BAR, LENGTH_CONTROL - (2 * MARGIN_CONTROL), LENGTH_CONTROL - (2 * MARGIN_CONTROL));


  infoBuffer.strokeWeight(0);
  infoBuffer.textSize(40);
  infoBuffer.textStyle(BOLD);

  textPos = createVector(MARGIN_CONTROL*1.5, MARGIN_CONTROL*5)
  var text;
  var info_input;

  // Draw the nodes
  node_info = undefined;
  if (pinned_node != undefined) node_info = pinned_node;
  else if (hovered_node != undefined) node_info = hovered_node;

  if (node_info != undefined){
    var pos = (LENGTH_CONTROL - (2 * MARGIN_CONTROL)) / 2;
    node_info.render(pos, pos, 100, true);

    text = 'Nodo\n\n'
    infoBuffer.text(text, textPos.x, textPos.y);
    infoBuffer.textStyle(NORMAL);
    text = 'ID: ' + node_info.id + '\nInformación: ' + node_info.info.toFixed(2);
    text += '\nGrado: ' + node_info.edgesSet.size;
    infoBuffer.text(text, textPos.x, textPos.y+80);
    
    
  } else if (hovered_edge_flag == true){ // There's a hovered edge
    var pos = (LENGTH_CONTROL - (2 * MARGIN_CONTROL)) / 2;
    var radius = 60;
    hovered_edge.render(pos - 150 + radius, pos, pos + 150 - radius, pos, true);
    hovered_edge.node1.render(pos-150, pos, radius, true);
    hovered_edge.node2.render(pos+150, pos, radius, true);

    infoBuffer.text('Arista', textPos.x, textPos.y);

  } else {
    text = 'Grafo\n\n'
    infoBuffer.text(text, textPos.x, textPos.y);
    infoBuffer.textStyle(NORMAL);
    text = 'Número de Nodos: ' + graph.n_nodes + '\nNúmero de Aristas: ' + graph.n_edges;
    text += '\nInformación Total: ' + graph.infoSum.toFixed(2) + '\nGrado medio: ' + (graph.n_nodes == 0 ? 0 : (2*(graph.n_edges/graph.n_nodes)).toFixed(2));
    infoBuffer.text(text, textPos.x, textPos.y+80);
  }

  return;
  
}

// Information panel situated in the control buffer
function drawDiffBuffer() {
  hide_control_panel();
  hide_info_panel();

  show_diff_panel();
}


// User Interactions
let dx = 0; // To move nodes
let dy = 0; // To move nodes
let dragged_node;
let selected_node;

function mousePressed() {

  
  if (opt_flags.add_node) { // Add nodes

    if (mouseX < LENGTH_CANVAS && mouseY < WIDTH_CANVAS) 
      graph.addNode('id'+graph.n_nodes_created, 0, mouseX, mouseY);

  } else if (opt_flags.delete_node) { // Delete Nodes

    for (let node of graph.nodeList) {
      if (node.flags.hover) {
        graph.deleteNode(node);
      }
    }

  } else if (opt_flags.add_edge) { // Add Edges

    for (let node of graph.nodeList) {
      if (node.flags.hover) {
        node.flags.selected = true;
        selected_node = node;
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
  } else if (opt_flags.pin_node) { // Select Node

    for (let node of graph.nodeList) {
      if (node.flags.hover) {
        if (pinned_node) pinned_node.flags.pinned = false;
        node.flags.pinned = true;
        pinned_node = node; // In case we are going to move it
        break;
      }
    }

  } else { // Move nodes
    //If user clicks on a node, with no options activated, we pinned or preparate it to get moving
    for (let node of graph.nodeList) {
      if (node.flags.hover) {
        node.flags.dragging = true;
        dragged_node = node; // In case we are going to move it
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
}

function mouseReleased() {
  if (dragged_node) {
    dragged_node.flags.dragging = false;
    dragged_node = undefined;
  }

  if (selected_node) {
    if (hovered_node_flag) {
      graph.addEdge(selected_node.id, hovered_node.id);
    }

    selected_node.flags.selected = false;
    selected_node = undefined;
  }
}

// Colors for control buttons
let color_selected = "#FF8080"
let font_selected = "#FFFFFF"
let color_normal = "#FFFFFF"
let font_normal = "#000000"

function show_control_buttons() {
  pin_graph_button.show();
  clear_graph_button.show();
  add_node_button.show();
  delete_node_button.show();
  add_edge_button.show();
  delete_edge_button.show();

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

function hide_control_buttons() {
  pin_graph_button.hide();
  clear_graph_button.hide();
  add_node_button.hide();
  delete_node_button.hide();
  add_edge_button.hide();
  delete_edge_button.hide(); 
}

function hide_control_panel() {
  hide_control_buttons();
  controlBuffer.hide();
}

function show_control_panel() {
  controlBuffer.show();
  show_control_buttons();
}

function hide_diff_panel() {
  diffBuffer.hide();
  diff_selection.hide();
  play_diff_button.hide();
  pause_diff_button.hide();
  rewind_diff_button.hide();
  velocity_diff_button.hide();
  barabasi_button.hide();
}

function show_diff_panel() {
  diffBuffer.show();
  diff_selection.show();
  play_diff_button.show();
  pause_diff_button.show();
  rewind_diff_button.show();
  velocity_diff_button.show();
  barabasi_button.show();
}

function hide_info_panel() {
  infoBuffer.hide();
  infoWindow.hide();
  pin_node_button.hide();
  change_info_input.hide();
  change_info_button.hide();
}

function show_info_panel() {
  infoBuffer.show();
  infoWindow.show();
  change_info_input.show();
  change_info_button.show();
  if (opt_flags.pin_node) {
    pin_node_button.style("background-color",color_selected);
    pin_node_button.style("color", font_selected);
  } else {
    pin_node_button.style("background-color", color_normal);
    pin_node_button.style("color", font_normal);
  }
  pin_node_button.show();
}
