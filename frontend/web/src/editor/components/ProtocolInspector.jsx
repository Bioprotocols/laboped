import React, { Component } from 'react';
import { Tab, Nav, Row, Col, Dropdown, SplitButton, Button } from 'react-bootstrap';

function DebugID(protocol) {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (<Dropdown.Header href="#">Protocol ID: {protocol.id}</Dropdown.Header>)
  }
  return null
}

export function ProtocolInspectorGroup(props) {
  let emptyProtocol = "+";
  let tabs = Object.entries(props.protocols).map(
                ([pname, protocol], i)  =>  {
                  let className = null
                  if (props.editor.state.currentProtocol === protocol.name) {
                    className = "current-protocol"
                  }
                  return (
                    <SplitButton className={className} size="sm" variant="outline-primary" title={pname} key={i} onClick={() => props.editor.openProtocol(protocol)}>
                      {DebugID(protocol)}
                      <Dropdown.Item key={pname+"save"} onClick={() => props.editor.saveProtocol(protocol)}>Save</Dropdown.Item>
                      <Dropdown.Item key={pname+"rename"} onClick={() => props.editor.renameProtocol(protocol)}>Rename</Dropdown.Item>
                      <Dropdown.Item key={pname+"graph_download"} onClick={() => props.editor.downloadCurrentGraph(pname)}>Download Current Rete Graph</Dropdown.Item>
                      <Dropdown.Item href="#" key={pname+"protocol_download"} onClick={() => props.editor.downloadCurrentProtocol(pname)}>Download Current Protocol</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item key={pname+"del"} onClick={() => props.editor.deleteProtocol(protocol)}>Delete</Dropdown.Item>
                    </SplitButton>
                    // <Nav.Item>
                    //   <Nav.Link eventKey={pname}>{pname}</Nav.Link>
                    // </Nav.Item>
                  )
              })
  let emptyTab = (
    <Nav.Item>
      <Button size="sm" variant="outline-primary" onClick={() => props.editor.displayNewProtocol()}>{emptyProtocol}</Button>
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
          <Nav id="editor-protocol-tabs" variant="pills" className="flex-row"
               onSelect={(k) => {
                if (k == emptyProtocol) {
                  props.editor.displayNewProtocol();
                } else {
                 props.editor.displayProtocol(k)
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