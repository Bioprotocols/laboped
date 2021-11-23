import React from "react";
import ReactDOM from "react-dom";
import init from "./editor/editor";
import { Menu } from "./editor/menu";
import { Palette } from "./editor/palette";
import { Container, Row, Col } from "react-bootstrap";

import "./App.css";

export default function App() {
  return (
    <div className="App">
      <Container>
        <Row>
          <Col>
          <h1>PAML Editor</h1>
          </Col>
        </Row>
        {/* <Row>
          <Menu />
        </Row> */}
        <Row lg={2} className="main">
          <Col md={2}> 
            <div className="dock" data-toggle="tab"></div>
          </Col>
          <Col>
          <div className="editor">
            <div className="container">
              <div ref={el => el && init(el)} />
            </div>
          </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
