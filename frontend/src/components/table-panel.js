import React from 'react';

export default class TablePanel extends React.Component {
   render() {
      const table = this.props.selectedTable
      if (table == null) {
         return (
            <div style={{ backgroundColor: "green", width: 300, height: 300 }}>
               <h1>no table selectd</h1>
            </div>
         );
      }

      return (
         <div style={{ backgroundColor: "green", width: 300, height: 300 }}>
            <h1>{table.name}</h1>

            <h2>Attributes</h2>
            <ul>
               {table.attributes.map((attribute, index) => {
                  return <li key={index}>{attribute}</li>;
               })}
            </ul>

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

