import Rete from "rete";
import { axios, axios_csrf_options, endpoint } from "../../API";
import { MyNode, } from "./Node";
import { PAMLInputControlComponent } from "./IOComponents";


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

export class PAMLComponent extends Rete.Component {
  constructor(portTypes, primitive, saveProtocol) {
    super(primitive.name)
    this.primitive = primitive;
    this.portTypes = portTypes;
    this.data.component = MyNode;
    this.saveProtocol = saveProtocol;

    // this.dataTypes = new Set();
    // primitive.inputs.map((i) => this.dataTypes.add(i.type));
    // primitive.outputs.map((i) => this.dataTypes.add(i.type));
  }

  async builder(node) {
    //node = new MyNode();
    var inputs = this.primitive.inputs.map(i => new
      PAMLInputPin(i.name, i.name, this.portTypes[i.type].socket, i.type, this.saveProtocol));
    inputs.forEach(i => i.addControl(new PAMLInputControl(node.editor, i, this.saveProtocol)));
    inputs.forEach(i => node.addInput(i))
    var outputs = this.primitive.outputs.map(i => new Rete.Output(i.name, i.name, this.portTypes[i.type].socket))
    outputs.forEach(i => node.addOutput(i))
    var start = new TimepointIn("Start", "Start", timeSocket);
    var end = new TimepointOut("End", "End", timeSocket);
    node.addInput(start);
    node.addOutput(end);
    node.saveProtocol = this.saveProtocol;
    return node;
  }
}

