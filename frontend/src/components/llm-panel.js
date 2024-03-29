import React from 'react';
import * as Backend from '../backend.js';

export default class LlmPanel extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         loading: false,
      }
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
                     <span className="button" onClick={() => this.onUpdateSessionWithLlm()}>Ask</span>
                  </td>
               </tr>
            </table>
            <form style={{ marginTop: "-20px" }} >
               <div className="radio" style={{ display: 'flex', flexDirection: 'row' }}>
                  <label><input type="radio" value="option1" checked={true} />Table-local</label>
                  <label style={{ marginLeft: '10px' }}><input type="radio" value="option2" />Schema-wide</label>
                  <label style={{ marginLeft: '10px' }}><input type="checkbox" checked={this.props.readOnly} onChange={(e) => this.props.setReadOnly(e.target.checked)} />Read-only</label>
               </div>
            </form>
         </div >
      );
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
      Backend.updateSessionWithLlm(this.props.session.id, this.props.llm_input, this.props.selected_table_idx, response => {
         if (response.error != null) {
            alert("Error!!!" + response.error);
         }
         this.setState({ loading: false });
         this.props.onUpdateSession(JSON.parse(response.session))
      });
   }
}
