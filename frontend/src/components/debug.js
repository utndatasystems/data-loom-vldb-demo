import React from 'react';
import * as Backend from '../backend.js';
import * as util from "../other/util.js";

class Debug extends React.Component {
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
      if (this.state.session === null) {
         return <div>Loading...</div>;
      }

      return (
         <div style={{ textAlign: "left" }}>
            <p>Debugging session: {this.props.params.session_id}</p>
            <p>Session:</p>
            <pre>
               {JSON.stringify(this.state.session, null, 2)}
            </pre>
         </div>
      );
   }
}

export default util.withParams(Debug);