import Rete from "rete";
import { axios, axios_csrf_options, endpoint } from "../../API";
import { MyNode } from "./Node";
import { TextControl, ModuleComponent } from "./Control";

export var numSocket = new Rete.Socket("Number");
export var floatSocket = new Rete.Socket("Float");
export var timeSocket = new Rete.Socket("Timepoint");

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
  constructor(key, title, socket){
    super(key, title, socket, true  /* multcons */);
  }
}

export class TimepointOut extends Rete.Output {
  constructor(key, title, socket){
    super(key, title, socket, true  /* multcons */);
  }
}

export class PAMLComponent extends Rete.Component {
  constructor(socketFn, primitive) {
    super(primitive.name)
    this.primitive = primitive;
    this.socketFn = socketFn;
    this.data.component = MyNode;
  }

  async builder(node) {
    //node = new MyNode();
    var inputs = this.primitive.inputs.map(i => new Rete.Input(i.name, i.name, this.socketFn(i.type)))
    inputs.forEach(i => node.addInput(i))
    var outputs = this.primitive.outputs.map(i => new Rete.Output(i.name, i.name, this.socketFn(i.type)))
    outputs.forEach(i => node.addOutput(i))
    var start = new TimepointIn("Start", "Start", timeSocket);
    var end = new TimepointOut("End", "End", timeSocket);
    node.addInput(start);
    node.addOutput(end);
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
      n => n.name == "Input"
    ).map((i, idx) => {
      if (Object.keys(i.data).find(i => i == "name")){
        return new Rete.Input(i.data.name, i.data.name, this.socketFn(i.type));
      } else {
        return new Rete.Input("i"+idx, "i"+idx, this.socketFn(i.type));
      }
    }

    );
    inputs.forEach(i => node.addInput(i))

    var outputs = Object.values(this.protocol.graph.nodes).filter(
      n => n.name == "Output"
    ).map((i, idx) => {
        if (Object.keys(i.data).find(i => i == "name")){
          return new Rete.Output(i.data.name, i.data.name, this.socketFn(i.type));
        } else {
          return new Rete.Output("o"+idx, "o"+idx, this.socketFn(i.type));
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


    return node;
  }
}