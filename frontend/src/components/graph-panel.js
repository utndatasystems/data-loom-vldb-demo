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
      let id = 0
      for (const iter in tables) {
         const table = {
            name: iter,
            attributes: [],
            files: tables[iter],
         };

         const row = Math.floor(id / 4)
         const col = id % 4
         let x = 20 + (200 * col)
         let y = (10 + 150 * row)

         if (iter == "UNKNOWN") {
            x = 300
            y = 800
         }

         const node = {
            id: id.toString(),
            data: { label: <TableNode table={table} onSelectTable={(table) => this.props.onSelectTable(table)} /> },
            position: { x: x, y: y },
         }

         console.log(node)
         id++;

         my_nodes.push(node);
      }

      // const nodes = tables.map((table, idx) => {
      //    table = {
      //       name: table.name,
      //       attributes: [],
      //       files: ,
      //    }
      //    return {
      //       id: idx.toString(),
      //       data: { label: <TableNode table={table} onSelectTable={(table) => this.props.onSelectTable(table)} /> },
      //       position: { x: 50, y: i * 300 },
      //    }
      // });

      // const region_table = { name: "region", attributes: ["r_name", "r_region_key", "r_comment"], files: ["region.csv"] }
      // const nation_table = { name: "nation", attributes: ["n_name", "n_nation_key", "n_comment"], files: ["nation.csv"] }

      // const initialNodes = [
      //    {
      //       id: '1',
      //       data: { label: <TableNode table={region_table} onSelectTable={(table) => this.props.onSelectTable(table)} /> },
      //       position: { x: 50, y: 0 },
      //    },
      //    {
      //       id: '2',
      //       data: { label: <TableNode table={nation_table} onSelectTable={(table) => this.props.onSelectTable(table)} /> },
      //       position: { x: 50, y: 300 },
      //    },
      // ];

      const initialNodes = my_nodes

      const initialEdges = [
         // { id: 'e1-2', source: '1', target: '2' },
      ];

      this.state = { nodes: initialNodes, edges: initialEdges };
   }

   render() {
      return (
         <div style={{ width: 800, height: 1000, backgroundColor: "red" }}>
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
