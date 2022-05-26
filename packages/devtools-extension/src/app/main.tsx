import 'zone.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';

if (chrome.devtools.panels.themeName === 'dark') {
  document.body.classList.add('theme-dark');
}

ReactDOM.render(<App />, document.getElementById('root'));
