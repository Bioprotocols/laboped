import Rete from "rete";
import { MyNode } from "./Node";

export class LABOPComponent extends Rete.Component {
    constructor(props) {
        super(props.name)

        this.portTypes = props.portTypes;
        this.data.component = MyNode;
        this.saveProtocol = props.saveProtocol;
        this.updateProtocolComponent = props.updateProtocolComponent;
    }
    getName(node) {
        let storedName = node.data['name'];
        if (!storedName) {
            if (node.name) {
                return "<New " + node.name + ">";
            } else {
                return "<New " + node.type + ">";
            }
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

    nodeConfiguration() {
        return null;
    }

}

export class LABOPControl extends Rete.Control {
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

export class LABOPOutputControl extends LABOPControl {
    isConnected() {
        return false;
    }
}
export class LABOPInputControl extends LABOPControl {
    isConnected() {
        return this.parent.connections.length > 0;
    }
}

export class ListControl extends LABOPControl {
    constructor(props) {
        super(props);
        this.props.values = props.values;
    }
}
export class TextControl extends LABOPControl {
}