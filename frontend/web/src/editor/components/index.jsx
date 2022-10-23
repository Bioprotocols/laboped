import Rete from "rete";
import { MyNode } from "./Node";

export class PAMLComponent extends Rete.Component {
    constructor(props) {
        super(props.name)

        this.portTypes = props.portTypes;
        this.data.component = MyNode;
        this.saveProtocol = props.saveProtocol;
        this.updateProtocolComponent = props.updateProtocolComponent;
    }

    nodeConfiguration() {
        return null;
    }

}