import React from "react";
import Editor from "./editor/editor";

// import { Palette } from "./editor/palette";

import "./App.css";

export  default function App() {
  //const reteEditor = new Editor();
  //const menu = new Menu(reteEditor);
  //const editorRef = React.createRef();

  return (
    <div className="App">
      <Editor />        
    </div>
  );
}
