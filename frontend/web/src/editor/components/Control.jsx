import React from "react";
import { Dropdown } from "react-bootstrap";
import Rete from "rete";
import { MyNode } from "./Node";
import { numSocket, floatSocket } from "./Primitive"

class MyReactControl extends React.Component {

  state = {};
  componentDidMount() {
    this.props.onMount();
    this.setState({
      value: this.props.value
    });

    //console.log(this.props);
    //this.props.putData(this.props.id, this.props.name);
  }
  handleChange(event) {
    // this.props.putData(this.props.id, event.target.value);
    this.props.onChange(event);
    // this.props.emitter.trigger("process");
    this.setState({
       value: event.target.value
    });
  }

  render() {
    return (
      <input value={this.state.value} onChange={this.handleChange.bind(this)} />
    );
  }
}

// export class MyControl extends Rete.Control {
//   constructor(emitter, key, name) {
//     super(key);
//     this.render = "react";
//     this.component = MyReactControl;
//     this.props = {
//       emitter,
//       id: key,
//       name,
//       putData: () => this.putData.apply(this, arguments)
//     };
//   }
// }

export class ModuleComponent extends Rete.Component {
  constructor(name) {
    super(name);
    this.module = {
      nodeType: "module"
    };
  }

  builder(node) {
    var ctrl = new TextControl(this.editor, "module", this.name);
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
      nodeType: 'input',
      socket: numSocket
    }
    this.data.component = MyNode;
  }

  builder(node) {
    var out1 = new Rete.Output("output", "", numSocket);

    var ctrlName = Object.keys(node.data).find(k => k == "name")
    var value = ctrlName ? node.data[ctrlName] : "New Input";
    var ctrl = new TextControl(this.editor, "name", value);

    var typeName = Object.keys(node.data).find(k => k == "type")
    var value = typeName ? node.data[typeName] : "one";
    var typectrl = new ListControl(this.editor, "type", value,
    [
      "one", "two"
    ]
    )

    return node
               .addOutput(out1)
               .addControl(ctrl)
               .addControl(typectrl);
               ;
  }

  async worker(node, inputs, outputs) {
    if (!outputs['num'])
        outputs['num'] = node.data.number; // here you can modify received outputs of Input node
  }
}

export class ParameterComponent extends Rete.Component {
  constructor() {
    super("Parameter");

    this.data.component = MyNode;
  }

  builder(node) {
    var out1 = new Rete.Output("output", "", numSocket);

    var ctrlName = Object.keys(node.data).find(k => k == "name")
    var value = ctrlName ? node.data[ctrlName] : "New Parameter";
    var ctrl = new TextControl(this.editor, "name", value);

    var typeName = Object.keys(node.data).find(k => k == "type")
    var value = typeName ? node.data[typeName] : "one";
    var typectrl = new ListControl(this.editor, "type", value,
    [
      "one", "two"
    ]
    )

    var parameterValue = new ListControl(this.editor, "value", "one",
    [
      "one", "two"
    ]
    )

    return node
               .addOutput(out1)
               .addControl(ctrl)
               .addControl(typectrl)
               .addControl(parameterValue)
               ;
  }

  async worker(node, inputs, outputs) {
    if (!outputs['num'])
        outputs['num'] = node.data.number; // here you can modify received outputs of Input node
  }
}



export class OutputComponent extends Rete.Component {
  constructor() {
    super("Output");
    this.module = {
      nodeType: "output",
      socket: numSocket
    };
    this.data.component = MyNode;
  }

  builder(node) {
    var inp = new Rete.Input("input", "Value", numSocket);

    var ctrlName = Object.keys(node.data).find(k => k == "name")
    var value = ctrlName ? node.data[ctrlName] : "New Output";
    var ctrl = new TextControl(this.editor, "name", value);

    return node.addControl(ctrl).addInput(inp);
  }

  async worker(node, inputs, outputs) {
    if (!outputs['num'])
        outputs['num'] = node.data.number; // here you can modify received outputs of Input node
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

class ReactListControl extends React.Component {

  state = {};
  componentDidMount() {
    this.props.onMount()
    this.setState({
      value: this.props.value
    });
    //console.log(this.props);
    //this.props.putData(this.props.id, this.props.name);
  }
  onChange(event) {
    // this.props.putData(this.props.id, event.target.value);
    this.props.onChange(event);
    // this.props.emitter.trigger("process");
    this.setState({
      value: event
    });
  }

  render() {
    var items = this.props.values.map(o => <Dropdown.Item eventKey={o}>{o}</Dropdown.Item>)

    return (
      <Dropdown onSelect={(k) => { this.onChange(k) }}>
        <Dropdown.Toggle  id="dropdown-basic">
          {this.props.keyName}: {this.state.value}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {items}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

class ListControl extends Rete.Control{
  constructor(emitter, key, value, values) {
    super(key);
    this.render = "react";
    this.component = ReactListControl;
    this.props = {
      // emitter,
      keyName: key,
      value: value,
      values: values,
      onChange: (e) => this.change(e),
      onMount: () => this.mounted()
      // putData: () => this.putData.apply(this, arguments),
      // getData: () => this.getData.apply(this, arguments)
    };
    this.emitter = emitter;
    this.key = key;
    this.type = "text";
    // // this.template = `<input type="${type}" :readonly="readonly" :value="value" @input="change($event)"/>`;

    this.scope = {
      value: value,
      // readonly,
      change: this.change.bind(this),
      update: this.doUpdate.bind(this)
    };
  }
  onChange() {}

  change(e) {
    this.setValue(e);
    this.doUpdate();
    this.onChange();
  }

  doUpdate() {
    if (this.key) this.putData(this.key, this.scope.value);
    this.emitter.trigger("process");
  }

  mounted() {
    this.putData(this.key, this.scope.value);
    this.setValue(this.getData(this.key));
    this.doUpdate();
  }

  setValue(val) {
    this.scope.value = val;
    this.props.value = val;
  }
}

export class TextControl extends Rete.Control {
  constructor(emitter, key, value=null, type="text") {
    super(key);
    this.render = "react";
    this.component = MyReactControl;

    this.props = {
      // emitter,
      key: key,
      value: value,
      // putData: () => this.putData.apply(this, arguments),
      onChange: (e) => this.change(e),
      onMount: () => this.mounted()
    };

    this.emitter = emitter;
    this.key = key;
    this.type = type;
    // // this.template = `<input type="${type}" :readonly="readonly" :value="value" @input="change($event)"/>`;

    this.scope = {
      value: value,
      // readonly,
      change: this.change.bind(this),
      update: this.doUpdate.bind(this)
    };
  }

  onChange() {}

  change(e) {
    this.setValue(this.type === "number" ? +e.target.value : e.target.value);
    this.doUpdate();
    this.onChange();
  }

  doUpdate() {
    if (this.key) this.putData(this.key, this.scope.value);
    this.emitter.trigger("process");
  }

  mounted() {
    this.putData(this.key, this.scope.value);
    this.setValue(this.getData(this.key) || (this.type === "number" ? 0 : "..."));
    this.doUpdate();
  }

  setValue(val) {
    this.scope.value = val;
    this.props.value = val;
  }
}