import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import Markdown from 'marked-react';
import DOMPurify from 'dompurify';
// import { JSONEditor } from 'vanilla-jsoneditor';
// import { useEffect, useRef } from "react";
import ReactJson from 'react-json-view'



export class ProtocolDetailsGroup extends React.Component {

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
                            let rendered = (specialization.name === "DefaultBehaviorSpecialization") ?
                                (<ReactJson key={specialization.specialization_id} src={JSON.parse(spec.data)} //
                                    displayDataTypes="False" name="Steps" indentWidth="2" />) :
                                (<ProtocolInspector key={specialization.specialization_id} specialization={spec.data} />);
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
