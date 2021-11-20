import React from "react";
import ReactDOM from "react-dom";
import init from "./editor/editor";

import "./App.css";

export default function App() {
  return (
    <div className="App">
      <h1>PAML Editor</h1>
      <div class="editor">
        <div class="container">
          <div ref={el => el && init(el)} />
        </div>
        <div class="dock"></div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
