import React, { Component } from 'react';
import { Modal, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import marked from "marked";
//import ug from "USERGUIDE.md"

export default class UserGuideModal extends Component {

  state = {};

  componentDidMount() {
    const readmePath = require("../USERGUIDE.md");

    fetch(readmePath)
      .then(response => {
        return response.text()
      })
      .then(text => {
        this.setState({
          markdown: text
        })
      })
  }


  render() {

    const { markdown } = this.state;
    return (

      <Modal
        show={this.props.show}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          {/* <Modal.Title id="contained-modal-title-vcenter">
            PAMLED User Guide
          </Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          <ReactMarkdown children={markdown}  />

        </Modal.Body>
        <Modal.Footer>
          <Button className="user-guide" variant="primary" onClick={() => this.props.handleDone()}>
        Done
      </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

