import React from 'react';
import * as Backend from '../backend.js';

export default class TablePanel extends React.Component {
   render() {
      const table = this.getSelectedTable()
      if (table == null) {
         return (
            <div style={{ backgroundColor: "#FFFDD0", width: 300, height: 1000 }}>
               <h1>no table selected</h1>
            </div>
         );
      }

      return (
         <div style={{ backgroundColor: "#FFFDD0", width: 300, height: 1000 }}>
            <h1>{table.name}</h1>

            <div className="cool-button" onClick={() => this.onLoadTable()}>Load</div>

            <h2>Attributes</h2>
            <table>
               <thead>
                  <tr>
                     <th>Attribute</th>
                     <th>Type</th>
                     <th>Nullable</th>
                  </tr>
               </thead>
               <tbody>
                  {table.attributes.map((attribute, index) => {
                     return (
                        <tr key={index} style={{ textAlign: "left" }}>
                           <td><pre onClick={() => { this.onEditAttributeName(attribute) }}>{attribute.name}</pre></td>
                           <td><pre>{attribute.type}</pre></td>
                           <td><pre>{attribute.null ? "nullable" : "not null"}</pre></td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>

            <h2>Files</h2>
            <ul>
               {table.files.map((attribute, index) => {
                  return <li key={index}>{attribute}</li>;
               })}
            </ul>
         </div >
      );
   }

   getSelectedTable() {
      const idx = this.props.selected_table_idx
      if (idx != null) {
         return this.props.session.tables[idx]
      }
   }

   onLoadTable() {
      const table = this.getSelectedTable()
      Backend.load_table(this.props.session.id, table.name, (response) => {
         if (response.error != null) {
            console.log("Error!!!" + response.error);
         }
         console.log("allgoodd")
      })
   }

   onEditAttributeName(attribute) {
      const new_name = window.prompt("Enter attribute name:", attribute.name);
      if (new_name == '' || new_name == null) return

      // EVIL STATE UPDATE
      attribute.name = new_name

      const session = this.props.session
      Backend.updateSession(session.id, session.tables, (response) => {
         if (response.error) {
            alert("Error!!!" + response.error);
            return
         }
         this.props.onUpdateSession(JSON.parse(response.session))
      })
   }
}
