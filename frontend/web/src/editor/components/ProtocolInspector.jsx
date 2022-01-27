import React, { Component } from 'react';
import { Tab, Tabs, Nav, Row, Col, Modal, Button, NavDropdown, Container } from 'react-bootstrap';



export function ProtocolInspectorGroup(props) {
  let emptyProtocol = "+";
  let tabs = Object.entries(props.protocols).map(
                ([pname, protocol], i)  =>  (
                  <NavDropdown title={pname} key={i} id="nav-dropdown">
                    <NavDropdown.Item key={pname+"open"} eventKey={pname}>Open</NavDropdown.Item>
                    <NavDropdown.Item key={pname+"rename"} eventKey={pname}>Rename</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item eventKey={pname+"del"}>Delete</NavDropdown.Item>
                  </NavDropdown>
                  // <Nav.Item>
                  //   <Nav.Link eventKey={pname}>{pname}</Nav.Link>
                  // </Nav.Item>
                ))
  let emptyTab = (

    <Nav.Item>

      <Nav.Link eventKey={emptyProtocol}>{emptyProtocol}</Nav.Link>
    </Nav.Item>
  )



  let panes = Object.entries(props.protocols).map(
    ([pname, protocol])  =>  (
      <Tab.Pane eventKey={pname}>
          <ProtocolInspector key={pname} protocol={protocol} />
      </Tab.Pane>
    ))


  let tabcontainer = (
    <Tab.Container id="protocol-inspector-group"
                   activeKey={props.currentProtocol}>
      {/* <Col> */}
        <Row  xs={1} sm={1}>
          <Nav variant="pills" className="flex-row"
               onSelect={(k) => {
                if (k == emptyProtocol) {
                  props.editor.setProtocol(null);
                } else {
                 props.editor.setProtocol(k)
                }}}>
            {tabs}
            {emptyTab}
          </Nav>
        </Row>
        <Row className='editor-workspace-inspector-row'>
          <Col  xs={8} sm={8} className="editor-workspace-column">
          {/* <h1>HI</h1> */}
            {props.workspaceComponent()}
          </Col>
          <Col xs={3} sm={3} className='editor-inspector-column'>
            <Row>
          <Tab.Content>
            {Object.entries(props.protocols).map(
              ([pname, protocol], i)  =>  (
                <Tab.Pane key={i} eventKey={pname}>
                    <ProtocolInspector key={pname} protocol={protocol} />
                </Tab.Pane>
              ))}
            <Tab.Pane eventKey={emptyProtocol}>
              <ProtocolInspector key={emptyProtocol}
                         protocol={{emptyProtocol: {"graph" : {}}}}
                         />
            </Tab.Pane>
          </Tab.Content>
          </Row>
          </Col>
        </Row>

      {/* </Col> */}

    </Tab.Container>
  )
  return tabcontainer
};

function ProtocolInspector(props) {
  return (
    <div>
      <pre>
        {JSON.stringify(props.protocol.graph, null, 2)}
      </pre>
    </div>
  );

};