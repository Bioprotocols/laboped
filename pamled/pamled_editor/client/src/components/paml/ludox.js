import Rete from 'rete'; // eslint-disable-line max-classes-per-file

var numSocket = new Rete.Socket("Number");
var strSocket = new Rete.Socket("String");
var floatSocket = new Rete.Socket("Float");
var controlSocket = new Rete.Socket("Control");

export class TextControl extends Rete.Control {
  constructor(emitter, key, readonly, type = "text") {
    super(key);
    this.emitter = emitter;
    this.key = key;
    this.type = type;
    this.template = `<input type="${type}" :readonly="readonly" :value="value" @input="change($event)"/>`;

    this.scope = {
      value: null,
      readonly,
      change: this.change.bind(this)
    };
  }

  onChange() {}

  change(e) {
    this.scope.value =
      this.type === "number" ? +e.target.value : e.target.value;
    this.update();
    this.onChange();
  }

  update() {
    if (this.key) this.putData(this.key, this.scope.value);
    this.emitter.trigger("process");
    //this._alight.scan();
  }

  mounted() {
    this.scope.value =
      this.getData(this.key) || (this.type === "number" ? 0 : "...");
    this.update();
  }

  setValue(val) {
    this.scope.value = val;
    //this._alight.scan();
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

    return node
    //.addControl(ctrl)
    .addOutput(out1);
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
    return node; //.addControl(ctrl);
  }

  change(node, item) {
    node.data.module = item;
    this.editor.trigger("process");
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

    return node
    //.addControl(ctrl)
    .addInput(inp);
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

    return node
    //.addControl(ctrl)
    .addInput(inp);
  }
}

export class NumComponent extends Rete.Component {
  constructor() {
    super("Number");
  }

  builder(node) {
    var out1 = new Rete.Output("num", "Value", numSocket);
    var ctrl = new TextControl(this.editor, "num", false, "number");

    return node
    //.addControl(ctrl)
    .addOutput(out1);
  }

  worker(node, inputs, outputs) {
    outputs["num"] = node.data.num;
  }
}

export class NumOutputComponent extends Rete.Component {
  constructor() {
    super("NumOutput");
  }

  builder(node) {
    var in1 = new Rete.Input("num", "Value", numSocket);
    var ctrl = new TextControl(this.editor, "num", false);

    return node
    //.addControl(ctrl)
    .addInput(in1);
  }

  worker(node, inputs, outputs) {
    inputs["num"] = node.data.num;
  }
}

export class AddComponent extends Rete.Component {
  constructor() {
    super("Add");
  }

  builder(node) {
    var inp1 = new Rete.Input("num1", "Number", numSocket);
    var inp2 = new Rete.Input("num2", "Number", numSocket);
    var out = new Rete.Output("num", "Number", numSocket);

    inp1.addControl(new TextControl(this.editor, "num1", false, "number"));
    inp2.addControl(new TextControl(this.editor, "num2", false, "number"));

    return node
      .addInput(inp1)
      .addInput(inp2)
      // .addControl(new TextControl(this.editor, "preview", true))
      .addOutput(out);
  }

  worker(node, inputs, outputs, { silent } = {}) {
    var n1 = inputs["num1"].length ? inputs["num1"][0] : node.data.num1;
    var n2 = inputs["num2"].length ? inputs["num2"][0] : node.data.num2;
    var sum = n1 + n2;

    if (!silent)
      this.editor.nodes
        .find((n) => n.id == node.id)
        .controls.get("preview")
        .setValue(sum);

    outputs["num"] = sum;
  }

  created(node) {
    console.log("created", node);
  }

  destroyed(node) {
    console.log("destroyed", node);
  }
}

export class ObjectNodeComponent extends Rete.Component {
  constructor(componentType) {
    super(componentType);
  }
}

export class EmptyContainerComponent extends ObjectNodeComponent {
  constructor() {
    super("EmptyContainer");
  }
  builder(node) {
    var in1 = new Rete.Input("after", "After", controlSocket, true);
    var in2 = new TextControl(this.editor, "spec", false, "string");
    var out1 = new Rete.Output("samples", "Samples", strSocket);
    var out2 = new Rete.Output("before", "Before", controlSocket);
    return node.addOutput(out1); // .addControl(in2);
  }
}

export class PlateCoordinatesComponent extends ObjectNodeComponent {
  constructor() {
    super("PlateCoordinates");
    self.defaultCoordinates = "<coordinates>";
  }
  builder(node) {
    //var in3 = new GridControl(this.editor, 'coordinates', false);
    //in3.setValue(self.default_coordinates);
    var in1 = new Rete.Input("source", "Source", strSocket);
    var in2 = new Rete.Input("after", "After", controlSocket, true);
    var out1 = new Rete.Output("samples", "Samples", strSocket);
    var out2 = new Rete.Output("before", "Before", controlSocket);
    return node.addInput(in1).addOutput(out1);
  }
}

export class ExecutableComponent extends Rete.Component {
  constructor(componentType) {
    super(componentType);
  }
}

export class ProvisionComponent extends ExecutableComponent {
  constructor() {
    super("Provision");
  }
  builder(node) {
    var in1 = new Rete.Input("after", "After", controlSocket, true);
    var in2 = new Rete.Input("destination", "Destination", strSocket);

    var in3 = new Rete.Input("after", "After", controlSocket);
    var out1 = new Rete.Output("before", "Before", controlSocket);

    var text1 = new TextControl(this.editor, "amount", false);
    var text2 = new TextControl(this.editor, "resource", false);
    return node
      .addInput(in3)
      //.addInput(in1)
      .addInput(in2)
      // .addControl(text1)
      // .addControl(text2)
      .addOutput(out1);
  }
}

export class MeasureAbsorbanceComponent extends ExecutableComponent {
  constructor() {
    super("MeasureAbsorbance");
  }
  builder(node) {
    var in1 = new Rete.Input("samples", "Samples", strSocket);
    var in2 = new Rete.Input("wavelength", "Wavelength", numSocket);
    var out1 = new Rete.Output("measurements", "Measurements", numSocket);
    var in3 = new Rete.Input("after", "After", controlSocket, true);
    var out2 = new Rete.Output("before", "Before", controlSocket);

    return node
      .addInput(in3)
      .addOutput(out2)
      .addInput(in1)
      .addInput(in2)
      .addOutput(out1);
  }
}

export const modulesData = {
    "index.rete": {
      data: {
        id: "demo@0.1.0",
        nodes: {
          11: {
            id: 11,
            data: {
              module: "ludox.rete"
            },
            inputs: {
              wavelength: {
                connections: [
                  {
                    node: 12,
                    output: "num",
                    data: {}
                  }
                ]
              }
            },
            outputs: {
              absorbance: {
                connections: [
                  {
                    node: 10,
                    input: "num",
                    data: {}
                  }
                ]
              }
            },
            position: [854, 159],
            name: "Module"
          },
          10: {
            id: 10,
            data: {
              num: "absorbance.csv"
            },
            inputs: {
              num: {
                connections: [
                  {
                    node: 11,
                    output: "absorbance",
                    data: {}
                  }
                ]
              }
            },
            outputs: {},
            position: [1217, 123],
            name: "NumOutput"
          },
          12: {
            id: 12,
            data: {
              num: 500
            },
            inputs: {},
            outputs: {
              num: {
                connections: [
                  {
                    node: 11,
                    input: "wavelength",
                    data: {}
                  }
                ]
              }
            },
            position: [410, 212],
            name: "Number"
          }
        }
      }
    },
    "ludox.rete": {
      data: {
        id: "demo@0.1.0",
        nodes: {
          3: {
            id: 3,
            data: {
              spec: "96-flat"
            },
            inputs: {},
            outputs: {
              samples: {
                connections: [
                  {
                    node: 4,
                    input: "source",
                    data: {}
                  },
                  {
                    node: 6,
                    input: "source",
                    data: {}
                  },
                  {
                    node: 8,
                    input: "source",
                    data: {}
                  }
                ]
              }
            },
            position: [0, 0],
            name: "EmptyContainer"
          },
  
          4: {
            id: 4,
            data: {
              coordinates: "A1:D1"
            },
            inputs: {
              source: {
                connections: [
                  {
                    node: 3,
                    output: "samples",
                    data: {}
                  }
                ]
              }
            },
            outputs: {
              samples: {
                connections: [
                  {
                    node: 5,
                    input: "destination",
                    data: {}
                  }
                ]
              }
            },
            position: [300, 0],
            name: "PlateCoordinates"
          },
          5: {
            id: 5,
            data: {
            //   amount: "100.0 uL",
            //   resource: "Ludox"
            },
            inputs: {
              destination: {
                connections: [
                  {
                    node: 4,
                    output: "samples",
                    data: {}
                  }
                ]
              }
            },
            outputs: {
              before: {
                connections: [
                  {
                    node: 9,
                    input: "after",
                    data: {}
                  }
                ]
              }
            },
            position: [600, 0],
            name: "Provision"
          },
          6: {
            id: 6,
            data: {
              coordinates: "A2:D2"
            },
            inputs: {
              source: {
                connections: [
                  {
                    node: 3,
                    output: "samples",
                    data: {}
                  }
                ]
              }
            },
            outputs: {
              samples: {
                connections: [
                  {
                    node: 7,
                    input: "destination",
                    data: {}
                  }
                ]
              }
            },
            position: [300, 300],
            name: "PlateCoordinates"
          },
          7: {
            id: 7,
            data: {
            //   amount: "100 uL",
            //   resource: "Water"
            },
            inputs: {},
            outputs: {
              before: {
                connections: [
                  {
                    node: 9,
                    input: "after",
                    data: {}
                  }
                ]
              }
            },
            position: [600, 300],
            name: "Provision"
          },
          8: {
            id: 8,
            data: {
              coordinates: "A1:D2"
            },
            inputs: {
              source: {
                connections: [
                  {
                    node: 3,
                    output: "samples",
                    data: {}
                  }
                ]
              }
            },
            outputs: {
              samples: {
                connections: [
                  {
                    node: 9,
                    input: "samples",
                    data: {}
                  }
                ]
              }
            },
            position: [300, 600],
            name: "PlateCoordinates"
          },
          9: {
            id: 9,
            data: {},
            inputs: {
              wavelength: {
                connections: [
                  {
                    node: 1,
                    output: "output",
                    data: {}
                  }
                ]
              },
              samples: {
                connections: [
                  {
                    node: 8,
                    output: "samples",
                    data: {}
                  }
                ]
              },
              after: {
                connections: [
                  {
                    node: 7,
                    output: "before",
                    data: {}
                  }
                ]
              }
            },
            outputs: {
              measurements: {
                connections: [
                  {
                    node: 2,
                    input: "input",
                    data: {}
                  }
                ]
              }
            },
            position: [900, 200],
            name: "MeasureAbsorbance"
          },
          1: {
            id: 1,
            data: {
              name: "wavelength"
            },
            inputs: {},
            outputs: {
              output: {
                connections: [
                  {
                    node: 9,
                    input: "wavelength",
                    data: {}
                  }
                ]
              }
            },
            position: [600, 600],
            name: "Input"
          },
          2: {
            id: 2,
            data: {
              name: "absorbance"
            },
            inputs: {
              samples: {
                connections: [
                  {
                    node: 9,
                    output: "samples",
                    data: {}
                  }
                ]
              }
            },
            outputs: {},
            position: [1200, 200],
            name: "Output"
          }
        }
      }
    }
  };