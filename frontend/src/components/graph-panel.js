import React from 'react';
import ReactFlow, { applyEdgeChanges, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';

class TableNode extends React.Component {
   render() {
      return (
         <div onClick={() => this.onSelectTable()}>
            <h1>{this.props.table.name}</h1>
            <p>{this.props.table.attributes.length} attributes</p>
            <p>{this.props.table.files.length} files</p>
         </div>
      );
   }

   onSelectTable() {
      this.props.onSelectTable(this.props.table);
   }
}

export default class GraphPanel extends React.Component {
   constructor(props) {
      super(props);

      const tables = this.props.session.tables
      const my_nodes = []
      for (let idx = 0; idx < tables.length; idx++) {
         const table = tables[idx]

         const row = Math.floor(idx / 4)
         const col = idx % 4
         let x = 20 + (200 * col)
         let y = (10 + 150 * row)

         if (table.name == "UNKNOWN") {
            x = 300
            y = 800
         }

         const node = {
            id: idx.toString(),
            data: {
               label: <TableNode table={table} onSelectTable={(table) => {
                  this.props.onSelectTable(idx)
               }} />
            },
            position: { x: x, y: y },
         }

         my_nodes.push(node);
      }

      const initialNodes = my_nodes

      const initialEdges = [
         // { id: 'e1-2', source: '1', target: '2' },
      ];

      this.state = { nodes: initialNodes, edges: initialEdges };
   }

   render() {
      return (
         <div style={{ width: 800, height: 1000, backgroundColor: "orange" }}>
            <ReactFlow
               nodes={this.state.nodes}
               edges={this.state.edges}
               onNodesChange={(changes) => this.onNodesChange(changes)}
               onEdgesChange={(changes) => this.onEdgesChange(changes)}
            // panOnDrag={false}
            // zoomOnScroll={false}
            />
         </div>
      );
   }

   onNodesChange(changes) {
      this.setState({ nodes: applyNodeChanges(changes, this.state.nodes) })
   }

   onEdgesChange(changes) {
      this.setState({ edges: applyEdgeChanges(changes, this.state.edges) })
   }
}
