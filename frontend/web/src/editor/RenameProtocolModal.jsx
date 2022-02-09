import React, { Component } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

export default class RenameProtocolModal extends Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();

    this.state = {
      renameError: null
    }

    this.updateRenameError = this.updateRenameError.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
  }

  updateRenameError() {
    if (this.state.renameError == null) {
      return null
    }

    return (
      <Alert variant='danger' style={{ padding: "0.375rem 0.75rem" }}>
        {this.state.renameError}
      </Alert>
    )
  }

  onTextChange() {
    this.setState({ renameError: null })
  }

  makeTitle() {
    if (!this.props.protocol) {
      return "Rename"
    }
    return `Rename '${this.props.protocol.name}'`
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.makeTitle()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control ref={this.textInput} type="text" placeholder="Enter name protocol name" onChange={() => this.onTextChange} />
        </Modal.Body>
        <Modal.Footer>
          {this.updateRenameError()}
          <Button variant="secondary" onClick={() => this.props.handleCancel()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            let err = this.props.handleRename(this.props.protocol, this.textInput.current.value)
            this.setState({ renameError: err })
          }}>
            Rename
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

