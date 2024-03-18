import React from 'react';
import ReactFlow, { applyEdgeChanges, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';

class TableNode extends React.Component {
   render() {
      // Map 0-1 to a color between orange and green
      const color = `rgb(${255 * (1 - this.props.certainty)}, ${255 * this.props.certainty}, 0)`

      return (
         <div onClick={() => this.onSelectTable()} style={{ backgroundColor: color }}>
            <h4>{this.props.table.name}</h4>
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

      const min_certainty = tables.reduce((min, table) => Math.min(min, table.certainty), 1)
      const max_certainty = tables.reduce((max, table) => Math.max(max, table.certainty), 0)
      const certainty_range = max_certainty - min_certainty
      const my_nodes = []
      for (let idx = 0; idx < tables.length; idx++) {
         const table = tables[idx]
         const certainty = (table.certainty - min_certainty) / certainty_range

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
               label: <TableNode table={table} certainty={certainty} onSelectTable={(table) => {
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
