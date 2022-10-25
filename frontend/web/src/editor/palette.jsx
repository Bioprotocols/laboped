import React, { Component } from 'react';
import DockPlugin from "rete-dock-plugin";
import ReactRenderPlugin from "rete-react-render-plugin";
import { Accordion } from 'react-bootstrap';

var PROTOCOLS = "Protocols";
var CONTROLS = "Controls";

export class Palette extends Component {


  constructor(props) {
    super(props);
    this.paletteRefs = new Set();
    Array.from(props.libraries).map(
      (library) => {
        this.paletteRefs[library] = new React.createRef();
        return library;
      })
    this.paletteRefs[PROTOCOLS] = new React.createRef();
    this.paletteRefs[CONTROLS] = new React.createRef();
  }

  addDockForGroup(groupName) {
    let options = {
      container: this.paletteRefs[groupName].current,
      itemClass: 'item', // default: dock-item
      plugins: [ReactRenderPlugin], // render plugins
    };
    DockPlugin.install(this.props.editor, options || {});

    let registerHandlers = this.props.editor.events.componentregister;
    let registerHandler = registerHandlers[registerHandlers.length - 1];
    registerHandlers[registerHandlers.length - 1] = function (c) {
      if ('primitive' in c && c.primitive.library === groupName) {
        return registerHandler(c);
      } else if (('module' in c) && (c.module.nodeType === "module") && PROTOCOLS === groupName) {
        return registerHandler(c);
      } else if ('module' in c && c.module.nodeType !== "module" && CONTROLS === groupName) {
        return registerHandler(c);
      } else {
        return null;
      }
    }
  }

  componentDidMount() {
    Array.from(this.props.libraries).map((library) => { this.addDockForGroup(library); return library })
    Object.values(this.props.components).map(c => { this.props.editor.trigger("componentregister", c); return c; });

    this.addDockForGroup(PROTOCOLS);
    Object.values(this.props.protocolComponents).map(c => { this.props.editor.trigger("componentregister", c); return c; });

    this.addDockForGroup(CONTROLS);
    Object.values(this.props.controlsComponents).map(c => { this.props.editor.trigger("componentregister", c); return c; });
  }

  render() {
    return (
      <Accordion defaultActiveKey={this.props.libraries.any} flush>
        <Accordion.Item eventKey={PROTOCOLS} key={PROTOCOLS}>
          <Accordion.Header>{PROTOCOLS}</Accordion.Header>
          <Accordion.Body>
            <div className="editor-palette" ref={this.paletteRefs[PROTOCOLS]} />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey={CONTROLS} key={CONTROLS}>
          <Accordion.Header>{CONTROLS}</Accordion.Header>
          <Accordion.Body>
            <div className="editor-palette" ref={this.paletteRefs[CONTROLS]} />
          </Accordion.Body>
        </Accordion.Item>
        {
          Array.from(this.props.libraries).map((lib) => {
            return (<Accordion.Item eventKey={lib} key={lib}>
              <Accordion.Header>{lib}</Accordion.Header>
              <Accordion.Body>
                <div className="editor-palette" ref={this.paletteRefs[lib]} />
              </Accordion.Body>
            </Accordion.Item>);
          })
        }

      </Accordion >
    );
  }
}

