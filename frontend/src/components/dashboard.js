import React from 'react';
import 'reactflow/dist/style.css';
import TablePanel from './table-panel';
import GraphPanel from './graph-panel';


export default class Dashboard extends React.Component {
   constructor(props) {
      super(props);
      this.state = { selectedTable: null };
   }

   render() {
      return (
         <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
            <GraphPanel onSelectTable={(table) => this.onSelectTable(table)} />
            <TablePanel selectedTable={this.state.selectedTable} />
         </div>
      );
   }

   onSelectTable(table) {
      this.setState({ selectedTable: table });
   }
}

