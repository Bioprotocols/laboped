import React, { Component } from 'react';
import { Tab, Tabs, Nav, Row, Col } from 'react-bootstrap';



export function ProtocolInspectorGroup(props) {
    let tabs = Object.entries(props.protocols).map(
                  ([pname, protocol])  =>  (
                    <Nav.Item>
                      <Nav.Link eventKey={pname}>{pname}</Nav.Link>
                    </Nav.Item>
                  ))

    let panes = Object.entries(props.protocols).map(
      ([pname, protocol])  =>  (
        <Tab.Pane eventKey={pname}>
          <ProtocolInspector key={pname} protocol={protocol}></ProtocolInspector>
        </Tab.Pane>
      ))

  let tabcontainer = (
    <Tab.Container id="protocol-inspector-group"
                   activeKey={props.currentProtocol}>
      <Col>
        <Row>
          <Nav variant="pills" className="flex-column"
               onSelect={(k) => { props.editor.setProtocol(k) }}>
            {tabs}
          </Nav>
        </Row>
        <Row>
          <Tab.Content>
            {panes}
          </Tab.Content>
        </Row>
      </Col>

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