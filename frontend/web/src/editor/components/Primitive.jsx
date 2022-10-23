import Rete from "rete";

import { axios, axios_csrf_options, endpoint } from "../../API";
import { PAMLInputPin, PAMLInputControl, TimepointIn, TimepointOut, PAMLInputControlComponent } from "./IOComponents";
import { PAMLComponent } from ".";

// export var numSocket = new Rete.Socket("Number");
// export var floatSocket = new Rete.Socket("Float");
export var timeSocket = new Rete.Socket("Timepoint");
// export var pamlSocket = new Rete.Socket("pamlSocket");

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



export class PAMLPrimitiveComponent extends PAMLComponent {
  constructor(props) {
    super({ name: props.primitive.name, ...props })
    this.primitive = props.primitive;
  }
  async builder(node) {
    //node = new MyNode();
    try {
      var inputs = this.primitive.inputs.map(i => new
        PAMLInputPin({
          key: i.name,
          title: i.name,
          socket: this.portTypes[i.type].socket,
          type: i.type,
          saveProtocol: this.saveProtocol,
          onChange: null
        }));
      inputs.forEach(i => i.addControl(new PAMLInputControl({
        key: i.name,
        name: i.name,
        emitter: node.editor,
        component: PAMLInputControlComponent,
        value: null,
        saveProtocol: this.saveProtocol,
        onChangeCallback: null
      })));
      inputs.forEach(i => node.addInput(i))
    } catch (error) {
      console.log("Could not create an input pin for " + node.name)
    }

    var outputs = this.primitive.outputs.map(
      i => new Rete.Output(i.name, i.name, this.portTypes[i.type].socket)
    )
    outputs.forEach(i => node.addOutput(i))
    var start = new TimepointIn("Start", "Start", timeSocket);
    var end = new TimepointOut("End", "End", timeSocket);
    node.addInput(start);
    node.addOutput(end);
    node.saveProtocol = this.saveProtocol;
    return node;
  }
}