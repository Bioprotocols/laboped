import Rete from "rete";
import { TextControl } from "./IOComponents";
import { PAMLComponent } from ".";

export class ModuleComponent extends PAMLComponent {
    constructor(props) {
        super(props);
        this.module = {
            nodeType: "module"
        };
    }

    builder(node) {
        var ctrl = new TextControl(this.editor, "module", this.name);
        node.onChange = () => {
            console.log(this);
            this.updateModuleSockets(node);
        };
        return node.addControl(ctrl);
    }

    change(node, item) {
        node.data.module = item;
    }
}

export class PAMLProtocolComponent extends ModuleComponent {
    constructor(props) {
        super({ name: props.protocol.name, ...props })
        this.protocol = props.protocol;
    }

    getFullTypeName(node) {
        let storedType = node.data['type']; // if present is a shortened type name
        if (storedType) {
            let fullStoredType = Object.keys(this.portTypes).find(key => this.portTypes[key].typeName === storedType);
            return fullStoredType;
        }
        return this.defaultType;
    }

    async builder(node) {

        var inputs = Object.values(this.protocol.graph.nodes).filter(
            n => n.name === "Input"
        ).map((i, idx) => {
            if (Object.keys(i.data).find(i => i === "name")) {
                return new Rete.Input(i.data.name, i.data.name, this.portTypes[this.getFullTypeName(i)].socket);
            } else {
                return new Rete.Input("i" + idx, "i" + idx, this.portTypes[this.getFullTypeName(i)].socket);
            }
        }

        );

        inputs.forEach(i => node.addInput(i))

        var outputs = Object.values(this.protocol.graph.nodes).filter(
            n => n.name === "Output"
        ).map((i, idx) => {
            if (Object.keys(i.data).find(i => i === "name")) {
                return new Rete.Output(i.data.name, i.data.name, this.portTypes[this.getFullTypeName(i)].socket);
            } else {
                return new Rete.Output("o" + idx, "o" + idx, this.portTypes[this.getFullTypeName(i)].socket);
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