import React from 'react';
import * as Backend from '../backend.js';

export default class TablePanel extends React.Component {
   render() {
      const table = this.getSelectedTable()
      if (table == null) {
         return (
            <div style={{ backgroundColor: "#FFFDD0", width: 300, height: 1000 }}>
               <h2>no table selected</h2>
            </div>
         );
      }

      return (
         <div className="grid-x grid-padding-x" style={{ backgroundColor: "#FFFDD0", width: 500, height: 1000 }}>
            <div className="large-12 cell">
               <div className="callout">

                  <h2>{table.name}</h2>

                  <div className="button" onClick={() => this.onLoadTable()}>Load</div>

                  <h4>Certainty</h4>
                  <p>{table.certainty}</p>

                  <h4>Attributes</h4>
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
                                 <td>
                                    <pre onClick={() => { this.onEditAttributeName(attribute) }}>{attribute.name}</pre>
                                 </td>
                                 <td>
                                    <pre onClick={() => { this.onEditAttributeType(attribute) }}>{attribute.type}</pre>
                                 </td>
                                 <td>
                                    <pre onClick={() => { this.onEditAttributeNullability(attribute) }}>{attribute.null ? "nullable" : "not null"}</pre>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>

                  <h4>Files</h4>
                  <ul>
                     {table.files.map((attribute, index) => {
                        return <li key={index}>{attribute}</li>;
                     })}
                  </ul>
               </div >
            </div >
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
      // EVIL STATE UPDATE
      const new_name = window.prompt("Enter attribute name:", attribute.name);
      if (new_name == '' || new_name == null) return
      attribute.name = new_name
      this.props.onUpdateSession(this.props.session)
   }

   onEditAttributeType(attribute) {
      // EVIL STATE UPDATE
      const new_type = window.prompt("Enter attribute type:", attribute.type);
      if (new_type == '' || new_type == null) return
      attribute.type = new_type
      this.props.onUpdateSession(this.props.session)
   }

   onEditAttributeNullability(attribute) {
      // EVIL STATE UPDATE
      attribute.null = !attribute.null
      this.props.onUpdateSession(this.props.session)
   }
}
