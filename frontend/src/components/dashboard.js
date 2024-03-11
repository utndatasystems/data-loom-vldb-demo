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
         session: null,
         error: null,
      };

      const session_id = props.params.session_id;
      Backend.get_session(session_id, res => {
         if (res.error) {
            this.setState({
               error: res.error,
            });
            return;
         }

         this.setState({
            error: null,
            selectedTable: null,
            session: JSON.parse(res.session),
         });
      });
   }

   render() {
      const error = this.state.error
      if (error) {
         return (
            <div>
               <p>Server error: {error}</p>
            </div>
         );
      }

      const session = this.state.session
      if (session === null) {
         return <div>Loading...</div>;
      }

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