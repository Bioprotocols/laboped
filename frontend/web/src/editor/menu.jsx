import React, { Component } from 'react';

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FaFileDownload } from 'react-icons/fa'
import "./menu.css"

export default class Menu extends Component {
  constructor(props){
    super(props);
    this.editor = props.editor;
    // this.handleSave = props.handleSave;
    // this.getProtocols = props.getProtocols;
    // this.setProtocol = props.setProtocol;
  }

  render() {
    return (
      <Container className="p-0 editor-navbar" fluid={true}>
        <Navbar className="h-100" bg="dark" variant="dark">
          <Container fluid={true}>
            <Navbar.Brand href="#home">PAML Editor</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse>
              <Nav className="me-auto">
                <NavDropdown menuVariant="dark" title="File">
                  <NavDropdown.Item href="#" onClick={() => this.editor.displayNewProtocol()}>New Protocol</NavDropdown.Item>
                  <NavDropdown.Item href="#" onClick={() => this.editor.saveAllProtocols()}>Save</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown menuVariant="dark" title="Tools">
                  <NavDropdown.Item href="#" onClick={() => this.editor.rebuildPrimitives()}>Rebuild Primitives</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown menuVariant="dark" title={<FaFileDownload />}>
                  <NavDropdown.Item href="#" onClick={() => this.editor.downloadCurrentGraph()}>Current Rete Graph</NavDropdown.Item>
                  <NavDropdown.Item href="#" onClick={() => this.editor.downloadCurrentProtocol()}>Current Protocol</NavDropdown.Item>
                </NavDropdown>
              </Nav>

              <Nav>
                <NavDropdown menuVariant="dark" align={{ sm: 'end' }} title="Account" id="basic-nav-dropdown">
                  <NavDropdown.Header href="#">Signed in as {this.editor.props.loginStatus.state.user.email}</NavDropdown.Header>
                  <NavDropdown.Item href="#" onClick={this.editor.props.onLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar >
      </Container>
    );
  }
}

