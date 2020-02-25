
const C0 = 150000 // Repulsion
const C1 = 0.1 // Attraction
const SPRING_LENGHT = 180

let hovered_node = undefined;
let hovered_edge = undefined; 
let hovered_node_flag = false;
let hovered_edge_flag = false;

class Graph {
  constructor() {

    this.adjMatrix = [];
    this.edgeList = [];
    this.nodeList = [];
    this.n_nodes = 0;
    
  }
  
  addNode(id, info, x, y) {

    this.nodeList.push(new Node(id, info, x, y));
    this.n_nodes++;

    // Update adjacency matrix
    this.adjMatrix.push([])
    // Create a row for the new node full of 0
    for (let i=0; i < this.n_nodes-1; i++) this.adjMatrix[this.n_nodes-1].push(0);

    for (let i=0; i < this.n_nodes; i++) {
      // Update all coloumns to make it a square matrix
      this.adjMatrix[i].push(0);
    }
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
  }
  
  addEdge(idNode1, idNode2) {

    if (idNode1 == idNode2) return;

    var node1 = this.findNode(idNode1);
    var node2 = this.findNode(idNode2);
    var node1Index = this.findNodeIndex(idNode1);
    var node2Index = this.findNodeIndex(idNode2);

    if (this.adjMatrix[node1Index][node2Index] != 0) return;
    if (this.adjMatrix[node2Index][node1Index] != 0) return;

    node1.addAdjacentNode(idNode2, node2);
    node2.addAdjacentNode(idNode1, node1);

    this.edgeList.push(new Edge(idNode1, idNode2));

    this.adjMatrix[node1Index][node2Index] = 1;
    this.adjMatrix[node2Index][node1Index] = 1;
  }

  deleteEdge(edge) {
    // Eliminate the edge in the adj matrix
    var id1 = graph.findNodeId(edge.node1);
    var id2 = graph.findNodeId(edge.node2);

    var index1 = graph.findNodeIndex(id1);
    var index2 = graph.findNodeIndex(id2);

    graph.adjMatrix[index1][index2] = 0;
    graph.adjMatrix[index2][index1] = 0;

    // Eliminate the edge in the edge list
    graph.edgeList.splice(graph.edgeList.findIndex(item => item.node1 === edge.node1 && item.node2 === edge.node2), 1)

    // Eliminate the edge in the nodes
    edge.node1.edgesSet.delete(id2);
    edge.node2.edgesSet.delete(id1);
  }

  findNode(nodeId) {
    return this.nodeList.find(node => node.id == nodeId)
  }

  findNodeIndex(nodeId) {
    return this.nodeList.indexOf(this.findNode(nodeId));
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
    for (let node of graph.nodeList) {
      if (node.isInside(mouseX, mouseY)) {
        node.flags.hover = true;
        hovered_node = node;
        hovered_node_flag = true;
      } else { 
        node.flags.hover = false;
      }
      
      node.render();
    }
  }
  
  
  autoCorrectPos() {
    for (let node of this.nodeList) {
      if (node.flags.dragging == true) continue;

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

      node.applyForce(force);
      node.updatePos();
    }
  }
}