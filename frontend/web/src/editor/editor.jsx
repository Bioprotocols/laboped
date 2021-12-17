import Rete from "rete";
import ReactRenderPlugin from "rete-react-render-plugin";
import ConnectionPlugin from "rete-connection-plugin";
import ContextMenuPlugin from "rete-context-menu-plugin";
import DockPlugin from "rete-dock-plugin";
import AreaPlugin from "rete-area-plugin";

import { MyNode } from "./components/Node";
import { loadComponentsFromAPI, PAMLComponent } from "./components/Primitive";
import { ModuleComponent, InputComponent, OutputComponent, OutputFloatComponent } from "./components/Control";
import Menu from "./menu";

import React from "react";
import { Component } from "react";
import { Row, Col, Modal, Button, Container, Navbar } from "react-bootstrap";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { axios, axios_csrf_options, endpoint } from "../API";
import "./editor.css"


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
      primitiveComponents: {},
      portTypes: {}
    }

    this.processHandler = this.processHandler.bind(this);
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

    this.editor.on("process nodecreated noderemoved connectioncreated connectionremoved", this.processHandler);


    this.editor.view.resize();

    const background = document.createElement('div');
    background.classList = 'editor-workspace-background';
    this.editor.use(AreaPlugin, { background });

    AreaPlugin.zoomAt(this.editor);
    this.editor.trigger("process");
    this.initializeComponents();
    this.retreiveProtocols();
    //this.setProtocol(null);  // Initialize the empty protocol
  }

  componentWillUnmount() {
    this.editor.destroy();
  }

  async processHandler() {
    console.log("process");
    await this.engine.abort();
    await this.engine.process(this.editor.toJSON());
  }

  getPortTypeSocket(portType){
    // Return one socket unique to each type
    let portTypes = this.state.portTypes;
    if (Object.keys(portTypes).indexOf(portType) < 0) {
      portTypes[portType] = new Rete.Socket(portType);
      this.setState({portTypes: portTypes});
    }
    return portTypes[portType];
  }

  async initializeComponents() {
    let components = await loadComponentsFromAPI(); //[new AddComponent()];
    components = components.map((primitive) => {
      let c = new PAMLComponent(this.getPortTypeSocket.bind(this), primitive);
      // c.builder = function(node) {
      //   return node;
      // }
      return c;
    });
    components = components.concat([
      new InputComponent(),
      new ModuleComponent(),
      new OutputComponent(),
      new OutputFloatComponent(),
    ]);

    components.map(c => this.addComponent(c));
  }

  addComponent(component) {
    if (Object.keys(this.state.primitiveComponents).indexOf(component.name) < 0) {
      var components = this.state.primitiveComponents;
      components[component.name] = component;
      this.editor.register(component);
      this.engine.register(component);
      this.setState({ components: components });
    }
  }

  initialGraph() {
    return { id: "demo@0.1.0", nodes: {} };
  }

  setProtocol(protocol) {

    // Create a new protocol if none specified
    if (!protocol) {
      protocol = "New Protocol " + Object.keys(this.state.protocols).length;
      let protocols = this.state.protocols;
      protocols[protocol] = { name: protocol,
                              graph: this.initialGraph(),
                              rdf_file: null
                            };
      this.setState({protocols: protocols});
    }

    this.saveProtocolGraphInState();

    // Update the current protocol, load graph, and update state.

    this.editor.fromJSON(this.state.protocols[protocol].graph);
    this.setState({ currentProtocol: protocol });
  }

  saveProtocolGraphInState(){
    // If there is a current protocol, then save its graph as JSON.
    if(this.state.currentProtocol) {
      let protocols = this.state.protocols
      protocols[this.state.currentProtocol].graph = this.editor.toJSON();
      this.setState({protocols: protocols})
    }

  }

  async saveProtocol() {
    // Retreive the current protocol from the Rete editor
    this.saveProtocolGraphInState();

    this.setState({ showModal: true })
    axios
      .post(`${endpoint.editor.protocol}/`, Object.values(this.state.protocols), axios_csrf_options)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        return [];
      });
  }

  async retreiveProtocols() {
    var protocols = await axios.get(`${endpoint.editor.protocol}/`, axios_csrf_options)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        return [];
      });
    console.log(typeof protocols);
    protocols.map((p) => {
      //p.graph = JSON.parse(p.graph); // read json serialized as string
      this.updateProtocol(p);
    });
  }

  async rebuildPrimitives() {
    await axios.get(`${endpoint.editor.rebuild}/`)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        return [];
      });
    this.initializeComponents()
  }

  updateProtocol(protocol) {
    var currentProtocols = this.state.protocols;
    currentProtocols[protocol.name] = protocol;
    this.setState({ protocols: currentProtocols });
  }


  getProtocols() {
    return Object.keys(this.state.protocols);
  }

  render() {
    var protocolTabs = this.getProtocols().map((p) => {
      var nodes = this.state.protocols[p].graph.nodes;
      var nodeTabs = Object.keys(nodes).map((n) => {
        var content = JSON.stringify(this.state.protocols[p].graph.nodes[n], null, 2);
        return (<Tab eventKey={n} title={n}>
                  <div><pre>{content}</pre></div>
                </Tab>);
      });
      return (
        <Tab eventKey={p} title={p}>
          <Tabs className="mb-3">
                <Navbar.Brand>Steps</Navbar.Brand>
                {nodeTabs}
          </Tabs>
          <div><pre>{JSON.stringify(this.state.protocols[p].graph, null, 2)}</pre></div>
        </Tab>);
    });

    return (
      <Container className="editor-container" fluid={true}>
        <Menu
          ref={this.menuRef}
          editor={this}
        // handleSave={this.saveProtocol.bind(this)}
        // protocolName={this.state.currentProtocol}
        // getProtocols={this.getProtocols.bind(this)}
        // setProtocol={this.setProtocol.bind(this)}
        />
        <Row className="editor" xs={12} sm={12}>
          <Col xs={2} sm={2} className="editor-pallete-column">
            <div className="editor-pallete" ref={this.palleteRef} />
          </Col>
          <Col xs={8} sm={8} className="editor-workspace-column">
            <div className="editor-workspace" ref={this.workspaceRef} data-toggle="tab" />
            <Modal show={this.state.showModal} onHide={() => this.setState({ showModal: false })}>
              <Modal.Header closeButton>
                <Modal.Title>Saved Protocol</Modal.Title>
              </Modal.Header>
              <Modal.Body>Saved!</Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={() => this.setState({ showModal: false })}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </Col>
          <Col xs={2} sm={2} className="editor-inspector-column">
            <Row>
              <Tabs defaultActiveKey={this.state.currentProtocol}
                onSelect={(k) => { this.setProtocol(k) }}
                className="mb-3">
                {protocolTabs}
              </Tabs>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}


