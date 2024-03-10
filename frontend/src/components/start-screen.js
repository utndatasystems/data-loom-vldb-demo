import './../index.css';
import React from 'react';
import * as Backend from '../backend.js';
import * as util from "../other/util.js";

class StartScreen extends React.Component {
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
    // Backend.inferSchema(this.state.s3_uri, this.state.s3_secret, this.state.s3_access_key, (res) => {
    // alert(JSON.stringify(res, null, 2));
    this.props.navigate('/dashboard/');
    // });
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

export default util.withParamsAndNavigation(StartScreen);