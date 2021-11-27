import React, { Component } from 'react';

// import { Tabs, Tab } from 'react-bootstrap';

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import NavDropdown from 'react-bootstrap/NavDropdown';

export default class Menu extends Component {
  constructor(props){
    super(props);
    this.handleSave = props.handleSave;
    this.handleNewProtocol = props.handleNewProtocol;
  }

  render() {
    return (
      <Navbar variant="tabs" defaultActiveKey="/home" bg="dark" variant="dark" >
        <Container>
        <Navbar.Brand href="#home">PAML Editor</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
      <NavDropdown title="File" id="basic-nav-dropdown">
          <NavDropdown.Item href="#" onClick={this.handleNewProtocol}>New Protocol</NavDropdown.Item>
          <NavDropdown.Item href="#" onClick={this.handleSave}>Save</NavDropdown.Item>
        </NavDropdown>        
      </Nav>
    </Navbar.Collapse>
        </Container>
      </Navbar >
    );
  }
}

