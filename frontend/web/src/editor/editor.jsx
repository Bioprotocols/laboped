import Rete from "rete";
import ReactRenderPlugin from "rete-react-render-plugin";
import ConnectionPlugin from "rete-connection-plugin";
import ContextMenuPlugin from "rete-context-menu-plugin";
import DockPlugin from "rete-dock-plugin";
import AreaPlugin from "rete-area-plugin";

import { MyNode } from "./components/Node";
import { numSocket, loadComponentsFromAPI, PAMLComponent, PAMLProtocolComponent } from "./components/Primitive";
import { ModuleComponent, InputComponent, OutputComponent, OutputFloatComponent } from "./components/Control";
import Menu from "./menu";

import React from "react";
import { Component } from "react";
import { Row, Col, Modal, Button, Container, Tab } from "react-bootstrap";

import { axios, axios_csrf_options, endpoint } from "../API";
import "./editor.css"
import { ProtocolInspectorGroup } from "./components/ProtocolInspector";


function downloadStringAsFile(data, filename) {
  let url = window.URL.createObjectURL(new Blob([data]))
  let link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export default class Editor extends Component {
  constructor(props) {
    super(props);
    this.palleteRef = React.createRef();
    this.workspaceRef = React.createRef();
    this.menuRef = React.createRef();


    this.loginStatus = props.loginStatus;

    this.editor = {};
    this.state = {
      showModal: false,
      currentProtocol: null,
      protocols: {},
      primitiveComponents: {},
      portTypes: {},
      modules: {}
    }

    this.processHandler = this.processHandler.bind(this);
    this.setProtocol = this.setProtocol.bind(this);
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
    // console.log("process");
    await this.engine.abort();
    await this.engine.process(this.editor.toJSON());
  }

  getPortTypeSocket(portType){
    // Return one socket unique to each type
    let portTypes = this.state.portTypes;
    if (Object.keys(portTypes).indexOf(portType) < 0) {
      portTypes[portType] = numSocket; // new Rete.Socket(portType);
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
      new OutputComponent(),
      //new OutputFloatComponent(),
    ]);

    var primitiveComponents = this.state.primitiveComponents;
    components.map(c => {
      if (Object.keys(primitiveComponents).indexOf(c.name) < 0) {
        primitiveComponents[c.name] = c;
        this.editor.register(c);
        this.engine.register(c);
        }
        return c;
    });
    this.setState({ primitiveComponents: components });
  }

  initialGraph() {
    return { id: "demo@0.1.0", nodes: {} };
  }


  newProtocol(){
    let protocol = "New Protocol " + Object.keys(this.state.protocols).length;
    return {  id: null,
              name: protocol,
              graph: this.initialGraph(),
              rdf_file: null
            };
  }

  setProtocol(protocol) {
    var protocolObj = null;

    // Create a new protocol if none specified
    if (!protocol) {
      protocolObj = this.newProtocol();
      protocol = protocolObj.name;
      let protocols = this.state.protocols;
      protocols[protocol] = protocolObj;
      this.setState({protocols: protocols});
    } else {
      protocolObj = this.state.protocols[protocol]
    }

    // Update the current protocol, load graph, and update state.

    this.saveProtocolGraphInState();
    let graph = protocolObj.graph;
    // if (graph.nodes > 0){
      this.editor.fromJSON(graph);
    // }
    this.editor.trigger("process");
    this.editor.view.resize();

  }

  saveProtocolGraphInState(){
    // If there is a current protocol, then save its graph as JSON.
    if(this.state.currentProtocol) {
      let protocols = this.state.protocols;
      protocols[this.state.currentProtocol].graph = this.editor.toJSON();
      this.setState({protocols: protocols});
      this.updateProtocolComponent(this.state.currentProtocol);
    }
  }

  // TODO this should probably just save the current protocol
  async saveProtocol() {
    // Retreive the current protocol from the Rete editor
    this.saveProtocolGraphInState();

    this.setState({ showModal: true })
    await axios.post(endpoint.editor.protocol, Object.values(this.state.protocols), {
                withCredentials: true,
                xsrfCookieName: 'csrftoken',
                xsrfHeaderName: 'x-csrftoken',
                headers: {
                    "Content-Type": "application/json",
                    'x-csrftoken': this.loginStatus.state.csrf,
                }
            })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        return [];
      });
    // FIXME retreive all the protocols again since we are not saving just a specific
    // protocol and I do not want to rummage through all of the protocols to determine
    // what ID was assigned to any newly saved (previous local-only) protocols.
    // Note: Might become OBE if we just make all protocols stores remotely (no local-only)
    this.retreiveProtocols()
  }

  async retreiveProtocols() {
    var protocols = await axios.get(endpoint.editor.protocol, axios_csrf_options)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        return [];
      });

    var currentProtocols = this.state.protocols;
    protocols.map((p) => {
      //p.graph = JSON.parse(p.graph); // read json serialized as string
      currentProtocols[p.name] = p;
      return p;
    });

    if (!this.state.currentProtocol){
      this.setState({currentProtocol: Object.keys(currentProtocols)[0]})
    }

    this.setState({ protocols: currentProtocols });
    //this.setProtocol(this.state.currentProtocol)

     this.editor.fromJSON(currentProtocols[this.state.currentProtocol].graph)

    Object.keys(currentProtocols).map((name, p) => {this.updateProtocolComponent(name); return p;})
  }

  updateProtocolComponent(protocol) {

    var primitiveComponents = this.state.primitiveComponents;
    let protocolComponent = new PAMLProtocolComponent(this.getPortTypeSocket.bind(this), this.state.protocols[protocol]);
    primitiveComponents[protocolComponent.name] = protocolComponent;

    if (this.editor.components.has(protocolComponent.name)){
      this.editor.components.set(protocolComponent.name, protocolComponent);
    } else {
      this.editor.register(protocolComponent);
    }
    if (this.engine.components.has(protocolComponent.name)){
      this.engine.components.set(protocolComponent.name, protocolComponent);
    } else {
      this.engine.register(protocolComponent);
    }
    this.setState({ primitiveComponents: primitiveComponents });
    this.editor.trigger("process");
  }

  async rebuildPrimitives() {
    await axios.get(endpoint.editor.rebuild)
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

  async downloadCurrentGraph() {
    // TODO I need to convert the protocol storage on the client to
    // match the server side primary key (id) instead of using the
    // protocol name.
    if (this.state.currentProtocol == null) {
      console.error(`Must select a protocol to download`)
      return
    }
    var currentProtocol = this.state.protocols[this.state.currentProtocol]
    downloadStringAsFile(JSON.stringify(currentProtocol.graph, null, 2), "graph.json")
  }

  async downloadCurrentProtocol() {
    // TODO I need to convert the protocol storage on the client to
    // match the server side primary key (id) instead of using the
    // protocol name.
    if (this.state.currentProtocol == null) {
      console.error(`Must select a protocol to download`)
      return
    }
    var currentProtocol = this.state.protocols[this.state.currentProtocol]
    if (currentProtocol.id == null) {
      // TODO new protocols should either be created on the server side or
      // we should popup a modal to allow saving right now. The server backend
      // is needed to convert the protocol into RDF for download.
      console.error(`${currentProtocol.name} was never saved so it cannot be downloaded`)
      return
    }
    await axios.get(`${endpoint.editor.protocol}${currentProtocol.id}/download/`, {
        responseType: 'blob'
      })
      .then(function (response) {
        let disposition = response.headers['content-disposition'];
        var filename = 'unknown_file'
        // from https://stackoverflow.com/a/40940790
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        downloadStringAsFile(response.data, filename)
        return response;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        return [];
      });
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

    let workspaceComponent = () => (
        <div className="editor-workspace" ref={this.workspaceRef} />
    )

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
        <Row className="editor" >
          <Col xs={2} sm={2} className="editor-pallete-column">
            <div className="editor-pallete" ref={this.palleteRef} />
          </Col>

          <Col xs={10} sm={10} className="editor-main-column">

              <ProtocolInspectorGroup
                                      editor={this}
                                      currentProtocol={this.state.currentProtocol}
                                      protocols={this.state.protocols}
                                      workspaceComponent={workspaceComponent}
                                      />

          </Col>
        </Row>
      </Container>
    );
  }
}


