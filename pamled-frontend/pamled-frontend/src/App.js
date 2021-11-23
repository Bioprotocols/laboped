import React from "react";
import ReactDOM from "react-dom";
import init from "./editor/editor";
import { Menu } from "./editor/menu";
import { Pallete } from "./editor/pallete";
import { Container, Row, Col } from "react-bootstrap";

import "./App.css";

export default function App() {
  return (
    <div className="App">
      <Container>
        <Row>
          <h1>PAML Editor</h1>
        </Row>
        <Row>
          <Menu />
        </Row>
        <Row>
          <Col xs={1}> 
            <Pallete />
          </Col>
          <Col>
          <div className="editor">
            <div className="container">
              <div ref={el => el && init(el)} />
            </div>
          </div>
          </Col>
        </Row>
        <Row>
          <div className="dock" data-toggle="tab"></div>
        </Row>
      </Container>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
