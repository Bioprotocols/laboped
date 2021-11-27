import React from "react";
import Rete from "rete";
import { numSocket, floatSocket } from "./Primitive"

class MyReactControl extends React.Component {
  state = {};
  componentDidMount() {
    this.setState({
      name: this.props.name
    });
    console.log(this.props);
    this.props.putData(this.props.id, this.props.name);
  }
  onChange(event) {
    this.props.putData(this.props.id, event.target.value);
    this.props.emitter.trigger("process");
    this.setState({
      name: event.target.value
    });
  }

  render() {
    return (
      <input value={this.state.name} onChange={this.onChange.bind(this)} />
    );
  }
}

export class MyControl extends Rete.Control {
  constructor(emitter, key, name) {
    super(key);
    this.render = "react";
    this.component = MyReactControl;
    this.props = {
      emitter,
      id: key,
      name,
      putData: () => this.putData.apply(this, arguments)
    };
  }
}

export class ModuleComponent extends Rete.Component {
  constructor() {
    super("Module");
    this.module = {
      nodeType: "module"
    };
  }

  builder(node) {
    var ctrl = new TextControl(this.editor, "module");
    ctrl.onChange = () => {
      console.log(this);
      this.updateModuleSockets(node);
      // node._alight.scan();
    };
    return node.addControl(ctrl);
  }

  change(node, item) {
    node.data.module = item;
    this.editor.trigger("process");
  }
}

export class InputComponent extends Rete.Component {
  constructor() {
    super("Input");
    this.module = {
      nodeType: "input",
      socket: numSocket
    };
  }

  builder(node) {
    var out1 = new Rete.Output("output", "Input", numSocket);
    var ctrl = new TextControl(this.editor, "name");

    return node.//addControl(ctrl).
    addOutput(out1);
  }
}



export class OutputComponent extends Rete.Component {
  constructor() {
    super("Output");
    this.module = {
      nodeType: "output",
      socket: numSocket
    };
  }

  builder(node) {
    var inp = new Rete.Input("input", "Value", numSocket);
    var ctrl = new TextControl(this.editor, "name");

    return node.addControl(ctrl).addInput(inp);
  }
}

export class OutputFloatComponent extends Rete.Component {
  constructor() {
    super("Float Output");
    this.module = {
      nodeType: "output",
      socket: floatSocket
    };
  }

  builder(node) {
    var inp = new Rete.Input("float", "Float", floatSocket);
    var ctrl = new TextControl(this.editor, "name");

    return node.addControl(ctrl).addInput(inp);
  }
}

class TextControl extends Rete.Control {
  constructor(emitter, key, name, readonly = false, type = "text") {
    super(key);
    this.render = "react";
    this.component = MyReactControl;
    this.props = {
      emitter,
      id: key,
      name,
      putData: () => this.putData.apply(this, arguments)
    };
    // this.emitter = emitter;
    // this.key = key;
    // this.type = type;
    // this.template = `<input type="${type}" :readonly="readonly" :value="value" @input="change($event)"/>`;

    // this.scope = {
    //   value: null,
    //   readonly,
    //   change: this.change.bind(this)
    // };
  }

  // onChange() {}

  // change(e) {
  //   this.scope.value =
  //     this.type === "number" ? +e.target.value : e.target.value;
  //   this.update();
  //   this.onChange();
  // }

  // update() {
  //   if (this.key) this.putData(this.key, this.scope.value);
  //   this.emitter.trigger("process");
  //   //this._alight.scan();
  // }

  // mounted() {
  //   this.scope.value =
  //     this.getData(this.key) || (this.type === "number" ? 0 : "...");
  //   //this.update();
  // }

  // setValue(val) {
  //   this.scope.value = val;
  //   //this._alight.scan();
  // }
}