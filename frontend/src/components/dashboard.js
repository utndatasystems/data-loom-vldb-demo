import React from 'react';
import TablePanel from './table-panel';
import GraphPanel from './graph-panel';
import * as Backend from '../backend.js';
import * as util from "../other/util.js";

class Dashboard extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         selectedTable: null,
         session: null
      };

      const session_id = props.params.session_id;
      Backend.get_session(session_id, res => {
         this.setState({
            selectedTable: null,
            session: JSON.parse(res.session),
         });
         console.log()
      });
   }

   render() {
      const session = this.state.session
      if (session === null) {
         return <div>Loading...</div>;
      }

      if (session.error != null) {
         return (
            <div>
               <p>Error: {session.error}</p>
               <p>{JSON.stringify(session, null, 2)}</p>
            </div>
         );
      }

      console.log(this.props.params.session_id)
      return (
         <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
            <GraphPanel session={session} onSelectTable={(table) => this.onSelectTable(table)} />
            <TablePanel selectedTable={this.state.selectedTable} />
         </div>
      );
   }

   onSelectTable(table) {
      this.setState({ selectedTable: table });
   }
}

export default util.withParams(Dashboard);