import Rete from "rete";
import { MyControl } from "./Control";


var numSocket = new Rete.Socket("Number value");

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