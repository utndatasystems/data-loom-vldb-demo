import React from 'react';

export default class OverviewPanel extends React.Component {
   constructor(props) {
      super(props);
   }

   render() {
      let unknown_files = []
      for (let idx = 0; idx < this.props.session.tables.length; idx++) {
         const table = this.props.session.tables[idx]
         if (table.name == "UNKNOWN") {
            unknown_files = table.files
            break
         }
      }
      const tables = this.props.session.tables

      return (
         <div>
            <h4>Tables</h4>
            <table class="hover">
               <thead>
                  <tr>
                     <th>Name</th>
                     <th>Attributes</th>
                     <th>Files</th>
                     <th>Certainty</th>
                     <th>Loaded</th>
                  </tr>
               </thead>
               <tbody>
                  {tables.map((table, idx) => { return this.renderTable(table, idx) })}
               </tbody>
            </table>

            <h4>Unused files</h4>
            <ul>
               {unknown_files.map((file_path, index) => <li key={index}>{file_path}</li>)}
            </ul>
         </div>
      );
   }

   renderTable(table, idx) {
      if (table.name == "UNKNOWN") {
         return null;
      }

      const is_selected = idx == this.props.selected_table_idx

      return (
         <tr key={idx} style={{ textAlign: "left", backgroundColor: is_selected ? "#bbd6e9" : undefined }} onClick={() => this.props.onSelectTable(idx)}>
            <td>
               <a>{table.name}</a>
            </td>
            <td>
               {table.attributes.length}
            </td>
            <td>
               {table.files.length}
            </td>
            <td onClick={() => this.onSwapTableReviewed(table)} style={{ cursor: "pointer" }}>
               {this.renderCertainty(table)}
            </td>
            <td onClick={() => this.onSwapTableLoaded(table)} style={{ cursor: "pointer" }}>
               {table.loaded == "yes" ? "✔️" : (table.loaded == "no" ? "❌" : "🔄")}
            </td>
         </tr>
      );
   }

   onSwapTableReviewed(table) {
      // EVIL STATE UPDATE
      table.reviewed = !table.reviewed
      this.props.onUpdateSession(this.props.session)
   }

   onSwapTableLoaded(table) {
      // EVIL STATE UPDATE
      table.loaded = !table.loaded
      this.props.onUpdateSession(this.props.session)
   }

   renderCertainty(table) {
      if (table.reviewed) {
         return (<div style={{ color: "green", fontWeight: "bold" }}>reviewed ✔️</div>)
      }

      const certainty = table.certainty
      if (certainty >= 0.85) {
         return (<div style={{ color: "green" }}>high</div>)
      }
      if (certainty >= 0.75) {
         return (<div style={{ color: "#CC7000" }}>medium</div>)
      }
      return (<div style={{ color: "red" }}>low</div>)
   }
}