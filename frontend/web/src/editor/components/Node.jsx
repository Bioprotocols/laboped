import React from "react";
import { Node, Socket, Control } from "rete-react-render-plugin";
import { Timepoint } from "./Primitive";

export class MyNode extends Node {


  render() {
    const { node, bindSocket, bindControl } = this.props;
    const { outputs, controls, inputs, selected } = this.state;

    var start = inputs.find(element => element.key == "Start");
    var end = outputs.find(element => element.key == "End");

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
      <div className={`node ${selected}`}>
        <div className="title">{node.name}</div>
        {/* Start */}
        {startElt}
        {/* End */}
        {endElt}
        {/* Outputs */}
        {outputs.map(output => {
          if (output.key != "End"){
          return (
          <div className="output" key={output.key}>
            <div className="output-title">{output.name}</div>
            <Socket
              type="output"
              socket={output.socket}
              io={output}
              innerRef={bindSocket}
            />
          </div>
         )}})}
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
          if (input.key != "Start"){
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
        )}})}
      </div>
    );
  }
}
