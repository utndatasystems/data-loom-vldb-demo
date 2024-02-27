import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import StartScreen from './components/start-screen.js';

async function main() {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <StartScreen />
    </BrowserRouter>);
}

main();

