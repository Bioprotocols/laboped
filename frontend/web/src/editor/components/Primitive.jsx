import Rete from "rete";

import { axios, axios_csrf_options, endpoint } from "../../API";
import { LABOPInputPin, TimepointIn, TimepointOut, LABOPInputControlComponent, MyReactControl } from "./IOComponents";
import { LABOPComponent, LABOPInputControl, TextControl } from ".";

// export var numSocket = new Rete.Socket("Number");
// export var floatSocket = new Rete.Socket("Float");
export var timeSocket = new Rete.Socket("Timepoint");
// export var labopSocket = new Rete.Socket("labopSocket");

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



export class LABOPPrimitiveComponent extends LABOPComponent {
  constructor(props) {
    super({ name: props.primitive.name, ...props })
    this.primitive = props.primitive;
  }

  async builder(node) {
    //node = new MyNode();
    try {
      let nameCtrl = new TextControl({
        emitter: this.editor,
        component: MyReactControl,
        key: "name",
        name: "name",
        value: this.getName(node),
        saveProtocol: this.saveProtocol,
        //onChangeCallback: this.handleNameChange.bind(this)
      });
      node.addControl(nameCtrl);

      var inputs = this.primitive.inputs.map(i => new
        LABOPInputPin({
          key: i.name,
          title: i.name,
          socket: this.portTypes[i.type].socket,
          type: i.type,
          saveProtocol: this.saveProtocol,
          onChange: null
        }));
      inputs.forEach(i => i.addControl(new LABOPInputControl({
        key: i.name,
        name: i.name,
        emitter: node.editor,
        component: LABOPInputControlComponent,
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