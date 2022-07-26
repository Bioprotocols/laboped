import Rete from "rete";
import { axios, axios_csrf_options, endpoint } from "../../API";
import { MyNode, PAMLInputControlComponent } from "./Node";
import { ModuleComponent } from "./Control";

export var numSocket = new Rete.Socket("Number");
export var floatSocket = new Rete.Socket("Float");
export var timeSocket = new Rete.Socket("Timepoint");
export var pamlSocket = new Rete.Socket("pamlSocket");

export async function loadComponentsFromAPI() {
  let primitives = axios
    .get(endpoint.editor.primitive, axios_csrf_options)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      return [];
    });
  return primitives;
}


export class TimepointIn extends Rete.Input {
  constructor(key, title, socket) {
    super(key, title, socket, true  /* multcons */);
  }
}

export class TimepointOut extends Rete.Output {
  constructor(key, title, socket) {
    super(key, title, socket, true  /* multcons */);
  }
}

export class PAMLInputControl extends Rete.Control {
  constructor(emitter, input, saveProtocol) {
    super(input.key);
    this.render = "react";
    this.component = PAMLInputControlComponent;
    this.emitter = emitter;
    this.saveProtocol = saveProtocol;

    this.props = {
      input: input,
      onChange: (e) => this.change(e),
      onMount: () => this.mounted()
    };
    this.scope = {
      input: input,
      // readonly,
      change: this.change.bind(this),
      update: this.doUpdate.bind(this)
    };
  }
  onChange() { }

  change(e) {
    this.setValue(e);
    this.doUpdate();
    this.onChange();
  }
  doUpdate() {
    if (this.scope.input) {
      this.putData(this.scope.input.key, this.scope.input.node.data[this.scope.input.key]);
    }
  }
  mounted() {
    // if (this.scope.input) {
    // this.putData(this.scope.input.key, this.scope.input.node.data[this.scope.input.key]);
    //this.setValue(this.getData(this.scope.input.key));
    this.doUpdate();
    // }
  }

  setValue(val) {
    if (this.scope.input) {
      this.putData(this.scope.input.key, val);
    }
    // this.scope.value = val;
    // this.props.value = val;
  }
}



export class PAMLInputPin extends Rete.Input {
  constructor(key, title, socket, type, saveProtocol) {
    super(key, title, socket, true  /* multcons */);
    this.type = type;
    this.saveProtocol = saveProtocol;
  }
}

export class PAMLComponent extends Rete.Component {
  constructor(socketFn, primitive, saveProtocol) {
    super(primitive.name)
    this.primitive = primitive;
    this.socketFn = socketFn;
    this.data.component = MyNode;
    this.saveProtocol = saveProtocol;

    this.dataTypes = new Set();
    primitive.inputs.map((i) => this.dataTypes.add(i.type));
    primitive.outputs.map((i) => this.dataTypes.add(i.type));
  }

  async builder(node) {
    //node = new MyNode();
    var inputs = this.primitive.inputs.map(i => new
      PAMLInputPin(i.name, i.name,
        // this.socketFn(i.type),
        pamlSocket, i.type, this.saveProtocol
      ));
    inputs.forEach(i => i.addControl(new PAMLInputControl(node.editor, i, this.saveProtocol)));
    inputs.forEach(i => node.addInput(i))
    var outputs = this.primitive.outputs.map(i => new Rete.Output(i.name, i.name, this.socketFn(i.type)))
    outputs.forEach(i => node.addOutput(i))
    var start = new TimepointIn("Start", "Start", timeSocket);
    var end = new TimepointOut("End", "End", timeSocket);
    node.addInput(start);
    node.addOutput(end);
    node.saveProtocol = this.saveProtocol;
    return node;
  }
}

export class PAMLProtocolComponent extends ModuleComponent {
  constructor(socketFn, protocol) {
    super(protocol.name)
    this.protocol = protocol;
    this.socketFn = socketFn;
    this.data.component = MyNode;

  }

  async builder(node) {

    var inputs = Object.values(this.protocol.graph.nodes).filter(
      n => n.name === "Input"
    ).map((i, idx) => {
      if (Object.keys(i.data).find(i => i === "name")) {
        return new Rete.Input(i.data.name, i.data.name, this.socketFn(i.type));
      } else {
        return new Rete.Input("i" + idx, "i" + idx, this.socketFn(i.type));
      }
    }

    );
    inputs.forEach(i => node.addInput(i))

    var outputs = Object.values(this.protocol.graph.nodes).filter(
      n => n.name === "Output"
    ).map((i, idx) => {
      if (Object.keys(i.data).find(i => i === "name")) {
        return new Rete.Output(i.data.name, i.data.name, this.socketFn(i.type));
      } else {
        return new Rete.Output("o" + idx, "o" + idx, this.socketFn(i.type));
      }
    }
    );
    outputs.forEach(i => {
      node.addOutput(i)

    })


    // var outputs = this.primitive.outputs.map(i => new Rete.Output(i.name, i.name, this.socketFn(i.type)))
    // outputs.forEach(i => node.addOutput(i))
    // var start = new TimepointIn("Start", "Start", timeSocket);
    // var end = new TimepointOut("End", "End", timeSocket);
    // node.addInput(start);
    // node.addOutput(end);

    node.data['isModule'] = true;

    return node;
  }
}