import Rete from "rete";
import { MyControl } from "./Control";
import axios, { axios_csrf_options } from "../../API";


export var numSocket = new Rete.Socket("Number value");
export var floatSocket = new Rete.Socket("Float");


export async function loadComponentsFromAPI() {
    let primitives = axios
        .get("/primitive/", axios_csrf_options)
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
  constructor(primitive) {
    super(primitive.name)
    this.primitive = primitive;
  }

  async builder(node) {
    var inputs = this.primitive.inputs.map(i => new Rete.Input(i.name, i.name, numSocket))
    inputs.forEach(i => node.addInput(i))
    var outputs = this.primitive.outputs.map(i => new Rete.Output(i.name, i.name, numSocket))
    outputs.forEach(i => node.addOutput(i))
    return node;
  }
}

export class AddComponent extends Rete.Component {
    constructor() {
      super("Add");
    }
  
    builder(node) {
      var inp = new Rete.Input("num1", "Number", numSocket);
      var out = new Rete.Output("num", "Number", numSocket);
      var ctrl = new MyControl(this.editor, "greeting", "#username");
  
      return node
        .addInput(inp)
        .addOutput(out)
        .addControl(ctrl);
    }
  
    worker(node, inputs, outputs) {
      console.log(node.data.greeting);
    }
  }