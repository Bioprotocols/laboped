import React, { Component } from 'react';
// import { Tab } from 'react-bootstrap';

export class ProtocolInspector extends Component {
  constructor(props){
      super(props)
      this.protocol = props.protocol;
  }

  render() {
    // var nodes = this.protocol.graph.nodes;
    // var nodeTabs = Object.keys(nodes).map((n) => {
    //   var content = JSON.stringify(this.protocol.graph.nodes[n], null, 2);
    //   return (<Tab eventKey={n} title={n}>
    //             <div><pre>{content}</pre></div>
    //           </Tab>);
    // });
    return (
        // <Tabs className="mb-3" >
        //       <Navbar.Brand>Steps</Navbar.Brand>
        //       {nodeTabs}
        // </Tabs>
        <div><pre>{JSON.stringify(this.protocol.graph, null, 2)}</pre></div>
      );
  }
}

