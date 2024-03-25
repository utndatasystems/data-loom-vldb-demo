import React from 'react';
import TablePanel from './table-panel.js';
import GraphPanel from './graph-panel.js';
import OverviewPanel from './overview-panel.js';
import DatabasePanel from './database-panel.js';
import FilePreviewPanel from './file-preview-panel.js';
import * as Backend from '../backend.js';
import * as util from "../other/util.js";

class Dashboard extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         selected_table_idx: null,
         session: null,
         error: null,
         database: "postgresql",
         query: "SELECT relname, pg_size_pretty(pg_total_relation_size(schemaname || '.' || relname)) AS size\nFROM pg_catalog.pg_statio_user_tables\nORDER BY pg_total_relation_size(schemaname || '.' || relname) DESC;",
         query_result: null,
         query_ms: null,
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
            layout: "database",
            selected_table_idx: 0,
            session: JSON.parse(res.session),
         });
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
      if (layout === "table") {
         main_panel = (<OverviewPanel
            session={session}
            onSelectTable={(table_idx) => this.setState({ selected_table_idx: table_idx })}
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

      const database = this.state.database

      return (
         <div className="grid-x grid-padding-x">
            <div className="large-6 medium-6 cell" style={{ marginTop: "16px", marginBottom: "-16px" }}>
               <div className={"button " + (layout != "table" ? "secondary" : "")} onClick={() => this.setState({ layout: "table" })}>Table View</div>
               <span> </span>
               <div className={"button " + (layout != "graph" ? "secondary" : "")} onClick={() => this.setState({ layout: "graph" })}>UML 4.0 View</div>
               <span> </span>
               <div className={"button " + (layout != "database" ? "secondary" : "")} onClick={() => this.setState({ layout: "database" })}>Database View</div>
            </div>

            <div className="large-6 medium-6 cell" style={{ marginTop: "16px", marginBottom: "-16px" }}>
               <div className={"button " + (database != "postgresql" ? "secondary" : "")} onClick={() => this.setState({ database: "postgresql" })}>PostgreSQL</div>
               <span> </span>
               <div className={"button " + (database != "duckdb" ? "secondary" : "")} onClick={() => this.setState({ database: "duckdb" })}>DuckDb</div>
               <span> </span>
               <div className={"button " + (database != "nanook" ? "secondary" : "")} onClick={() => this.setState({ database: "nanook" })}>Peakbase</div>
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
                           session={session}
                           database={database}
                           selected_table_idx={this.state.selected_table_idx}
                           setQuey={(query) => this.setState({ query: query, layout: "database" })}
                           onUpdateSession={(session) => this.onUpdateSession(session)}
                           onPreviewFile={(file_path) => this.onPreviewFile(file_path)}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )
   }

   onUpdateSession(session) {
      Backend.updateSession(session.id, session.tables, (response) => {
         if (response.error || session == null || session.id == null) {
            alert("Error updating session!")
            console.log("Error: " + response.error)
            console.log(session)
            return
         }
         this.setState({ session: JSON.parse(response.session) });
      })
   }

   onExecuteQuery() {
      const query = this.state.query
      Backend.run_query(this.state.session.id, this.state.database, query, (response) => {
         if (response.error != null) {
            alert("Error!!!" + response.error);
         }
         this.setState({
            query_result: response.query_result,
            query_ms: response.query_ms,
         })
      })
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