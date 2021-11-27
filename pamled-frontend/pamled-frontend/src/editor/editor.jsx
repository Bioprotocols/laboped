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


export default class Editor extends Component {
  constructor(props) {
    super(props);
    this.palleteRef = React.createRef();
    this.workspaceRef = React.createRef();
    this.currentProtocol = {};
    
    this.protocols = {};
    this.editor = {};
    this.state = {
      showModal: false,
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

    // editor.use(ModulePlugin.default, { engine, modules });
    
    // function addModule() {
    //   modules["module" + Object.keys(modules).length + ".rete"] = {
    //     data: initialData()
    //   };
    // }

    // async function openModule(name) {
    //   currentModule.data = editor.toJSON();
    
    //   currentModule = modules[name];
    //   await editor.fromJSON(currentModule.data);
    //   editor.trigger("process");
    // }

  initialData () {
    return { id: "demo@0.1.0", nodes: {} };
  }

  newProtocol(){
    var data = this.initialData();
    console.log(data);
    this.editor.fromJSON(data);
  }

  saveProtocol(){
    this.setState({showModal: true})
  }

  render() {
    return (
      <Container fluid>
      <Menu 
        handleNewProtocol={this.newProtocol.bind(this)}
        handleSave={this.saveProtocol.bind(this)}
        />
      <Row  lg={12}>
        <Col  lg={4} className="editor-pallete">
          <div ref={this.palleteRef}/>
        </Col> 
        <Col lg={8}>
          <div className="editor-workspace" ref={this.workspaceRef} data-toggle="tab"/>
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
