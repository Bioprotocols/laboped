import React, { Component } from 'react';
import DockPlugin from "rete-dock-plugin";
import ReactRenderPlugin from "rete-react-render-plugin";
import { Accordion } from 'react-bootstrap';
import { Tabs, Tab } from 'react-bootstrap';

var PROTOCOLS = "Protocols";

export class Palette extends Component {


  constructor(props) {
    super(props);
    this.palleteRefs = new Set();
    Array.from(props.libraries).map(
      (library) => {
        this.palleteRefs[library] = new React.createRef();
      })
    this.palleteRefs[PROTOCOLS] = new React.createRef();
  }

  addDockForGroup(groupName) {
    let options = {
      container: this.palleteRefs[groupName].current,
      itemClass: 'item', // default: dock-item
      plugins: [ReactRenderPlugin], // render plugins
    };
    DockPlugin.install(this.props.editor, options || {});

    let registerHandlers = this.props.editor.events.componentregister;
    let registerHandler = registerHandlers[registerHandlers.length - 1];
    registerHandlers[registerHandlers.length - 1] = function (c) {
      if ('primitive' in c && c.primitive.library === groupName) {
        return registerHandler(c);
      } else if (!('primitive' in c) && PROTOCOLS === groupName) {
        return registerHandler(c);
      } else {
        return null;
      }
    }
  }

  componentDidMount() {
    Array.from(this.props.libraries).map((library) => { this.addDockForGroup(library) })
    Object.values(this.props.components).map(c => { this.props.editor.trigger("componentregister", c) });

    this.addDockForGroup(PROTOCOLS);
    Object.values(this.props.protocolComponents).map(c => { this.props.editor.trigger("componentregister", c) });
  }

  render() {
    return (
      <Accordion defaultActiveKey={this.props.libraries.any} flush>
        <Accordion.Item eventKey={PROTOCOLS}>
          <Accordion.Header>{PROTOCOLS}</Accordion.Header>
          <Accordion.Body>
            <div className="editor-pallete" ref={this.palleteRefs[PROTOCOLS]} />
          </Accordion.Body>
        </Accordion.Item>
        {
          Array.from(this.props.libraries).map((lib) => {
            return (<Accordion.Item eventKey={lib}>
              <Accordion.Header>{lib}</Accordion.Header>
              <Accordion.Body>
                <div className="editor-pallete" ref={this.palleteRefs[lib]} />
              </Accordion.Body>
            </Accordion.Item>);
          })
        }

      </Accordion >
    );
  }
}

