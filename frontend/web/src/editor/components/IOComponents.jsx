
import React from "react";
import { Dropdown, Button, Modal, Form } from "react-bootstrap";
import Rete from "rete";

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
            socket: Object.values(props.portTypes)[0]
        }
        this.defaultType = Object.values(this.portTypes)[0].typeName;
        this.shortTypeNameOptions = Object.values(this.portTypes).map(p => p.typeName);
    }


    getDataType(node) {
        if (!node.data.type) {
            node.data.type = this.defaultType;
        }
        return node.data.type;
    }

    getLongTypeName(node) {
        let shortName = this.getDataType(node);
        return Object.keys(this.portTypes).find(key => this.portTypes[key].typeName === shortName);
    }

    getName(node) {
        let storedName = node.data['name'];
        if (!storedName) {
            return "<New " + this.type + ">";
        }
        return storedName;
    }

    async handleNameChange(props) {
        // props is the control that has the new value in scope.value
        let value = props.scope.value;
        // the key is the control's data.name value
        let key = props.getData("name")
        let node = props.setData(key, value)
        await node.update();
        this.saveProtocol();
    }

    builder(node) {
        node.saveProtocol = this.saveProtocol;
        node.nodeConfiguration = this.nodeConfiguration.bind(node);
        let shortTypeName = this.getDataType(node);
        let socket = this.portTypes[this.getLongTypeName(node)].socket;
        let io = this.getIO(node, socket);

        let nameCtrl = new TextControl({
            emitter: this.editor,
            component: MyReactControl,
            key: "name",
            name: "name",
            value: this.getName(node),
            saveProtocol: this.saveProtocol,
            onChangeCallback: this.handleNameChange.bind(this)
        });

        let typeSelectorCtrl = new ListControl({
            emitter: this.editor,
            component: ReactListControl,
            key: "type",
            name: "type",
            value: shortTypeName,
            values: this.shortTypeNameOptions,
            onChangeCallback: this.handleTypeChange.bind(this),
            saveProtocol: this.saveProtocol
        });


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
        let node = props.getNode();
        let socket = this.portTypes[this.getLongTypeName(node)].socket;
        node.outputs.get(props.key).connections.forEach((c) => c.remove());
        node.removeOutput(node.outputs.get(props.key));
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

    // async worker(node, inputs, outputs) {
    //     if (!outputs['num'])
    //         outputs['num'] = node.data.number; // here you can modify received outputs of Input node
    // }
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
        let socket = this.portTypes[this.getLongTypeName(node)].socket;
        node.inputs.get("output").connections.forEach((c) => c.remove());
        node.removeInput(node.inputs.get("output"));
        node.addInput(this.getIO(node, socket));
        await node.update();

        this.saveProtocol();
        this.updateProtocolComponent(node);
    }

    getIO(node, socket) {
        return new Rete.Input(this.nodeType, "", socket);
    }

    addIOSocket(node, io) {
        return node.addInput(io);
    }


    // async worker(node, inputs, outputs) {
    //     if (!outputs['num'])
    //         outputs['num'] = node.data.number; // here you can modify received outputs of Input node
    // }
}

export class ParameterComponent extends InputComponent {
    constructor(props) {
        super({ type: "Parameter", nodeType: "parameter", ...props });
        this.defaultName = "<New Input>";
    }

    builder(node) {
        node.nodeConfiguration = this.nodeConfiguration.bind(node);
        let shortTypeName = this.getDataType(node);
        let socket = this.portTypes[this.getLongTypeName(node)].socket;
        node.editor = this.editor;

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

        // node.data.name = (node.data.input && node.data.input.name) ? node.data.input.name : "<New Input>";
        let io = this.getIO(node, socket);
        this.addIOSocket(node, io);
        let inputControl = new PAMLInputControl({
            key: "value",
            emitter: node.editor,
            component: PAMLInputControlComponent,
            // input: io,
            name: "value",
            value: node.data.value,
            saveProtocol: this.saveProtocol,
            onChangeCallback: this.handleValueChange.bind(this)
        })
        io.addControl(inputControl);
        // node.outputs.get("input").addControl(inputControl);

        let typeSelectorCtrl = new ListControl({
            emitter: this.editor,
            component: ReactListControl,
            key: "type",
            name: "type",
            value: shortTypeName,
            values: this.shortTypeNameOptions,
            onChangeCallback: this.handleTypeChange.bind(this),
            saveProtocol: this.saveProtocol
        });

        node.addControl(typeSelectorCtrl);


        return node;
    }

    async handleValueChange(props) {
        let node = props.getNode();
        let socket = this.portTypes[this.getLongTypeName(node)].socket;
        let old_control = node.outputs.get(props.key).control;
        node.outputs.get(props.key).connections.forEach((c) => c.remove());
        node.removeOutput(node.outputs.get(props.key));
        node.addOutput(this.getIO(node, socket));
        node.outputs.get(props.key).addControl(old_control);
        await node.update();
        // this.updateProtocolComponent(node);
        this.saveProtocol();
    }
    // async handleTypeChange(props) {
    //     let node = props.parent;
    //     let socket = this.portTypes[this.getStoredFullTypeName(node)].socket;
    //     node.outputs.get("input").connections.forEach((c) => c.remove());
    //     node.removeOutput(node.outputs.get("input"));
    //     node.addOutput(this.getIO(node, socket));
    //     await node.update();
    //     // this.updateProtocolComponent(node);
    //     this.saveProtocol();
    // }

    // async handleNameChange(props) {
    //     let node = props.parent.props.input.node;
    //     // Update Name of input pin
    //     node.data.name = node.data.input.name;

    //     let socket = this.portTypes[this.getStoredFullTypeName(node)].socket;
    //     let old_control = node.outputs.get("input").control;
    //     node.removeOutput(node.outputs.get("input"));
    //     let io = this.getIO(node, socket);
    //     this.addIOSocket(node, io);
    //     // Make sure that io has a reference to node
    //     // node.outputs.get("input").addControl(new PAMLInputControl(node.editor, io, this.saveProtocol));
    //     node.outputs.get("input").addControl(old_control);

    //     //await this.addOutput(node, io);
    //     await node.update();
    //     this.saveProtocol();
    // }

    getIO(node, socket) {
        let input = new PAMLInputPin({
            key: "value",
            title: this.defaultName,
            socket: socket,
            type: this.getLongTypeName(node),
            saveProtocol: this.saveProtocol,
            onChange: this.handleValueChange.bind(this)
        });
        return input;
    }

    nodeConfiguration(props) {
        return (
            <Form.Control
                type="text"
                placeholder="Parameter Name:"
                // style={{ height: '100px' }}
                value={this.data.input && this.data.input.name ? this.data.input.name : ""}
                onChange={(e) => {
                    // this.data.name = e.target.value
                    // props.parent.setState(
                    //     { data: { name: e.target.value } },
                    //     () => );
                    props.parent.handleSave({ name: e.target.value })
                    props.parent.props.input.onChange(props)

                }
                }>

            </Form.Control >
        );
    }
}


/*
*
*  Rete Controls
*
*/

export class PAMLControl extends Rete.Control {
    constructor(props) {
        super(props.key);
        this.key = props.key;
        this.render = "react";
        this.component = props.component;
        this.emitter = props.emitter;
        this.saveProtocol = props.saveProtocol;
        this.onChangeCallback = props.onChangeCallback;

        // this.data.name = props.name;

        this.props = {
            // input: props.input, // Used if attached to an IO socket
            value: props.value, // Used if attached to an HTML Element.
            control: this,
            onChange: (e) => this.onChange(e),
            onMount: () => this.onMount()
        };
        this.scope = {
            // input: props.input,
            value: props.value,
            // readonly,
            // change: this.change.bind(this),
            // update: this.doUpdate.bind(this)
        };
    }
    onChange(value) {
        this.setValue(value);
        this.putData(this.key, this.scope.value);
        if (this.onChangeCallback)
            this.onChangeCallback(this);
        this.saveProtocol();
    }

    onMount() {
        this.setValue(this.getData(this.key));
    }

    setValue(val) {
        this.scope.value = val;
        this.props.value = val;
    }
}


export class PAMLInputControl extends PAMLControl {
    isConnected() {
        return this.parent.connections.length > 0;
    }
    // constructor(emitter, name, component, saveProtocol) {
    //     super(props.name);
    //     this.render = "react";
    //     this.component = PAMLInputControlComponent
    //     this.emitter = props.emitter;
    //     this.saveProtocol = props.saveProtocol;

    //     this.props = {
    //         input: input,
    //         onChange: (e) => this.change(e),
    //         onMount: () => this.mounted()
    //     };
    //     this.scope = {
    //         input: input,
    //         // readonly,
    //         change: this.change.bind(this),
    //         update: this.doUpdate.bind(this)
    //     };
    // }
    // onChange() { }

    // change(e) {
    //     this.setValue(e);
    //     this.doUpdate();
    //     this.onChange();
    // }
    // doUpdate() {
    //     if (this.scope.input) {
    //         this.putData(this.scope.input.key, this.scope.input.node.data[this.scope.input.key]);
    //     }
    // }
    // mounted() {
    //     // if (this.scope.input) {
    //     // this.putData(this.scope.input.key, this.scope.input.node.data[this.scope.input.key]);
    //     //this.setValue(this.getData(this.scope.input.key));
    //     this.doUpdate();
    //     // }
    // }

    // setValue(val) {
    //     if (this.scope.input) {
    //         let priorData = this.getData(this.scope.input.key);
    //         if (priorData) {
    //             let newData = { ...priorData, ...val }
    //             this.putData(this.scope.input.key, newData);
    //         } else {
    //             this.putData(this.scope.input.key, val);
    //         }
    //     }
    //     // this.scope.value = val;
    //     // this.props.value = val;
    // }
}

export class ListControl extends PAMLControl {

    constructor(props) {
        super(props);

        // this.props.keyName = props.name;
        // this.props.value = props.value;
        this.props.values = props.values;
        // this.key = props.key;
        // this.type = "text";
        // this.onChangeCallback = onChangeCallback;
        // this.scope.value = props.value;
    }
    //     constructor(emitter, key, value, values, onChangeCallback) {
    //         super(key);
    //         this.render = "react";
    //         this.component = ReactListControl;
    //         this.props = {
    //             // emitter,
    //             keyName: key,
    //             value: value,
    //             values: values,
    //             onChange: (e) => this.change(e),
    //             onMount: () => this.mounted(),
    //             //parentOnChange: (e) => onChangeCallback(e)
    //             // putData: () => this.putData.apply(this, arguments),
    //             // getData: () => this.getData.apply(this, arguments)
    //         };
    //         this.emitter = emitter;
    //         this.key = key;
    //         this.type = "text";
    //         this.onChangeCallback = onChangeCallback;
    //         // // this.template = `<input type="${type}" :readonly="readonly" :value="value" @input="change($event)"/>`;

    //         this.scope = {
    //             value: value,
    //             // readonly,
    //             change: this.change.bind(this),
    //             update: this.doUpdate.bind(this)
    //         };
    //     }
    // onChange() {
    //     if (this.onChangeCallback)
    //         this.onChangeCallback(this);
    // }

    // doUpdate() {
    //     if (this.key) this.putData(this.key, this.scope.value);
    // }

    // mounted() {
    //     this.putData(this.key, this.scope.value);
    //     this.setValue(this.getData(this.key));
    //     this.doUpdate();
    // }

    // setValue(val) {
    //     this.scope.value = val;
    //     this.props.value = val;
    // }
}

export class TextControl extends PAMLControl {
    constructor(props) {
        super(props);
        // this.props.key = props.key;
        // this.key = props.key;
        // this.props.value = props.value;
        // this.type = "text";
        // this.scope.value = props.value;
    }
    // constructor(emitter, key, value = null, type = "text") {
    //     super(key);
    //     this.render = "react";
    //     this.component = MyReactControl;

    //     this.props = {
    //         // emitter,
    //         key: key,
    //         value: value,
    //         // putData: () => this.putData.apply(this, arguments),
    //         onChange: (e) => this.change(e),
    //         onMount: () => this.mounted()
    //     };

    //     this.emitter = emitter;
    //     this.key = key;
    //     this.type = type;
    //     // // this.template = `<input type="${type}" :readonly="readonly" :value="value" @input="change($event)"/>`;

    //     this.scope = {
    //         value: value,
    //         // readonly,
    //         change: this.change.bind(this),
    //         update: this.doUpdate.bind(this)
    //     };
    // }

    // async onChange() {
    //     await this.update();
    // }

    // change(e) {
    //     this.setValue(this.type === "number" ? +e.target.value : e.target.value);
    //     this.doUpdate();
    //     this.onChange();
    // }

    // doUpdate() {
    //     if (this.key) this.putData(this.key, this.scope.value);
    //     // this.emitter.trigger("process");
    // }

    // mounted() {
    //     this.putData(this.key, this.scope.value);
    //     this.setValue(this.getData(this.key) || (this.type === "number" ? 0 : "..."));
    //     this.doUpdate();
    // }

    // setValue(val) {
    //     this.scope.value = val;
    //     this.props.value = val;
    // }
}

export class PAMLInputPin extends Rete.Input {
    constructor(props) {
        super(props.key, props.title, props.socket, true  /* multcons */);
        this.type = props.type;
        this.saveProtocol = props.saveProtocol;
        this.onChange = props.onChange;
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

export class MyReactControl extends React.Component {

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
        this.props.onChange(event.target.value);
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

export class ReactListControl extends React.Component {

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
                    {this.props.control.key}: {this.props.value}
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
        this.setState({
            data: this.props.control.data
        });
    }
    handleClick = () => {
        console.log("Clicked! " + this.props.control.getData("name"));
        this.setState({ show: true })
    }
    handleClose = () => {
        console.log("Clicked! " + this.props.control.getData("name"));
        // console.log("Clicked! " + this.props.io.node.name + " " + this.props.io.name);
        this.setState({ show: false })
    }

    handleSave = (props) => {
        //this.socket.data = { ...this.socket.data, ...props };
        this.props.onChange(props)
        this.setState({ data: props }, () => {
            this.props.control.saveProtocol();
        });
    }

    getModal = () => {

        // let title = (this.props.input && this.props.input.node) ? (<Modal.Title>{this.props.input.node.name}.{this.props.input.name}</Modal.Title>) : (<Modal.Title></Modal.Title>);
        // let type = this.props.input ? this.props.input.type : "";
        // let data = (this.props.input && this.props.input.control && this.props.input.control.node && this.props.input.name in this.props.input.control.getNode().data) ? this.props.input.control.getData(this.props.input.name) : {}
        // let configurator = this.props.input ? getTypeConfigurator({ pamlType: this.props.input.type, handleSave: this.handleSave, ...data }) : null;
        // let nodeConfig = (this.props.input.node && this.props.input.node.nodeConfiguration) ? this.props.input.node.nodeConfiguration({ parent: this, ...data }) : null;


        let node_data = this.props.control.getData(this.props.control.key);
        let title = this.props.control.getNode().name + "." + (node_data && node_data.name ? node_data.name : this.props.control.key);
        let type = this.props.control.parent.type; // type of the control's IO
        let configurator = getTypeConfigurator({
            pamlType: type,
            handleSave: this.handleSave,
            ...node_data
        });

        return (
            <Modal size="lg" show={this.state.show} onHide={this.handleClose} >
                <Modal.Header closeButton>
                    {title}
                </Modal.Header>
                <Modal.Body>
                    {/* {nodeConfig} */}
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
        let name = this.props.control.key;
        let button = () => {
            if ((this.props.control.isConnected())) {
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