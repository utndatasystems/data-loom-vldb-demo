import React from 'react';

export default class OverviewPanel extends React.Component {
   constructor(props) {
      super(props);
   }

   render() {
      const tables = this.props.session.tables

      return (
         <div>
            <h4>Tables</h4>
            <table className="hover">
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
                  {tables.map((table, idx) => { return this.renderRow(table, idx) })}
               </tbody>
            </table>

            {this.renderUnusedFiles()}
         </div>
      );
   }

   renderRow(table, idx) {
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
               {table.loaded == "yes" ? "✅" : (table.loaded == "no" ? "no" : "🔄")}
            </td>
         </tr>
      );
   }

   renderUnusedFiles() {
      let unknown_files = this.props.session.unknown_files

      return (
         <div><h4>Unused files</h4>
            <ul>
               {unknown_files.map((file_path, index) => {
                  return (
                     <li key={index}>
                        <span>{file_path}    </span>
                        <span onClick={() => { this.onAssignFile(file_path) }}>➡️</span></li>)
               })}
            </ul>
         </div>);
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

   onAssignFile(file_path) {
      const target_table = window.prompt("Enter table name:", "");
      if (target_table == '' || target_table == null) return

      // EVIL STATE UPDATE
      const table = this.props.session.tables.find(table => table.name == target_table)
      table.files.push(file_path)
      this.props.session.unknown_files = this.props.session.unknown_files.filter((path) => path !== file_path)
      this.props.onUpdateSession(this.props.session)
   }

   renderCertainty(table) {
      if (table.reviewed) {
         return (<div style={{ color: "green" }}>✅</div>)
      }

      const certainty = table.certainty
      if (certainty >= 0.85) {
         return (<div style={{ fontWeight: "bold", color: "green" }}>high</div>)
      }
      if (certainty >= 0.75) {
         return (<div style={{ fontWeight: "bold", color: "#CC7000" }}>medium</div>)
      }
      return (<div style={{ fontWeight: "bold", color: "red" }}>low</div>)
   }
}