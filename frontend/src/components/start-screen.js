import React  from 'react';
import * as Backend from '../backend.js';
import * as util from "../other/util.js";
import DropdownMenu from './dropdown_menu.js';

class StartScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      uri: "",
      s3_access_key_id: "",
      s3_secret_access_key: "",
    };
  }

  onStart() {
    Backend.create_session(this.state.uri, this.state.s3_access_key_id, this.state.s3_secret_access_key, (res) => {
      if (res.session_id == null) {
        alert("Unable to create session.");
        return;
      }
      this.props.navigate('/dashboard/' + res.session_id);
    });
  }

  handleSelectPath = (path) => {
    console.log("Selected path:", path);
    this.setState({ uri: path });
  };

  render() {
    return (
      <div style={{ textAlign: "center" }} className="grid-x grid-padding-x">
        <div className="large-3 medium-3 cell" style={{ marginTop: "16px", marginBottom: "-16px" }} />
        <div className="large-6 medium-6 cell" style={{ marginTop: "16px", marginBottom: "-16px" }}>
          <img src="icon.png" style={{ width: "14%", height: "auto" }} />
          <h1>Data Loom</h1>
          <DropdownMenu onSelect={this.handleSelectPath} />
          {/* {this.drawInput("Path", "uri")} }
          <div style={{ height: 8 }} /> */}
          {this.drawInput("Access Key Id", "s3_access_key_id")}
          <div style={{ height: 8 }} />
          {this.drawInput("Secret Access Key", "s3_secret_access_key")}
          <div style={{ height: 12 }} />
          <div className="button" onClick={() => this.onStart()}>Start</div>
        </div >
      </div >
    );
  }

  drawInput(name, id) {
    return (
      <div>
        <input type="text"
          placeholder={name}
          value={this.state[id]}
          onChange={(event) => { let state = {}; state[id] = event.target.value; this.setState(state); }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              this.onStart();
            }
            return false;
          }} />
      </div>
    )
  }
}

export default util.withParamsAndNavigation(StartScreen);