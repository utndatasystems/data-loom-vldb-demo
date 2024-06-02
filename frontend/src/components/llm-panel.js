import React from 'react';
import * as Backend from '../backend.js';

export default class LlmPanel extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         loading: false,
         mode: ""
      };
   }

   render() {
      return (
         <div>
            <h5>LLMs Q&A</h5>
            <table>
               <tr>
                  <td>
                     <input type="text" value={this.props.llm_input} onChange={(e) => this.props.setLlmInput(e.target.value)} />
                  </td>
                  <td>
                     {this.renderButton()}
                     {/* <span className="button" onClick={() => this.onUpdateSessionWithLlm()}>Ask</span> */}
                  </td>
               </tr>
            </table>
            <form style={{ marginTop: "-20px" }} >
               <div className="radio" style={{ display: 'flex', flexDirection: 'row' }}>
               <label style={{ marginLeft: '10px' }}><input type="radio" value="table-local" checked={this.state.mode === "table-local"} onChange={() => this.setMode("table-local")} />Table-local</label>
               <label style={{ marginLeft: '10px' }}><input type="radio" value="schema-wide" checked={this.state.mode === "schema-wide"} onChange={() => this.setMode("schema-wide")} />Schema-wide</label>
               <label style={{ marginLeft: '10px' }}><input type="checkbox" checked={this.props.readOnly} onChange={(e) => this.props.setReadOnly(e.target.checked)} />Read-only</label>
               </div>
            </form>
         </div >
      );
   }

   setMode(mode) {
      console.log(mode)
      this.setState({ mode });
   }

   renderButton() {
      if (this.state.loading) {
         return <div>🔄</div>
      } else {
         return <span className="button" onClick={() => this.onUpdateSessionWithLlm()}>Ask</span>
      }
   }

   onUpdateSessionWithLlm() {
      this.setState({ loading: true });
      const { session, llm_input, selected_table_idx } = this.props;
      const mode = this.state.mode;
      Backend.updateSessionWithLlm(session.id, llm_input, selected_table_idx, mode, response => {
         this.setState({ loading: false });
         if (response.error != null) {
            alert("Error!!!" + response.error);
         } else {
            // console.log("Response:", response.session);
            this.props.onUpdateSession(JSON.parse(response.session));
         }
      });
  }

}
