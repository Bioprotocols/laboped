import React from "react";
import { withRouter } from "../../utils";
import LoginStatus from '../../login/LoginStatus';
import { Container } from "react-bootstrap";
import { Gitgraph, Orientation, TemplateName } from '@gitgraph/react';
import { axios, endpoint } from "../../API";
// import { $rdf } from 'rdflib';
//const $rdf = require('rdflib');
import rdf from 'rdf-ext';
import N3Parser from 'rdf-parser-n3';
import { Readable } from 'stream';

class Executor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAuthenticated: null,
            execution: null,
            protocol: null
        };

        this.onAuthenticationChanged = this.onAuthenticationChanged.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.loginStatus = React.createRef();
        this.getProtocolExecution = this.getProtocolExecution.bind(this);

    }

    componentDidMount(props) {
        if (!this.state.execution) {
            const { state } = this.props.location;
            const { protocol } = state; // Read values passed on state
            this.setState({ protocol: protocol });

            this.getProtocolExecution(protocol)


        }

    }


    onAuthenticationChanged(isAuthenticated) {
        if (!isAuthenticated) {
            this.props.navigate("/login");
        }
        this.setState({ isAuthenticated: isAuthenticated });
    }

    onLogout() {
        this.loginStatus.current.logout();
    }

    getProtocolExecution(protocol) {
        if (false && protocol) {
            let execution =
                axios.get(
                    `${endpoint.editor.protocol}${protocol.id}/execute/`, {
                    withCredentials: true,
                    xsrfCookieName: 'csrftoken',
                    xsrfHeaderName: 'x-csrftoken',
                    headers: {
                        "Content-Type": "application/json",
                        'x-csrftoken': this.loginStatus.current.state.csrf,
                    }
                }).then(function (response) {
                    // let store = $rdf.graph()
                    let mimeType = null; //'application/rdf+xml';
                    let uri = null; //"http://bioprotocols.org/paml/";
                    let parser = new N3Parser({ factory: rdf });
                    let s = new Readable();
                    s.push(eval(response.data.data));
                    s.push(null);
                    let qstream = parser.import(s);
                    rdf.dataset().import(qstream)
                        //$rdf.parse(response.data.data, store, uri, mimeType)
                        .then(function (execution) {
                            this.setState({ execution: execution });
                            return execution;
                        }).bind(this)
                }.bind(this)).catch((error) => {
                    // failed to download
                    console.log("Could not retrieve execution:" + error)
                })
        }
    }



    renderExecutor() {
        if (this.state.isAuthenticated === null) {
            return (null);
        }


        return (
            <Gitgraph options={{
                orientation: Orientation.Horizontal
            }}>
                {(gitgraph) => {
                    if (this.state.protocol) {
                        if (this.state.execution) {
                            console.log("Updating execution ...");
                        }

                        const token1 = gitgraph.branch("token1");
                        token1.commit("[ protocol1");

                        const token2 = token1.branch("token2");
                        token2.commit("p1")

                        const token3 = token1.branch("token3");
                        token3.commit("p2")

                        token1.commit("cba1");

                        token1.merge(token3).tag("cba2");

                        // // Simulate git commands with Gitgraph API.
                        // const master = gitgraph.branch(this.state.protocol.name);
                        // master.commit("Initial commit");

                        // const develop = master.branch("develop");
                        // develop.commit("Add TypeScript");

                        // const aFeature = develop.branch("a-feature");
                        // aFeature
                        //     .commit("Make it work")
                        //     .commit("Make it right")
                        //     .commit("Make it fast");

                        // develop.merge(aFeature);
                        // develop.commit("Prepare v1");

                        // master.merge(develop).tag("v1.0.0");
                    }
                }}
            </Gitgraph>
        )
    }

    render() {
        return (
            <Container className="p-0 executor-route" fluid={true}>
                <LoginStatus ref={this.loginStatus} onAuthenticationChanged={this.onAuthenticationChanged} />
                {this.renderExecutor()}
            </Container>
        )
    }
}

export default withRouter(Executor);