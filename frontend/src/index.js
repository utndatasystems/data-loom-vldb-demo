import './css/foundation.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StartScreen from './components/start-screen.js';
import Dashboard from './components/dashboard.js';
import Debug from './components/debug.js';
import * as Backend from './backend.js';

class TopLevelComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };

    // This is to handle async errors, from callbacks (server replies)
    Backend.changeDisplayedPage.callback = (error) => {
      this.setState({ error: true, error_reason: error });
    };
  }

  componentDidCatch(error, errorInfo) {
    console.log("componentDidCatch: " + error)
    console.log("componentDidCatch: " + errorInfo)
  }

  render() {
    if (this.state.error) {
      let error = this.state.error_reason;
      return (<p {...this.props} error={error} />)
    }

    return (
      <Routes>
        <Route path="/dashboard/:session_id" exact element={<Dashboard />} />
        <Route path="/debug/:session_id" exact element={<Debug />} />
        <Route path="/*" element={<StartScreen />} />
      </Routes>
    );
  }
}

async function main() {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <TopLevelComponent />
    </BrowserRouter>);
}

main();

