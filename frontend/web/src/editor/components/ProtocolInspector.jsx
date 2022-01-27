import React, { Component } from 'react';
import { Tab, Nav, Row, Col, Dropdown, SplitButton } from 'react-bootstrap';

function DebugID(protocol) {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (<Dropdown.Header href="#">Debug ID: {protocol.id}</Dropdown.Header>)
  }
  return null
}

export function ProtocolInspectorGroup(props) {
  let emptyProtocol = "+";
  let tabs = Object.entries(props.protocols).map(
                ([pname, protocol], i)  =>  (
                  <SplitButton size="sm" variant="outline-primary" title={pname} key={i} id="nav-dropdown" onClick={() => props.editor.openProtocol(protocol)}>
                    {DebugID(protocol)}
                    <Dropdown.Item key={pname+"save"} onClick={() => props.editor.saveProtocol(protocol)}>Save</Dropdown.Item>
                    <Dropdown.Item key={pname+"rename"} onClick={() => props.editor.renameProtocol(protocol)}>Rename</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item key={pname+"del"} onClick={() => props.editor.deleteProtocol(protocol)}>Delete</Dropdown.Item>
                  </SplitButton>
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