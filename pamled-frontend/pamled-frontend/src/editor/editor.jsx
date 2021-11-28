import Rete from "rete";
import ReactRenderPlugin from "rete-react-render-plugin";
import ConnectionPlugin from "rete-connection-plugin";
import ContextMenuPlugin from "rete-context-menu-plugin";
import DockPlugin from "rete-dock-plugin";
import AreaPlugin from "rete-area-plugin";

import { MyNode } from "./components/Node";
import { loadComponentsFromAPI, PAMLComponent } from "./components/Primitive";
import { ModuleComponent, InputComponent, OutputComponent, OutputFloatComponent } from "./components/Control";
import Menu from "./Menu";

import React from "react";
import { Component } from "react";
import { Row, Col, Modal, Button, Container } from "react-bootstrap";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import axios from "../API";


export default class Editor extends Component {
  constructor(props) {
    super(props);
    this.palleteRef = React.createRef();
    this.workspaceRef = React.createRef();
    this.menuRef = React.createRef();
    
    this.editor = {};
    this.state = {
      showModal: false,
      currentProtocol: null,
      protocols: {},
    }
  }

  componentDidMount() {
    //var editor = new Rete.NodeEditor("demo@0.1.0", document.querySelector('.editor'));
    this.editor = new Rete.NodeEditor("demo@0.1.0", this.workspaceRef.current);
    this.editor.use(ConnectionPlugin);
    this.editor.use(DockPlugin, {
      container: this.palleteRef.current,
      itemClass: 'item', // default: dock-item 
      plugins: [ReactRenderPlugin], // render plugins
    });
    this.editor.use(ReactRenderPlugin
      , {
      component: MyNode
    }
    );
    this.editor.use(ContextMenuPlugin);

    this.engine = new Rete.Engine("demo@0.1.0");

   
    this.editor.on(
      "process nodecreated noderemoved connectioncreated connectionremoved",
      async () => {
        console.log("process");
        await this.engine.abort();
        await this.engine.process(this.editor.toJSON());
      }
    );

    
    this.editor.view.resize();
    AreaPlugin.zoomAt(this.editor);
    this.editor.trigger("process");
    this.initializeComponents();
    this.setProtocol(null);  // Initialize the empty protocol
  }

  async initializeComponents() 
  {
    let components = await loadComponentsFromAPI(); //[new AddComponent()];
    components = components.map((primitive) => {
      let c = new Rete.Component(primitive.name);
      c.builder = function(node) {
        return node;
      }
      return c;
    });
    components = components.concat([ 
      new InputComponent(),
      new ModuleComponent(),
      new OutputComponent(),
      new OutputFloatComponent(),
    ]) ;
    components.map(c => {
      this.editor.register(c);
      this.engine.register(c);
      return c;
    });
  }

  initialGraph () {
    return { id: "demo@0.1.0", nodes: {} };
  }

  setProtocol(protocol){
    if (!protocol) {
      protocol = "New Protocol " + Object.keys(this.state.protocols).length;
      this.state.protocols[protocol] = { name: protocol, 
                                         graph: this.initialGraph(), 
                                         rdf_file: null
                                        }
    }
    if(this.state.currentProtocol) {
      this.state.protocols[this.state.currentProtocol].graph = this.editor.toJSON();
    }
    this.state.currentProtocol = protocol;
    this.editor.fromJSON(this.state.protocols[protocol].graph);
    this.setState({currentProtocol: protocol});
  }

  async saveProtocol(){
    this.setState({showModal: true})

    axios
        .post("/protocol/", Object.values(this.state.protocols))
        .then(function (response) { 
          return response.data;
        })
        .catch(function (error) {
          // handle error
          console.log(error);
          return [];
        });
  }

  getProtocols(){
    return Object.keys(this.state.protocols);
  }

  render() {
    var protocolTabs = this.getProtocols().map((p) => {
      return (<Tab eventKey={p} title={p}> </Tab>);
    });

    return (
      <Container fluid>
      <Menu 
        ref={this.menuRef}
        handleSave={this.saveProtocol.bind(this)}
        protocolName={this.state.currentProtocol}
        getProtocols={this.getProtocols.bind(this)}
        setProtocol={this.setProtocol.bind(this)}
        />
      <Row lg={12}>
        <Col lg={4} className="editor-pallete">
          <div ref={this.palleteRef}/>
        </Col> 
        <Col lg={8}>
          <Row>
            <Tabs defaultActiveKey={this.state.currentProtocol} 
                onSelect={(k) => {this.setProtocol(k)}}
                className="mb-3">
            {protocolTabs}
            </Tabs>
          </Row>
          <Row>
          <div className="editor-workspace" ref={this.workspaceRef} data-toggle="tab"/>
          </Row>
          <Modal show={this.state.showModal} onHide={() => this.setState({showModal: false})}>
            <Modal.Header closeButton>
              <Modal.Title>Saved Protocol</Modal.Title>
            </Modal.Header>
            <Modal.Body>Saved!</Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={() => this.setState({showModal: false})}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
      </Container>
    );
  }
}
