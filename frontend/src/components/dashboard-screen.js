import React from 'react';
import TablePanel from './table-panel.js';
import GraphPanel from './graph-panel.js';
import OverviewPanel from './overview-panel.js';
import DatabasePanel from './database-panel.js';
import FilePreviewPanel from './file-preview-panel.js';
import ProfilingPanel from './profiling_panel.js';
import * as Backend from '../backend.js';
import * as util from "../other/util.js";
import LlmPanel from './llm-panel.js';

class Dashboard extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         selected_table_idx: null,
         session: null,
         error: null,
         llm_input: "Please mark all columns as nullable",
         database: "postgresql",
         query: "SELECT relname, pg_size_pretty(pg_total_relation_size(schemaname || '.' || relname)) AS size\nFROM pg_catalog.pg_statio_user_tables\nORDER BY pg_total_relation_size(schemaname || '.' || relname) DESC;",
         query_result: null,
         query_ms: null,
         llm_suggestion: null,
      };

      const session_id = props.params.session_id;
      Backend.get_session(session_id, res => {
         if (res.error) {
            this.setState({
               error: res.error,
            });
            return;
         }

         this.setState({
            error: null,
            layout: "overview",
            selected_table_idx: 0,
            session: JSON.parse(res.session),
         });

         this.tablePanelRef = React.createRef();
      });
   }

   render() {
      const error = this.state.error
      if (error) {
         return (
            <div>
               <p>Server error: {error}</p>
            </div>
         );
      }

      const session = this.state.session
      if (session === null) {
         return <div>Loading...</div>;
      }

      let main_panel = null
      const layout = this.state.layout
      if (layout === "overview") {
         main_panel = (<OverviewPanel
            session={session}
            onSelectTable={(table_idx) => this.setState({ selected_table_idx: table_idx })}
            onUpdateSession={(session) => this.onUpdateSession(session)}
            selected_table_idx={this.state.selected_table_idx}
         />);
      }
      if (layout === "graph") {
         main_panel = (<GraphPanel
            session={session}
            onSelectTable={(table_idx) => this.setState({ selected_table_idx: table_idx })}
         />);
      }
      if (layout === "database") {
         main_panel = (<DatabasePanel
            session={session}
            query={this.state.query}
            query_result={this.state.query_result}
            query_ms={this.state.query_ms}
            llm_suggestion={this.state.llm_suggestion}
            onUpdateQuery={(query) => this.setState({ query: query })}
            onExecuteQuery={() => this.onExecuteQuery()}
         />);
      }
      if (layout === "file-preview") {
         main_panel = (<FilePreviewPanel
            session={session}
            file_path={this.state.file_path}
            file_preview={this.state.file_preview}
         />);
      }
      if (layout === "profiling") {
         main_panel = (<ProfilingPanel
             session={session}
             selected_table_idx={this.state.selected_table_idx}
             onUpdateSession={(updatedSession) => this.setState({ session: updatedSession })}
             applyUcChanges={() => this.tablePanelRef.current.applyUcChanges()}
         />
      );
     }
     

      const database = this.state.database

      return (
         <div className="grid-x grid-padding-x">
            <div className="large-6 medium-6 cell" style={{ marginTop: "16px", marginBottom: "-16px" }}>
               <div className={"button " + (layout != "overview" ? "secondary" : "")} onClick={() => this.setState({ layout: "overview" })}>Table View</div>
               <span> </span>
               {/* <div className={"button " + (layout != "graph" ? "secondary" : "")} onClick={() => this.setState({ layout: "graph" })}>UML 4.0 View</div>
               <span> </span> */}
               <div className={"button " + (layout != "database" ? "secondary" : "")} onClick={() => this.setState({ layout: "database" })}>Database View</div>
               <span> </span>
               <div className={"button " + (layout != "profiling" ? "secondary" : "")} onClick={() => this.setState({ layout: "profiling" })}>Profiling View</div>
            </div>

            <div className="large-6 medium-6 cell" style={{ marginTop: "16px", marginBottom: "-16px" }}>
               <div className={"button " + (database != "postgresql" ? "secondary" : "")} onClick={() => this.setState({ database: "postgresql" })}>PostgreSQL</div>
               <span> </span>
               <div className={"button " + (database != "duckdb" ? "secondary" : "")} onClick={() => this.setState({ database: "duckdb" })}>DuckDB</div>
               {/* <span> </span>
               <div className={"button " + (database != "nanook" ? "secondary" : "")} onClick={() => this.setState({ database: "nanook" })}>Peakbase</div> */}
            </div>
            <div className="large-12 medium-12 cell">
               <div className="grid-x grid-padding-x">
                  <div className="large-8 cell">
                     <div className="callout">
                        {main_panel}
                     </div>
                  </div>
                  <div className="large-4 cell">
                     <div className="callout">
                        <TablePanel
                           ref={this.tablePanelRef}
                           session={session}
                           database={database}
                           selected_table_idx={this.state.selected_table_idx}
                           setQuey={(query) => this.setState({ query: query, layout: "database" })}
                           onUpdateSession={(session) => this.onUpdateSession(session)}
                           onPreviewFile={(file_path) => this.onPreviewFile(file_path)}
                        />
                     </div>
                     <div className="callout">
                        <LlmPanel
                           session={session}
                           selected_table_idx={this.state.selected_table_idx}
                           llm_input={this.state.llm_input}
                           onUpdateSession={(session) => this.onUpdateSession(session)}
                           setLlmInput={(llm_input) => this.setState({ llm_input: llm_input })}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )
   }

   onUpdateSession(session) {
      // console.log("Session before update:", session);
      Backend.updateSession(session.id, session.tables, session.unknown_files, (response) => {
         if (response.error || session == null || session.id == null) {
            alert("Error updating session!")
            console.log("Error: " + response.error)
            console.log("Session:", session)
            return
         }
         this.setState({ session: JSON.parse(response.session) });
      })
   }

   onExecuteQuery() {
      const query = this.state.query;
      Backend.run_query(this.state.session.id, this.state.database, query, (response) => {
          if (!response.query_result || !response.query_result.column_names) {
              //alert("Error!!! " + response.error);
              this.setState({
                  query_result: response.query_result,
                  query_ms: response.query_ms,
                  llm_suggestion: response.llm_suggestion || null,
              });
              return;
          }
          this.setState({
              query_result: response.query_result,
              query_ms: response.query_ms,
              llm_suggestion: null,
          });
      });
  }

   onPreviewFile(file_path) {
      Backend.get_file_preview(this.state.session.id, file_path, (response) => {
         if (response.error != null) {
            alert("Error!!!" + response.error);
         }
         this.setState({
            layout: "file-preview",
            file_path: file_path,
            file_preview: response.file_preview,
         })
      })
   }
}

export default util.withParams(Dashboard);