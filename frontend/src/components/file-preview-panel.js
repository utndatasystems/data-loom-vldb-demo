import React from 'react';

export default class FilePreviewPanel extends React.Component {
   constructor(props) {
      super(props);
   }

   refreshCaches() {
      // const tables = this.props.session.tables
      // this.min_certainty = tables.reduce((min, table) => Math.min(min, table.certainty), 1)
      // this.max_certainty = tables.reduce((max, table) => Math.max(max, table.certainty), 0)
      // this.certainty_range = this.max_certainty - this.min_certainty
   }

   render() {
      this.refreshCaches()
      const tables = this.props.session.tables

      return (
         <div style={{ width: "100%", overflow: "scroll" }}>
            <h4>File Preview: {this.props.file_path}</h4>
            <table>
               <tbody>
                  {this.props.file_preview.map((row, idx) => {
                     return (
                        <tr key={idx} style={{ textAlign: "left" }}>
                           {row.map((cell, idx) => {
                              return <td key={idx}>{cell}</td>
                           })}
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
      );
   }

   // renderTable(table, idx) {
   //    const certainty = (table.certainty - this.min_certainty) / this.certainty_range

   //    if (table.name == "UNKNOWN") {
   //       return null;
   //    }

   //    return (
   //       <tr key={idx} style={{ textAlign: "left" }}>
   //          <td>
   //             {/* <pre onClick={() => { this.onEditAttributeName(attribute) }} style={{ cursor: "pointer" }}>{attribute.name}</pre> */}
   //             <a onClick={() => this.props.onSelectTable(idx)}>{table.name}</a>
   //          </td>
   //          <td>
   //             {table.attributes.length}
   //          </td>
   //          <td>
   //             {table.files.length}
   //          </td>
   //          <td>
   //             {certainty.toFixed(2)}
   //          </td>
   //       </tr>
   //    );
   // }
}
