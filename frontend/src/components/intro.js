import React from 'react';
import * as util from "../other/util.js";

class IntroScreen extends React.Component {
   constructor(props) {
      super(props);
   }

   render() {
      return (
         <div style={{ textAlign: "center" }} className="grid-x grid-padding-x">
            <div className="large-12 medium-6 cell" style={{ marginTop: "16px", marginBottom: "-16px" }}>
               <br /><br /><br /><br /><br />
               <img src="icon.png" style={{ width: "14%", height: "auto" }} />
               <h1>DataLoom: Simplifying Data Loading with LLMs</h1>
               <h3><span><u>Alexander van Renen</u><span>, Mihail Stoian, Andreas Kipf</span></span></h3>
               <h5>UTN</h5>
               <h5>Technical Univerity of Nürnberg</h5>
            </div >
         </div >
      );
   }
}

export default util.withParamsAndNavigation(IntroScreen);