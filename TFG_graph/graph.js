
const C0 = 50000 // Repulsion
const C1 = 0.08 // Attraction
const SPRING_LENGHT = 350

const max_force = 25;

let hovered_node = undefined;
let pinned_node = undefined;
let hovered_edge = undefined; 
let hovered_node_flag = false;
let hovered_edge_flag = false;

class Graph {
  constructor(g=undefined) {
    if (!g) {

      this.adjMatrix = [];
      this.edgeList = [];
      this.nodeList = [];
      this.n_nodes = 0;
      this.n_nodes_created = 0;
      this.infoSum = 0;
      this.n_edges = 0;
    } else {

      this.adjMatrix = g.adjMatrix.map(function(arr) {return arr.slice()});
      this.nodeList = g.nodeList.map(function(node) {return new Node(node.id, node.info, node.pos.x, node.pos.y, node.edgesSet)});

      this.edgeList = new Array();
      for (let edge_i of g.edgeList) {
        var node_1 = this.nodeList.find(node => node.id == edge_i.node1.id);
        var node_2 = this.nodeList.find(node => node.id == edge_i.node2.id);
        this.edgeList.push(new Edge(node_1, node_2));
      }

      this.n_nodes = g.n_nodes;
      this.n_nodes_created = g.n_nodes_created;
      this.infoSum = g.infoSum;
      this.n_edges = g.n_edges;
    }
  }
  
  addNode(id, info, x, y) {
    var new_node = new Node(id, info, x, y);

    this.nodeList.push(new_node);
    this.n_nodes++;
    this.n_nodes_created++;

    // Update adjacency matrix
    this.adjMatrix.push([])
    // Create a row for the new node full of 0
    for (let i=0; i < this.n_nodes-1; i++) this.adjMatrix[this.n_nodes-1].push(0);

    for (let i=0; i < this.n_nodes; i++) {
      // Update all coloumns to make it a square matrix
      this.adjMatrix[i].push(0);
    }

    this.infoSum += info;
    return new_node;
  }

  deleteNode(node) {
    var nodeId = this.findNodeId(node);
    var nodeIndex = this.findNodeIndex(nodeId);

    // Delete the edges attached to this node
    var edgeList_cpy = [...this.edgeList];
    for (let edge of edgeList_cpy) {
      if (edge.node1.id == nodeId || edge.node2.id == nodeId) {
        graph.deleteEdge(edge);
      }
    }

    // Delete the corresponding row of the matrix
    graph.adjMatrix.splice(nodeIndex, 1);

    // Delete the corresponding coloumn
    for (let i=0; i<this.adjMatrix.length; i++) {
      graph.adjMatrix[i].splice(nodeIndex, 1);
    }

    // Delete the node from the nodeList
    graph.nodeList.splice(nodeIndex, 1);
    graph.n_nodes--;

    // Substract the info qty of the node from the total
    graph.infoSum -= node.info;
  }
  
  addEdge(idNode1, idNode2) {

    if (idNode1 == idNode2) return;

    var node1 = this.findNodeById(idNode1);
    var node2 = this.findNodeById(idNode2);
    var node1Index = this.findNodeIndex(idNode1);
    var node2Index = this.findNodeIndex(idNode2);

    if (node1.edgesSet.has(idNode2)) return;
    if (node2.edgesSet.has(idNode1)) return;

    node1.addAdjacentNode(idNode2);
    node2.addAdjacentNode(idNode1);

    this.edgeList.push(new Edge(graph.findNodeById(idNode1), graph.findNodeById(idNode2)));

    // To notify diffusion algorithms the new edge
    this.adjMatrix[node1Index][node2Index] = -1;
    this.adjMatrix[node2Index][node1Index] = -1;

    // To inform the diffusion algorithms that some edge has been added
    graph.adjMatrix[node1Index][node1Index] = 0;
    graph.adjMatrix[node2Index][node2Index] = 0;


    this.n_edges++;
  }

  deleteEdge(edge) {
    // Eliminate the edge in the adj matrix
    var id1 = graph.findNodeId(edge.node1);
    var id2 = graph.findNodeId(edge.node2);

    var index1 = graph.findNodeIndex(id1);
    var index2 = graph.findNodeIndex(id2);

    // To stop diffusion from one node to another
    graph.adjMatrix[index1][index2] = 0;
    graph.adjMatrix[index2][index1] = 0;

    // To inform the diffusion algorithms that some edge has been deleted
    graph.adjMatrix[index1][index1] = 0;
    graph.adjMatrix[index2][index2] = 0;

    // Eliminate the edge in the edge list
    graph.edgeList.splice(graph.edgeList.findIndex(item => item.node1 === edge.node1 && item.node2 === edge.node2), 1)

    // Eliminate the edge in the nodes
    edge.node1.edgesSet.delete(id2);
    edge.node2.edgesSet.delete(id1);
    this.n_edges--;
  }

  findNodeById(nodeId) {
    return this.nodeList.find(node => node.id == nodeId)
  }

  findNodeIndex(nodeId) {
    return this.nodeList.indexOf(this.findNodeById(nodeId));
  }

  findNodeId(node) {
    return this.nodeList.find(item => item.id == node.id).id;
  }

  show() {
    // Draw the edges
    hovered_edge_flag = false;
    for (let edge of graph.edgeList) {
      if (edge.isInside(mouseX, mouseY)) {
        edge.flags.hover = true;
        hovered_edge = edge;
        hovered_edge_flag = true;
      } else {
        edge.flags.hover = false;
      }
      
      edge.render();
    }

    // Draw the nodes
    hovered_node_flag = false;
    hovered_node = undefined;
    var curve = graph.n_nodes
    var mean = clamp(graph.infoSum/graph.n_nodes, 0, 0.1)

    for (let node of graph.nodeList) {
      if (node.isInside(mouseX, mouseY)) {
        node.flags.hover = true;
        hovered_node = node;
        hovered_node_flag = true;
      } else { 
        node.flags.hover = false;
      }
      
      // Gradient of color depending on the information each node have
      var intensity_color;
      if (this.infoSum == 0 || node.info == 0) intensity_color = 255;
      else {
        // var _min = 0.08
        // var _max = 0.15
        // var curve = graph.n_nodes
        // var var_n_nodes = (graph.n_nodes <= 5 ? _max : clamp((200*_min)/graph.n_nodes, _min, _max))
        intensity_color = clamp(255 - 255*(0.5*erf(curve*((node.info/this.infoSum)-mean)) + 0.5), 0, 255);
      }

      node.render(undefined, undefined, undefined, undefined, intensity_color);
    }
  }
  
  
  autoCorrectPos() {

    for (let node of this.nodeList) {
      if (node.flags.dragging || node.flags.pinned) continue;

      let force = createVector(0,0);
      
      for (let otherNode of this.nodeList) {
        if (node != otherNode) {
          
          // Vector between the 2 nodes
          let v = createVector(node.pos.x - otherNode.pos.x, node.pos.y - otherNode.pos.y);
          let v_norm = createVector(node.pos.x - otherNode.pos.x, node.pos.y - otherNode.pos.y).normalize();

          // Repulsive force for nodes in the graph
          var st = C0 / v.magSq();
          let repulsive_force = v_norm.mult(st);
          force.add(repulsive_force);
              
          // // Attractive force for nodes in their adjacency
          if (node.checkAdjacentNode(otherNode.id)) {
            let v_norm = createVector(otherNode.pos.x - node.pos.x, otherNode.pos.y - node.pos.y).normalize();
            st = C1 * (v.mag() - SPRING_LENGHT);
            let attractive_force = v_norm.mult(st);
            force.add(attractive_force);
          }
        }
      }

      if (force.mag() > max_force) force.setMag(max_force)
      node.applyForce(force);
      node.updatePos();
    }
  }
}