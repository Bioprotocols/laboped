
import React from "react";
import { Dropdown, Button, Modal, Form } from "react-bootstrap";
import Rete from "rete";

import { getTypeConfigurator } from "./IOConfiguration";
import { LABOPComponent } from ".";
import { TextControl, ListControl, LABOPOutputControl } from ".";
/*
*
*  Rete Components
*
*/

export class IOComponent extends LABOPComponent {
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
        node.outputs.forEach((o) => o.connections.forEach((c) => c.remove()));
        node.outputs.forEach((o) => node.removeOutput(o));
        let io = this.getIO(node, socket)
        node.addOutput(io);
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



    getIO(node, socket) {
        let output = new LABOPOutputPin({
            key: "value",
            title: this.defaultName,
            socket: socket,
            type: this.getLongTypeName(node),
            saveProtocol: this.saveProtocol,
            onChange: this.handleValueChange.bind(this)
        });
        let outputControl = new LABOPOutputControl({
            key: "value",
            emitter: node.editor,
            component: LABOPInputControlComponent,
            // input: io,
            name: "value",
            value: node.data.value,
            saveProtocol: this.saveProtocol,
            onChangeCallback: this.handleValueChange.bind(this)
        })
        output.addControl(outputControl);
        return output;
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



export class LABOPInputPin extends Rete.Input {
    constructor(props) {
        super(props.key, props.title, props.socket, true  /* multcons */);
        this.type = props.type;
        this.saveProtocol = props.saveProtocol;
        this.onChange = props.onChange;
    }
}

export class LABOPOutputPin extends Rete.Output {
    constructor(props) {
        super(props.key, props.title, props.socket, true  /* multcons */);
        this.type = props.type;
        this.saveProtocol = props.saveProtocol;
        this.onChange = props.onChange;
        this.control = null;
        this.controlVisible = true;
    }

    addControl(control) {
        this.control = control;
        control.parent = this;
    }
    showControl() {
        return this.controlVisible;
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

export class LABOPInputControlComponent extends React.Component {
    state = { show: false };

    componentDidMount() {
        this.props.onMount();
        this.setState({
            data: this.props.control.data
        });
    }
    handleClick = () => {
        // console.log("Clicked! " + this.props.control.parent.name);
        this.setState({ show: true })
    }
    handleClose = () => {
        // console.log("Clicked! " + this.props.control.parent.name);
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
        // let configurator = this.props.input ? getTypeConfigurator({ labopType: this.props.input.type, handleSave: this.handleSave, ...data }) : null;
        // let nodeConfig = (this.props.input.node && this.props.input.node.nodeConfiguration) ? this.props.input.node.nodeConfiguration({ parent: this, ...data }) : null;


        let node_data = this.props.control.getData(this.props.control.key);
        let title = this.props.control.getNode().name + "." + (node_data && node_data.name ? node_data.name : this.props.control.key);
        let type = this.props.control.parent.type; // type of the control's IO
        let configurator = getTypeConfigurator({
            type: type,
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