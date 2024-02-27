import './../index.css';
import React from 'react';
import { Link } from "react-router-dom";

export default class StartScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      s3_uri: "",
      s3_secret: "",
      s3_access_key: "",
    };
  }

  onStart() {
    alert("Found TPC-H on:\ns3: " + this.state.s3_uri);
  }

  render() {
    return (
      <div>
        <h1>Data Loom</h1>
        {this.drawInput("S3 URI", "s3_uri")}
        <div style={{ height: 8 }} />
        {this.drawInput("Secret", "s3_secret")}
        <div style={{ height: 8 }} />
        {this.drawInput("Access Key", "s3_access_key")}
        <div style={{ height: 12 }} />
        <div className="cool-button" onClick={() => this.onStart()}>Start</div>
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