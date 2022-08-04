
import React from "react";
import { Dropdown, Button, Modal } from "react-bootstrap";
import Rete from "rete";
import { MyNode } from "./Node";
import { numSocket } from "./Primitive";
import { getTypeConfigurator } from "./IOConfiguration";
import { PAMLComponent } from ".";

/*
*
*  Rete Components
*
*/

export class IOComponent extends PAMLComponent {
    constructor(props) {
        super({ name: props.type, ...props });
        this.type = props.type;
        this.nodeType = props.nodeType;
        this.module = {
            nodeType: props.nodeType,
            socket: numSocket
        }
        this.defaultType = Object.keys(this.portTypes)[0];
        this.shortTypeNameOptions = Object.values(this.portTypes).map(p => p.typeName);
    }


    getLongTypeName(shortName) {
        return Object.keys(this.portTypes).find(key => this.portTypes[key].typeName === shortName);
    }

    getStoredFullTypeName(node) {
        let storedType = node.data['type']; // if present is a shortened type name
        if (storedType) {
            let fullStoredType = this.getLongTypeName(storedType);
            return fullStoredType;
        }
        return this.defaultType;
    }

    getName(node) {
        let storedName = node.data['name'];
        if (!storedName) {
            return "<New " + this.type + ">";
        }
        return storedName;
    }

    builder(node) {
        let typeName = this.getStoredFullTypeName(node);
        let shortTypeName = this.portTypes[typeName].typeName;
        let socket = this.portTypes[typeName].socket;
        let io = this.getIO(node, socket);

        let nameCtrlName = this.getName(node);
        let nameCtrl = new TextControl(this.editor, "name", nameCtrlName);

        let typeSelectorCtrl = new ListControl(this.editor, "type", shortTypeName, this.shortTypeNameOptions, this.handleTypeChange.bind(this));

        node
            .addControl(nameCtrl)
            .addControl(typeSelectorCtrl);
        this.addIOSocket(node, io);
        return node;
    }
}

export class InputComponent extends IOComponent {
    constructor(props) {
        super({ type: "Input", nodeType: "input", ...props });
    }

    async handleTypeChange(props) {
        //let socket = this.portTypes[this.getLongTypeName(props.scope.value)].socket;
        //props.parent.outputs.get(this.nodeType).setData("type", this.getLongTypeName(props.scope.value));
        //props.parent.outputs[this.nodeType] = new Rete.Output(this.nodeType, "", socket);
        //this.module.socket = socket;
        // this.editor.trigger("process");
        // this.editor.view.resize();
        //this.data.component.setState({toggle: !this.component.state.toggle})
        //await props.parent.update();
        let node = props.parent;
        let socket = this.portTypes[this.getStoredFullTypeName(node)].socket;
        node.outputs.get("input").connections.forEach((c) => c.remove());
        node.removeOutput(node.outputs.get("input"));
        node.addOutput(this.getIO(node, socket));
        await node.update();
        this.updateProtocolComponent(node);
        this.saveProtocol();
    }

    getIO(node, socket) {
        return new Rete.Output(this.nodeType, "", socket);
    }

    addIOSocket(node, io) {
        return node.addOutput(io);
    }

    // builder(node) {
    //   node.handleTypeChange = this.handleTypeChange.bind(node);

    //   //var typeName = 'type' in node.data ? node.data['type'] : Object.keys(this.portTypes)[0];
    //   //var typeValue = typeValue in this.portTypes ? typeValue : Object.keys(this.portTypes).find(key => this.portTypes[key].typeName === typeName);


    //   // var ctrlName = Object.keys(node.data).find(k => k === "name")
    //   // var value = ctrlName ? node.data[ctrlName] : "<New Input>";
    //   // var ctrl = new TextControl(this.editor, "name", value);

    //   var typectrl = new ListControl(this.editor, "type", this.portTypes[typeValue].typeName, Object.values(this.portTypes).map(p => p.typeName), node.handleTypeChange);

    //   return node
    //     .addOutput(out1)
    //     .addControl(ctrl)
    //     .addControl(typectrl);
    //   ;
    // }

    async worker(node, inputs, outputs) {
        if (!outputs['num'])
            outputs['num'] = node.data.number; // here you can modify received outputs of Input node
    }
}

export class OutputComponent extends IOComponent {
    constructor(props) {
        super({ type: "Output", nodeType: "output", ...props });
    }

    async handleTypeChange(props) {
        // let socket = this.portTypes[this.getLongTypeName(props.scope.value)].socket;
        // props.parent.inputs[this.nodeType].setData("type", this.getLongTypeName(props.scope.value));
        // props.parent.inputs[this.nodeType] = new Rete.Output(this.nodeType, "", socket);
        // this.module.socket = socket;
        let node = props.parent;
        let socket = this.portTypes[this.getStoredFullTypeName(node)].socket;
        node.inputs.get("output").connections.forEach((c) => c.remove());
        node.removeInput(node.inputs.get("output"));
        node.addInput(this.getIO(node, socket));
        await node.update();

        this.saveProtocol();
        this.updateProtocolComponent(this);
    }

    getIO(node, socket) {
        return new Rete.Input(this.nodeType, "", socket);
    }

    addIOSocket(node, io) {
        return node.addInput(io);
    }

    // constructor(portTypes) {
    //   super("Output");
    //   this.module = {
    //     nodeType: "output",
    //     socket: numSocket
    //   };
    //   this.portTypes = portTypes;
    //   this.data.component = MyNode;
    // }

    // builder(node) {
    //   var typeValue = "type" in node.data ? node.data["type"] : Object.keys(this.portTypes)[0];
    //   typeValue = typeValue in this.portTypes ? typeValue : Object.keys(this.portTypes).find(key => this.portTypes[key].typeName === typeValue);
    //   var inp = new Rete.Input("input", "Value", this.portTypes[typeValue].socket);

    //   var ctrlName = Object.keys(node.data).find(k => k === "name")
    //   var value = ctrlName ? node.data[ctrlName] : "<New Output>";
    //   var ctrl = new TextControl(this.editor, "name", value);

    //   var typectrl = new ListControl(this.editor, "type", this.portTypes[typeValue].typeName, Object.values(this.portTypes).map(p => p.typeName), node.handleTypeChange);

    //   return node.addControl(ctrl).addInput(inp).addControl(typectrl);
    // }

    async worker(node, inputs, outputs) {
        if (!outputs['num'])
            outputs['num'] = node.data.number; // here you can modify received outputs of Input node
    }
}

// export class OutputFloatComponent extends Rete.Component {
//     constructor() {
//         super("Float Output");
//         this.module = {
//             nodeType: "output",
//             socket: floatSocket
//         };
//     }

//     builder(node) {
//         var inp = new Rete.Input("float", "Float", floatSocket);
//         var ctrl = new TextControl(this.editor, "name");

//         return node.addControl(ctrl).addInput(inp);
//     }
// }


/*
*
*  Rete Controls
*
*/

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

class ListControl extends Rete.Control {
    constructor(emitter, key, value, values, onChangeCallback) {
        super(key);
        this.render = "react";
        this.component = ReactListControl;
        this.props = {
            // emitter,
            keyName: key,
            value: value,
            values: values,
            onChange: (e) => this.change(e),
            onMount: () => this.mounted(),
            //parentOnChange: (e) => onChangeCallback(e)
            // putData: () => this.putData.apply(this, arguments),
            // getData: () => this.getData.apply(this, arguments)
        };
        this.emitter = emitter;
        this.key = key;
        this.type = "text";
        this.onChangeCallback = onChangeCallback;
        // // this.template = `<input type="${type}" :readonly="readonly" :value="value" @input="change($event)"/>`;

        this.scope = {
            value: value,
            // readonly,
            change: this.change.bind(this),
            update: this.doUpdate.bind(this)
        };
    }
    onChange() {
        this.onChangeCallback(this)
        //this.emitter.trigger("rendercontrol", { control: this });
        //this.parent.update();
    }

    change(e) {
        this.setValue(e);
        this.doUpdate();
        this.onChange();
    }

    doUpdate() {
        if (this.key) this.putData(this.key, this.scope.value);
        // this.emitter.trigger("process");
    }

    mounted() {
        this.putData(this.key, this.scope.value);
        this.setValue(this.getData(this.key));
        this.doUpdate();
    }

    setValue(val) {
        this.scope.value = val;
        this.props.value = val;
    }
}

export class TextControl extends Rete.Control {
    constructor(emitter, key, value = null, type = "text") {
        super(key);
        this.render = "react";
        this.component = MyReactControl;

        this.props = {
            // emitter,
            key: key,
            value: value,
            // putData: () => this.putData.apply(this, arguments),
            onChange: (e) => this.change(e),
            onMount: () => this.mounted()
        };

        this.emitter = emitter;
        this.key = key;
        this.type = type;
        // // this.template = `<input type="${type}" :readonly="readonly" :value="value" @input="change($event)"/>`;

        this.scope = {
            value: value,
            // readonly,
            change: this.change.bind(this),
            update: this.doUpdate.bind(this)
        };
    }

    async onChange() {
        await this.update();
    }

    change(e) {
        this.setValue(this.type === "number" ? +e.target.value : e.target.value);
        this.doUpdate();
        this.onChange();
    }

    doUpdate() {
        if (this.key) this.putData(this.key, this.scope.value);
        // this.emitter.trigger("process");
    }

    mounted() {
        this.putData(this.key, this.scope.value);
        this.setValue(this.getData(this.key) || (this.type === "number" ? 0 : "..."));
        this.doUpdate();
    }

    setValue(val) {
        this.scope.value = val;
        this.props.value = val;
    }
}

export class PAMLInputPin extends Rete.Input {
    constructor(key, title, socket, type, saveProtocol) {
        super(key, title, socket, true  /* multcons */);
        this.type = type;
        this.saveProtocol = saveProtocol;
    }
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


/*
*
*  React Components
*
*/

class MyReactControl extends React.Component {

    state = { value: "" };
    componentDidMount() {
        this.props.onMount();
        this.setState({
            value: this.props.value
        });

        //console.log(this.props);
        //this.props.putData(this.props.id, this.props.name);
    }
    handleChange(event) {
        // this.props.putData(this.props.id, event.target.value);
        this.props.onChange(event);
        // this.props.emitter.trigger("process");
        this.setState({
            value: event.target.value
        });
    }

    render() {
        return (
            <input value={this.state.value} onChange={this.handleChange.bind(this)} />
        );
    }
}

class ReactListControl extends React.Component {

    state = {};
    componentDidMount() {
        this.props.onMount()
        this.setState({
            value: this.props.value
        });
        //console.log(this.props);
        //this.props.putData(this.props.id, this.props.name);
    }
    onChange(event) {
        // this.props.putData(this.props.id, event.target.value);
        this.props.onChange(event);
        // this.props.emitter.trigger("process");
        this.setState({
            value: event
        });
        //this.props.parentOnChange(event);
    }

    render() {
        var items = this.props.values.map(o => <Dropdown.Item key={o} eventKey={o}>{o}</Dropdown.Item>)

        return (
            <Dropdown

                onSelect={(k) => { this.onChange(k) }}>
                <Dropdown.Toggle variant="dark" id="dropdown-basic">
                    {this.props.keyName}: {this.state.value}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {items}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export class PAMLInputControlComponent extends React.Component {
    state = { show: false };

    componentDidMount() {
        this.props.onMount();
        // this.setState({
        //   value: this.props.value
        // });
    }
    handleClick = () => {
        console.log("Clicked! " + this.props.input.name);
        this.setState({ show: true })
    }
    handleClose = () => {
        console.log("Clicked! " + this.props.input.name);
        // console.log("Clicked! " + this.props.io.node.name + " " + this.props.io.name);
        this.setState({ show: false })
    }

    handleSave = (props) => {
        //this.socket.data = { ...this.socket.data, ...props };
        this.props.onChange(props)
        // this.setState({ data: props });
        try {
            this.props.input.node.saveProtocol();
        } catch (error) {
            console.log("Error Saving Protocol in PAMLInputControl.doUpdate()");
        }
        //Object.entries(props).forEach((k, v) => this.props.io.control.putData(k, v));

        //this.props.io.control.putData(this.props.io.name, props);
        //this.props.io.control.setData(props);
        // this.socket.change(props);
    }

    getModal = () => {

        let title = this.props.input ? (<Modal.Title>{this.props.input.node.name}.{this.props.input.name}</Modal.Title>) : (<Modal.Title></Modal.Title>);
        let type = this.props.input ? this.props.input.type : "";
        let data = (this.props.input && this.props.input.control && this.props.input.name in this.props.input.control.getNode().data) ? this.props.input.control.getData(this.props.input.name) : {}
        let configurator = this.props.input ? getTypeConfigurator({ pamlType: this.props.input.type, handleSave: this.handleSave, ...data }) : null;
        return (
            <Modal size="lg" show={this.state.show} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    {title}
                </Modal.Header>
                <Modal.Body>
                    Type: {type}
                    {configurator}
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        )
    }

    render() {
        // const { socket, type } = this.props;
        let name = this.props.input ? this.props.input.name : "";
        let button = () => {
            if ((this.props.input.connections.length > 0)) {
                return (<Button disabled onClick={this.handleClick}>{name}</Button>)
            } else {
                return (<Button onClick={this.handleClick}>{name}</Button>)
            }
        }
        return (
            <div>
                {button()}
                {this.getModal()}
            </div>
        )
    }
}