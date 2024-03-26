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
            <input type="text" value={this.props.llm_input} onChange={(e) => this.props.setLlmInput(e.target.value)} />
            {this.renderButton()}
         </div >
      );
   }

   renderButton() {
      if (this.state.loading) {
         return <div>🔄</div>
      } else {
         return <div className="button" onClick={() => this.onUpdateSessionWithLlm()}>Ask</div>
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
