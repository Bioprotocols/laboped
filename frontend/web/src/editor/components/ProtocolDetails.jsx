import React from 'react';
import { Tabs, Tab, Modal, Button} from 'react-bootstrap';
import Markdown from 'marked-react';
import DOMPurify from 'dompurify';
// import { JSONEditor } from 'vanilla-jsoneditor';
// import { useEffect, useRef } from "react";
import ReactJson from 'react-json-view'

import { Graphviz } from 'graphviz-react';

export class ProtocolDetailsGroup extends React.Component {
    state = { show: false };
    handleClick = () => {
        this.setState({ show: true })
    }
    handleClose = () => {
        this.setState({ show: false })
    }

    render() {
        let specializations = this.props.editor.state.specializations;

        let currentProtocol = this.props.editor.getCurrentProtocol();
        // console.log(currentProtocol ? currentProtocol.graph : "");

        let emptyDetail = currentProtocol ? (
            <Tab title="Detail" key="detail" eventKey="detail">
                <ReactJson key="detail" displayDataTypes="False" name="Steps" indentWidth="2"
                    src={currentProtocol.graph} />
            </Tab>
        ) : null;

        let specializationTabs = Object.entries(specializations).map(
            ([_, specialization], i) => {
                let rendered = (protocol, specialization) => {
                    if (protocol) {
                        let spec = protocol.specializations.find((s) => (s && s.specialization_id === specialization.id));
                        if (spec && spec.data) {
                            let rendered = null;
                            if (specialization.name === "DefaultBehaviorSpecialization") {

                                let protocol_data = JSON.parse(spec.data);
                                let steps = protocol_data.slice(0, -1);
                                let gviz = protocol_data.slice(-1)[0];
                                rendered = (
                                    <div>
                                        <Modal size="lg" show={this.state.show} onHide={this.handleClose} >
                <Modal.Header closeButton>
                    Protocol Execution (Graphviz)
                </Modal.Header>
                                            <Modal.Body >
                                                <div style={{ flex: "auto", overflowX: "scroll", overflowY: "scroll"}}>
                                                <Graphviz dot={gviz} options={
                                                    {
                                                        // fit: true,
                                                        height: 750,
                                                        width: 1500,
                                                        zoom: true
                                                    }} />
                                                    </div>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
                                    <Button onClick={this.handleClick}>View Execution Graph</Button>
                                    <ReactJson
                                        key={specialization.specialization_id}
                                        src={steps}
                                            displayDataTypes="False" name="Steps" indentWidth="2" />
                                    </div>
                                );
                            } else {
                                rendered = (
                                    <ProtocolInspector
                                        key={specialization.specialization_id}
                                        specialization={spec.data} />
                                );
                            }
                            return rendered;
                        }
                    }
                    return null;
                }
                return (
                    <Tab title={specialization.name} key={specialization.id} eventKey={specialization.id}>
                        {rendered(currentProtocol, specialization)}
                    </Tab>
                )
            })

        return (
            <Tabs defaultActiveKey="detail" onSelect={(i) => (i !== "detail" ? this.props.editor.getProtocolSpecialization(currentProtocol.name, parseInt(i)) : null)}>
                {emptyDetail}
                {specializationTabs}
            </Tabs>
        )
    };
}

function ProtocolInspector(props) {
    return (
        <div>
            <pre>
                <Markdown value={DOMPurify.sanitize(props.specialization)} />
            </pre>
        </div>
    );

};
