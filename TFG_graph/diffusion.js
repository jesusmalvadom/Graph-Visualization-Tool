
// A unique ID to control the interval
let intervalID;

function start_diffusion(velocity, algorithm) {
	switch(algorithm){
		case "Random Walk":
			intervalID = setInterval(uniform_diffusion, 1000*velocity);
			break;
		case "Lazy Random Walk":
			intervalID = setInterval(lazyrw_diffusion, 1000*velocity);
			break;
		case "Preferencial":
			intervalID = setInterval(preferential_diffusion, 1000*velocity);
			break;
		case "Page Rank":
			intervalID = setInterval(pagerank_diffusion, 1000*velocity);
			break;
		default:
			opt_flags.diff_pause = true;
		    opt_flags.diff_play = false;
		    opt_flags.diff_forward = false;
		    break;
	}
}

function stop_diffusion() {
	clearInterval(intervalID);
}

function uniform_diffusion() {

	// Calculation of the adjacency matrix
	// by using the degree of each node to compute the posibility of diffusion uniformally
	for (let i=0; i<graph.adjMatrix.length; i++) {
		if (graph.adjMatrix[i].includes(-1) || graph.adjMatrix[i].reduce((a,b) => a + b, 0) != -9){
			// Reset the array to 0
			graph.adjMatrix[i].fill(0)
			
			var nodedeg = graph.nodeList[i].edgesSet.size;
			for (j=0; j<graph.adjMatrix[i].length; j++) {
				if (graph.nodeList[i].edgesSet.has(graph.nodeList[j].id)) {
					graph.adjMatrix[i][j] = 1/nodedeg
				}
			}
		}

		graph.adjMatrix[i][i] = -10;
	}
	
	diffusion();
}

function lazyrw_diffusion() {

	// Calculation of the adjacency matrix
	// by using the degree of each node to compute the posibility of diffusion uniformally
	for (let i=0; i<graph.adjMatrix.length; i++) {
		if (graph.adjMatrix[i].includes(-1) || graph.adjMatrix[i].reduce((a,b) => a + b, 0) != -19){
			// Reset the array to 0
			graph.adjMatrix[i].fill(0)

			var nodedeg = graph.nodeList[i].edgesSet.size;
			for (j=0; j<graph.adjMatrix[i].length; j++) {
				if (graph.nodeList[i].edgesSet.has(graph.nodeList[j].id)) {
					graph.adjMatrix[i][j] = 0.5/nodedeg
				}
			}
		}

		graph.adjMatrix[i][i] = -20;
	}
	
	diffusion();
}

function preferential_diffusion() {

	// Calculation of the adjacency matrix
	// by diffusing to the most connected neighbours
	// for each row in the matrix
	for (let i=0; i<graph.adjMatrix.length; i++) {
		//if the row has not been set correctly yet
		if (graph.adjMatrix[i].includes(-1) || graph.adjMatrix[i].reduce((a,b) => a + b, 0) != -29){
			// Reset the array to 0
			graph.adjMatrix[i].fill(0)

			var neigh_deg_sum = 0;
			// for each node calculate the sum of neighbours of degree 2 (neighs. of neighs.) in neigh_deg_sum
			for (let edge_i of graph.nodeList[i].edgesSet) {
				neigh_deg_sum += graph.findNodeById(edge_i).edgesSet.size;
			}

			for (let j=0; j<graph.adjMatrix[i].length; j++) {
				if (graph.nodeList[i].edgesSet.has(graph.nodeList[j].id)) {
					graph.adjMatrix[i][j] = graph.nodeList[j].edgesSet.size/neigh_deg_sum;
				}
			}
		}
		graph.adjMatrix[i][i] = -30
	}
	
	diffusion();
}

function pagerank_diffusion() {

	// Calculation of the adjacency matrix
	// by uniformally through neighbours and also randomly
	// for each row in the matrix
	for (let i=0; i<graph.adjMatrix.length; i++) {
		//if the row has not been set correctly yet
		if (graph.adjMatrix[i].includes(-1) || Math.round(graph.adjMatrix[i].reduce((a,b) => a + b, 0)) != -39) {
			var nodedeg = graph.nodeList[i].edgesSet.size;
			var flag_total_connected = (nodedeg == graph.n_nodes - 1) ? true : false;
			var disconnected_nodes = []

			// Reset the array to 0
			graph.adjMatrix[i].fill(0)

			// If the node is connected with all the other nodes, diffusion is uniform; otherwise, pagerank
			for (let j=0; j<graph.adjMatrix[i].length; j++) {
				// Calculate the indexes of disconnected nodes 
				if (i!=j && graph.nodeList[i].edgesSet.has(graph.nodeList[j].id) == false) {
			   		disconnected_nodes.push(j);
			   	// It exists an edge between i and j nodes
			  	} else {
			  		// Uniform diffusion because the node is totally connected
			  		if (flag_total_connected){ 
			  			graph.adjMatrix[i][j] = 1/nodedeg 
			  		// 0.9 of information
			  		} else {
			  			graph.adjMatrix[i][j] = 0.9/nodedeg 
			  		}
			  	}
			}


			if ((nodedeg == 0 && !graph.adjMatrix[i].includes(0.1)) || (nodedeg != 0 && !flag_total_connected)) {
				graph.adjMatrix[i][disconnected_nodes[Math.floor(Math.random() * disconnected_nodes.length)]] = 0.1;
			}
		}
		graph.adjMatrix[i][i] = -40
	}
	
	diffusion();
}


function pass_info(nodeFrom, nodeTo, info) {
	nodeFrom.info -= info;
	nodeTo.info += info;
}


function diffusion(){
	// An iteration of the algorithm passing the information through the graph using the adjacency matrix
	stroke(0);
    strokeWeight(2);
    fill(255, color, color);
    infoWindow.ellipse(40,40,100,100);
	// TODO Esta manera de clonar arrays puede ser muy ineficiente, explorar la posibilidad de hacerlo sin clonar
	// Esta lista no es una lista de nodos sino de objects
	var nodeList_cpy = graph.nodeList.map(a => ({...a}));
	graph.nodeList.map((node_i) => node_i.info=0);

	for (let node of nodeList_cpy) {
		var nodeIndex = graph.findNodeIndex(graph.findNodeId(node));

		var available_info = node.info;
		if (available_info == 0) continue;

		for (let i=0; i<graph.adjMatrix[nodeIndex].length; i++) {
			if (i == nodeIndex) continue;
			if (graph.adjMatrix[nodeIndex][i] > 0) {
				pass_info(node, graph.nodeList[i], available_info * graph.adjMatrix[nodeIndex][i]);
			}
		}
		// In case the node is disconnected, it doesn't lose its info
		pass_info(node, graph.nodeList[nodeIndex], node.info);
	}
}


function preferential_attachment(nodeFrom) {
	// For each one of the other nodes in the graph, we calculate the possibility of attachment
	var nodeIndex = graph.findNodeIndex(nodeFrom.id);
	for (let node of graph.nodeList) {
		if (node.id == nodeFrom.id) continue;

		// Probability of attachment based on the degree of the node we are looking
		// TODO no sé si el denominador es 2*n_edges
		var prob = (graph.n_edges == 0 ? 0 : node.edgesSet.size/(graph.n_edges));
		var aux = Math.random();
		if (aux <= prob) graph.addEdge(node.id, nodeFrom.id);

	}
}