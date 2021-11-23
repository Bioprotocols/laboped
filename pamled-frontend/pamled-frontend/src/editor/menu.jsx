import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

export class Menu extends Component {
  render() {
    return (
      <Tabs activeKey="home">
        <Tab eventKey="home" title="Home">
        </Tab>
      </Tabs>
  );
  }
}

