import React from 'react';
import CodeMirror, { lineNumbers } from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import * as Backend from '../backend.js';

export default class TableOverview extends React.Component {
   constructor(props) {
      super(props);
   }

   refreshCaches() {
      const tables = this.props.session.tables
      this.min_certainty = tables.reduce((min, table) => Math.min(min, table.certainty), 1)
      this.max_certainty = tables.reduce((max, table) => Math.max(max, table.certainty), 0)
      this.certainty_range = this.max_certainty - this.min_certainty
   }

   onUpdateQuery(e) {
      this.props.onUpdateQuery(e)
   }

   // extractQuery(llmSuggestion) {
   //    // Extract all SQL statements
   //    // TODO: further tests
   //    const regex = /```[^]*?```/gm;
   //    const matches = llmSuggestion.match(regex);
   //    if (matches) {
   //       return matches.join('\n');
   //    }
   //    console.log(llmSuggestion);
   //    return llmSuggestion;
   // }

   render() {
      this.refreshCaches()
      const tables = this.props.session.tables

      return (
         <div className="small-12 cell">
            {this.renderEditor()}
            {this.renderTable()}
         </div >
      );
   }

   renderEditor() {
      return (
         <div className="grid-x grid-padding-x grid-padding-y">
            <div className="small-12 cell">
               <h4>Query</h4>
               <CodeMirror
                  value={this.props.query}
                  height="150px"
                  dialect="postgres"
                  basicSetup={{
                     foldGutter: false,
                     searchKeymap: false,
                  }}
                  extensions={[sql({})]}
                  onChange={(e) => { this.onUpdateQuery(e) }}
                  style={{ border: "1px solid #aaaaaa" }}
               />
               <br />
               <button
                  className={"button success"}
                  onClick={() => this.props.onExecuteQuery()}
               >Execute</button>
            </div>
         </div>
      );
   }

   renderTable() {
      const query_result = this.props.query_result;
      const query_ms = this.props.query_ms;
      const llm_suggestion = this.props.llm_suggestion;

      if (query_result == null) {
         return null;
      }

      // For nanook, the result is a string
    if (query_result.column_names === undefined) {
      return (
          <div>
              <h4>Result</h4>
              <span>Runtime: {query_ms.toFixed(1)}ms</span>
              <pre>{query_result}</pre>
              {llm_suggestion && (
                  <div>
                      <h4>LLM Suggestion</h4>
                      <pre style={{ border: '1px dashed #000', padding: '20px', borderRadius: '5px' }}>{llm_suggestion}</pre>
                  </div>
              )}
              {/* {this.props.llm_suggestion && (
                  <button
                     className={"button info"}
                     onClick={() => this.onUpdateQuery(this.extractQuery(this.props.llm_suggestion))}
                     style={{ marginLeft: '10px' }}
                  >
                     Use LLM Suggestion
                  </button>
               )} */}
          </div>
      );
  }

      const column_names = query_result.column_names
      const rows = query_result.rows

      return (
         <div>
            <h4>Result</h4>
            <span>Runtime: {query_ms.toFixed(1)}ms</span>
            <div>
               <table className="table-scroll" style={{ fontSize: "10pt" }}>
                  <thead>
                     <tr>
                        {column_names.map((name, idx) => <th key={idx}>{name}</th> )}
                     </tr>
                  </thead>
                  <tbody>
                     {rows.map((row, idx) => { return this.renderRow(row, idx) })}
                  </tbody>
               </table>
            </div>
            {llm_suggestion && (
                <div>
                    <h4>LLM Suggestion</h4>
                    <pre>{llm_suggestion}</pre>
                </div>
            )}
         </div>
      );
   }

   renderRow(row, idx) {
      return (
         <tr key={idx} style={{ textAlign: "left" }}>
            {row.map((cell, idx) => { return <td key={idx} style={{ padding: "5px", margin: "5px" }}>{cell}</td> })}
         </tr>
      )
   }
}
