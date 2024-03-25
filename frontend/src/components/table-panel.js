import React from 'react';
import * as Backend from '../backend.js';

export default class TablePanel extends React.Component {
   render() {
      const table = this.getSelectedTable()
      if (table == null) {
         return (
            <div style={{ width: 300, height: 1000 }}>
               <h2>no table selected</h2>
            </div>
         );
      }

      return (
         <div>
            <h2 onClick={() => { this.onEditTableName() }} style={{ cursor: "pointer" }}>{table.name}</h2>

            {this.renderButtons(table)}

            <h4>Certainty</h4>
            <p>{table.certainty}</p>

            {this.renderAttributes(table)}
            {this.renderFiles(table)}
         </div >
      );
   }

   renderButtons(table) {
      if (table.reviewed) {
         return (
            <div>
               <div className="button" onClick={() => this.onLoadTable()}>Load</div>
               <span> </span>
               <div className="button" onClick={() => this.onCreateSql()}>SQL</div>
               <span> </span>
               <div className="button" onClick={() => this.onSwapTableReviewed(table)}>Un-review</div>
            </div>
         );
      }

      return (
         <div>
            <div className="button" onClick={() => this.onSwapTableReviewed(table)}>Mark Reviewed</div>
         </div>
      );
   }

   renderAttributes(table) {
      return (
         <div>
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
                              <pre onClick={() => { this.onEditAttributeName(attribute) }} style={{ cursor: "pointer" }}>{attribute.name}</pre>
                           </td>
                           <td>
                              <pre onClick={() => { this.onEditAttributeType(attribute) }} style={{ cursor: "pointer" }}>{attribute.type}</pre>
                           </td>
                           <td>
                              <pre onClick={() => { this.onEditAttributeNullability(attribute) }} style={{ cursor: "pointer" }}>{attribute.null ? "nullable" : "not null"}</pre>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      );
   }

   renderFiles(table) {
      return (
         <div>
            <h4> Files</h4>
            <ul>
               {table.files.map((file_path, index) => {
                  return (
                     <li key={index}>
                        <a href={"#"} onClick={() => { this.props.onPreviewFile(file_path) }}>{file_path}</a>
                        <span onClick={() => { this.removeFile(file_path) }} style={{ cursor: "pointer" }}>   ❌</span>
                     </li>);
               })}
            </ul>
         </div>
      );
   }

   removeFile(file_path) {
      // EVIL STATE UPDATE
      const table = this.getSelectedTable()
      table.files = table.files.filter((path) => path !== file_path)
      this.props.session.unknown_files.push(file_path)
      this.props.onUpdateSession(this.props.session)
   }

   getSelectedTable() {
      const idx = this.props.selected_table_idx
      if (idx != null) {
         return this.props.session.tables[idx]
      }
   }

   onLoadTable() {
      // EVIL STATE UPDATE
      const table = this.getSelectedTable()
      table["loaded"] = "loading"
      this.props.onUpdateSession(this.props.session)

      Backend.load_table(this.props.session.id, this.props.database, table.name, (response) => {
         if (response.error != null) {
            alert("Error!!!" + response.error);
         }
         this.props.onUpdateSession(JSON.parse(response.session))
      })
   }

   onCreateSql() {
      const table = this.getSelectedTable()
      Backend.create_sql(this.props.session.id, table.name, (response) => {
         if (response.error != null) {
            alert("Error!!!" + response.error);
         }
         this.props.setQuey(response.sql)
      })
   }

   onEditTableName() {
      // EVIL STATE UPDATE
      let table = this.getSelectedTable()
      const new_name = window.prompt("Enter table name:", table.name);
      if (new_name == '' || new_name == null) return
      table.name = new_name
      this.props.onUpdateSession(this.props.session)
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

   onSwapTableReviewed(table) {
      // EVIL STATE UPDATE
      table.reviewed = !table.reviewed
      this.props.onUpdateSession(this.props.session)
   }
}
