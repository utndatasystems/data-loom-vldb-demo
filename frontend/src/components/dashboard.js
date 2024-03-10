import React from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';

class TableNode extends React.Component {
   constructor(props) {
      super(props);
   }

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

class TablePanel extends React.Component {
   render() {
      const table = this.props.selectedTable
      if (table == null) {
         return (
            <div style={{ backgroundColor: "green", width: 300, height: 300 }}>
               <h1>no table selectd</h1>
            </div>
         );
      }

      return (
         <div style={{ backgroundColor: "green", width: 300, height: 300 }}>
            <h1>{table.name}</h1>

            <h2>Attributes</h2>
            <ul>
               {table.attributes.map((attribute, index) => {
                  return <li key={index}>{attribute}</li>;
               })}
            </ul>

            <h2>Files</h2>
            <ul>
               {table.files.map((attribute, index) => {
                  return <li key={index}>{attribute}</li>;
               })}
            </ul>
         </div>
      );
   }
}

class Flow extends React.Component {
   constructor(props) {
      super(props);
   }

   render() {
      const region_table = { name: "region", attributes: ["r_name", "r_region_key", "r_comment"], files: ["region.csv"] }
      const nation_table = { name: "nation", attributes: ["n_name", "n_nation_key", "n_comment"], files: ["nation.csv"] }

      const nodes = [
         {
            id: '1',
            data: { label: <TableNode table={region_table} onSelectTable={(table) => this.props.onSelectTable(table)} /> },
            position: { x: 50, y: 0 },
         },
         {
            id: '2',
            data: { label: <TableNode table={nation_table} onSelectTable={(table) => this.props.onSelectTable(table)} /> },
            position: { x: 50, y: 300 },
         },
      ];

      const edges = [
         { id: 'e1-2', source: '1', target: '2' },
      ];

      return (
         <div style={{ width: 800, height: 1000, backgroundColor: "red" }}>
            <ReactFlow nodes={nodes} edges={edges} fitView />
         </div>
      );
   }
}

export default class Dashboard extends React.Component {
   constructor(props) {
      super(props);
      this.state = { selectedTable: null };
   }

   render() {
      return (
         <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
            <Flow onSelectTable={(table) => this.onSelectTable(table)} />
            <TablePanel selectedTable={this.state.selectedTable} />
         </div>
      );
   }

   onSelectTable(table) {
      this.setState({ selectedTable: table });
   }
}

