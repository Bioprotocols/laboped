import React from 'react';
import { Tabs, Tab, Nav, Row, Col, Dropdown, SplitButton } from 'react-bootstrap';
import Markdown from 'marked-react';
import DOMPurify from 'dompurify';
// import { JSONEditor } from 'vanilla-jsoneditor';
// import { useEffect, useRef } from "react";
import ReactJson from 'react-json-view'



export class ProtocolInspectorGroup extends React.Component {

  constructor(props) {
    super(props);
    this.fileInput = React.createRef();

    this.debugID = this.debugID.bind(this);
    this.loadProtocolFromFile = this.loadProtocolFromFile.bind(this);
  }

  debugID(protocol) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return (<Dropdown.Header href="#">Protocol ID: {protocol.id}</Dropdown.Header>)
    }
    return null
  }

  loadProtocolFromFile(evt) {
    let file = evt.target.files[0];
    console.log("Loading protocol from file...")

    let reader = new FileReader();
    reader.onload = readerEvent => {
      try {
        let name = file.name.replace(/\.[^/.]+$/, "");
        let graph = JSON.parse(readerEvent.target.result);
        this.props.editor.displayNewProtocol(name, graph)
      } catch (error) {
        console.error(error)
      }
    }
    reader.readAsText(file, 'UTF-8');
  }

  render() {
    let emptyProtocol = "+";
    let specializations = this.props.editor.state.specializations;
    let tabs = Object.entries(this.props.protocols).map(
      ([pname, protocol], i) => {
        let className = null
        if (this.props.editor.state.currentProtocol === protocol.name) {
          className = "current-protocol"
        }
        return (
          <SplitButton className={className} size="sm" variant="outline-primary" title={pname} key={i} onClick={() => this.props.editor.openProtocol(pname)}>
            {this.debugID(protocol)}
            <Dropdown.Item key={pname + "save"} onClick={() => this.props.editor.saveProtocol(pname)}>Save</Dropdown.Item>
            <Dropdown.Item key={pname + "rename"} onClick={() => this.props.editor.renameProtocol(pname)}>Rename</Dropdown.Item>
            <Dropdown.Item key={pname + "graph_download"} onClick={() => this.props.editor.downloadGraph(pname)}>Download Rete Graph</Dropdown.Item>
            <Dropdown.Item key={pname + "protocol_download"} onClick={() => this.props.editor.handleProtocolDownload(pname)}>Download Protocol</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item key={pname + "del"} onClick={() => this.props.editor.deleteProtocol(pname)}>Delete</Dropdown.Item>
          </SplitButton>
          // <Nav.Item>
          //   <Nav.Link eventKey={pname}>{pname}</Nav.Link>
          // </Nav.Item>
        )
      })
    let emptyTab = (
      <Nav.Item>
        <SplitButton size="sm" variant="outline-primary" title={emptyProtocol} onClick={() => this.props.editor.displayNewProtocol()}>
          <Dropdown.Item key={"load-rete-graph-file"} onClick={() => this.fileInput.current.click()}>Import from Rete Graph</Dropdown.Item>
        </SplitButton>
      </Nav.Item>
    )

    let emptyDetailNav = (
      <Nav.Item>
        <Nav.Link key={0} eventKey={0}>{"Detail"}</Nav.Link>
      </Nav.Item>
    )
    let emptyDetail = (
      <Tab title="Detail" eventKey="detail">Protocol Detail</Tab>
    )


    let tabcontainer = (
      <Tab.Container id="protocol-inspector-group"
        activeKey={this.props.currentProtocol}>
        {/* <Col> */}
        <Row xs={1} sm={1}>
          <Nav id="editor-protocol-tabs" variant="pills" className="flex-row"
            onSelect={(k) => {
              if (k === emptyProtocol) {
                this.props.editor.displayNewProtocol();
              } else {
                this.props.editor.displayProtocol(k)
              }
            }}>
            {tabs}
            {emptyTab}
          </Nav>
        </Row>
        <Row className='editor-workspace-inspector-row'>
          <Col xs={8} sm={8} className="editor-workspace-column">
            {/* <h1>HI</h1> */}
            {this.props.workspaceComponent()}
          </Col>
          <Col xs={4} sm={4} className='editor-inspector-column'>
            <Tabs defaultActiveKey="detail" onSelect={(i) => {
              console.log("Select tab: " + i)
              if (i != "detail") {
                this.props.editor.getProtocolSpecialization(this.props.currentProtocol, parseInt(i));
              }
            }}>
              {emptyDetail}
              {Object.entries(specializations).map(
                ([_, specialization], i) => {
                  let protocol = this.props.editor.state.protocols[this.props.currentProtocol];
                  let rendered = (protocol, specialization) => {
                    if (protocol) {
                      let spec = protocol.specializations.find((s) => (s && s.id == specialization.id));
                      if (spec) {
                        let rendered = spec.data ? ((specialization.name == "DefaultBehaviorSpecialization") ? (<ReactJson src={JSON.parse(spec.data)} displayDataTypes="False" name="Steps" indentWidth="2" />) : (<ProtocolInspector specialization={spec.data} />)) : null;
                        return rendered;
                      } else {
                        return null;
                      }
                    } else {
                      return null;
                    }
                  }
                  return (<Tab title={specialization.name} eventKey={specialization.id}>
                    {rendered(protocol, specialization)}
                  </Tab>)
                })}

              {/* </Tab.Content> */}
            </Tabs>
          </Col>
        </Row>

        {/* </Col> */}
        <input type="file" ref={this.fileInput} onChange={(evt) => this.loadProtocolFromFile(evt)} style={{ display: "none" }} />
      </Tab.Container >
    )
    return tabcontainer
  };
}

function ProtocolInspector(props) {
  return (
    <div>
      <pre>
        <Markdown value={DOMPurify.sanitize(props.specialization)} />
      </pre>
    </div>
  );

};

class PrettyPrintJson extends React.Component {

  render() {
    // data could be a prop for example
    // const { data } = this.props;

    return (
      <div className='json-specialization-data'>
        <pre>
          {/* {JSON.stringify(this.props.data, null, "\t")} */}
          {/* <SvelteJSONEditor content={JSON.parse(this.props.data)} readonly="1" /> */}
          <ReactJson src={JSON.parse(this.props.data)} />
        </pre>
      </div>);
  }
}


// function SvelteJSONEditor(props) {
//   const refContainer = useRef(null);
//   const refEditor = useRef(null);

//   useEffect(() => {
//     // create editor
//     console.log("create editor", refContainer.current);
//     refEditor.current = new JSONEditor({
//       target: refContainer.current,
//       props: {}
//     });

//     return () => {
//       // destroy editor
//       if (refEditor.current) {
//         console.log("destroy editor");
//         refEditor.current.destroy();
//         refEditor.current = null;
//       }
//     };
//   }, []);

//   // update props
//   useEffect(() => {
//     if (refEditor.current) {
//       console.log("update props", props);
//       refEditor.current.updateProps(props);
//     }
//   }, [props]);

//   return <div className="svelte-jsoneditor-react" ref={refContainer}></div>;
// }
