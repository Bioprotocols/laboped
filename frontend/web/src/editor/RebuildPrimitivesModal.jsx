import React, { Component } from 'react';
import { Modal, Spinner, Row, Col } from 'react-bootstrap';

export default class RebuildPrimitivesModal extends Component {

  makeTitle() {
    return (
      <Row>
        <Col className="text-center">
          Rebuilding Primitives <Spinner animation="border" variant="primary" />
        </Col>
      </Row>
    )
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.makeTitle()}
          </Modal.Title>
        </Modal.Header>
      </Modal>
    );
  }
}

