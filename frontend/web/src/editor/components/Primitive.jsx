import Rete from "rete";
import { axios, axios_csrf_options, endpoint } from "../../API";


export var numSocket = new Rete.Socket("Number value");
export var floatSocket = new Rete.Socket("Float");


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
  constructor(socketFn, primitive) {
    super(primitive.name)
    this.primitive = primitive;
    this.socketFn = socketFn;
  }

  async builder(node) {
    var inputs = this.primitive.inputs.map(i => new Rete.Input(i.name, i.name, this.socketFn(i.type)))
    inputs.forEach(i => node.addInput(i))
    var outputs = this.primitive.outputs.map(i => new Rete.Output(i.name, i.name, this.socketFn(i.type)))
    outputs.forEach(i => node.addOutput(i))
    return node;
  }
}