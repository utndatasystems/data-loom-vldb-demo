import React from 'react';

export default class TablePanel extends React.Component {
   render() {
      const table = this.props.selectedTable
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
                        <tr key={index}>
                           <td>{attribute.name}</td>
                           <td>{attribute.type}</td>
                           <td>{attribute.null ? "nullable" : "not null"}</td>
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
         </div>
      );
   }
}
