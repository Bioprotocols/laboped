import React from "react";
import { Modal, Form, FloatingLabel } from "react-bootstrap";
import { Node, Socket, Control } from "rete-react-render-plugin";
import { FileEarmarkText } from "react-bootstrap-icons";

export class MyNode extends Node {
  state = { toggle: true };

  showNotes = () => {
    this.setState({ showNotes: true })
  }
  handleClose = () => {
    this.setState({ showNotes: false }, this.props.node.saveProtocol());
  }

  render() {
    const { node, bindSocket, bindControl } = this.props;
    const { outputs, controls, inputs, selected } = this.state;

    var start = inputs.find(element => element.key === "Start");
    var end = outputs.find(element => element.key === "End");

    let notes = (<Modal size="lg" show={this.state.showNotes} onHide={this.handleClose}>
      <Modal.Header closeButton>
        {node.name} "Description"
      </Modal.Header>
      <Modal.Body>
        <FloatingLabel controlId="floatingTextarea2" label="Description">
          <Form.Control
            as="textarea"
            placeholder="Leave a description here"
            style={{ height: '100px' }}
            onChange={(e) => (node.data["description"] = e.target.value)}
          >
            {node.data["description"]}
          </Form.Control>
        </FloatingLabel>
      </Modal.Body>
    </Modal>);

    var startElt;
    if (start) {
      startElt = (<div className="input" key={start.key}>
        <Socket
          type="input"
          socket={start.socket}
          io={start}
          innerRef={bindSocket}
        />
        {!start.showControl() && (
          <div className="input-title">{start.name}</div>
        )}
        {start.showControl() && (
          <Control
            className="input-control"
            control={start.control}
            innerRef={bindControl}
          />
        )}
      </div>)
    }
    var endElt;
    if (end) {
      endElt = (<div className="output" key={end.key}>
        <div className="output-title">{end.name}</div>
        <Socket
          type="output"
          socket={end.socket}
          io={end}
          innerRef={bindSocket}
        />
      </div>)
    }

    return (
      <div
        className={`node ${selected}`}
        name={this.props.node.name}
        ismodule={`${"isModule" in node.data && node.data["isModule"]}`}
      >
        <FileEarmarkText className="node-info" onClick={this.showNotes}></FileEarmarkText>
        {notes}
        <div className="title">{node.name}</div>

        {/* Start */}
        {startElt}
        {/* End */}
        {endElt}
        {/* Outputs */}
        {outputs.map(output => {
          if (output.key !== "End") {
            return (
              <div className="output" key={output.key}>
                {output.control && (
                  <Control
                    className="output-control"
                    control={output.control}
                    key={output.control.key}
                    innerRef={bindControl}
                  />
                )}
                {!output.control &&
                  (<div className="output-title">{output.name}</div>)
                }
                <Socket
                  type="output"
                  socket={output.socket}
                  io={output}
                  innerRef={bindSocket}
                />


              </div>
            )
          } else {
            return null;
          }
        })}
        {/* Controls */}
        {controls.map(control => (
          // <div className="control-title">{control.key}
          <Control
            className="control"
            key={control.key}
            control={control}
            innerRef={bindControl}
          />
          // </div>
        ))}
        {/* Inputs */}
        {inputs.map(input => {
          if (input.key !== "Start") {
            return (
              <div className="input" key={input.key}>
                <Socket
                  type="input"
                  socket={input.socket}
                  io={input}
                  innerRef={bindSocket}
                />
                {!input.showControl() && (
                  <div className="input-title">{input.name}</div>
                )}
                {input.showControl() && (
                  <Control
                    className="input-control"
                    control={input.control}
                    innerRef={bindControl}
                  />
                )}
              </div>
            )
          } else {
            return null;
          }
        })}
      </div>
    );
  }
}
