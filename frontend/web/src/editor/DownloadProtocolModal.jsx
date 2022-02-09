import React, { Component } from 'react';
import { Modal, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';

export default class DownloadProtocolModal extends Component {

  updateBody() {
    if (!this.props.download) {
      return null
    }

    if (this.props.download.error) {
      return (
        <Alert variant='danger' style={{ padding: "0.375rem 0.75rem" }}>
          {this.props.download.error}
        </Alert>
      )
    }

    if (this.props.download.done) {
      return "Success"
    }

    return (
      <Row>
        <Col className="text-center">
          <Spinner animation="border" variant="primary" />
        </Col>
      </Row>
    )
  }

  makeTitle() {
    if (!this.props.download) {
      return "Downloading"
    }
    return `Downloading '${this.props.download.name}'`
  }

  makeDoneButton() {
    if (!this.props.download || this.props.download.error) {
      return null
    }

    let disabled = !this.props.download || !this.props.download.done || this.props.download.error
    let className = disabled ? "disabled" : null
    return (
      <Button aria-disabled={disabled} className={className} variant="primary" onClick={() => this.props.handleDone()}>
        Done
      </Button>
    )
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
          {this.updateBody()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => this.props.handleCancel()}>
            Cancel
          </Button>
          {this.makeDoneButton()}
        </Modal.Footer>
      </Modal>
    );
  }
}

