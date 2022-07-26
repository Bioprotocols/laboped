import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Node, Socket, Control } from "rete-react-render-plugin";



class TypeConfigurator extends React.Component {
  constructor(props) {
    super(props)
    this.pamlType = props.pamlType;
    this.handleSave = props.handleSave;
    this.state = {
      unitType: null,
      unit: null
    }
  }

  render() {
    return (
      <Button>Hi</Button>
      // <div></div>
    );
  }
}

class MeasureConfigurator extends TypeConfigurator {
  constructor(props) {
    super(props)
    // this.state = {
    //   unit: null,
    //   unitType: null,
    //   value: null
    // }
    this.handleSave = props.handleSave;
    this.measureGroup = {
      "volume": ["liters", "milliliters", "microliters"],
      "mass": ["kilograms", "grams", "milligrams", "micrograms"],
      "time": ["hours", "minutes", "seconds"]
    }
  }

  componentDidMount() {
    this.setState({ unit: this.props.unit, unitType: this.props.unitType, value: this.props.value });
  }

  componentWillUnmount() {
    this.handleSubmit()
  }

  selectUnitType = (e) => {
    this.setState({ unitType: e.target.id })
  }

  selectUnit = (e) => {
    this.setState({ unit: e.target.id })
  }
  selectValue = (e) => {
    this.setState({ value: e.target.value })
  }

  handleSubmit = (e) => {
    if (e) {
      let value = e.target[0].value;
      let unit = Object.values(e.target).find((value) => (value.checked && value.name === "unit"));
      let unitType = Object.values(e.target).find((value) => (value.checked && value.name === "unitType"));
      let unitTypeId = unitType ? unitType.id : null;
      let unitId = unit ? unit.id : null;
      this.handleSave({ value: value, unit: unitId, unitType: unitTypeId });
    }
    return e;
  }

  // changeRadio = (e) => {
  //   setChecked(() => {
  //     let sibling_id = e.target.name;
  //     let siblings = (sibling_id === "unitType") ? Object.keys(this.measureGroup) : this.measureGroup[this.props.unitType]
  //     return siblings.map((s) => {
  //       apple: false,
  //       orange: false,
  //       [e.target.value]: true
  //     };
  //   });
  // };


  render() {


    let measures = (<Form.Group className="mb-3" controlId="formBasicUnits" >
      <div>
        {
          Object.keys(this.measureGroup).map((elt) => (
            <Form.Check name="unitType" type={'radio'} key={elt} id={elt} label={elt} checked={this.state.unitType === elt}
              onChange={this.selectUnitType}
            />
          ))
        }
      </div>
    </Form.Group>)



    let subgroups = (
      <div>
        {
          Object.entries(this.measureGroup).map(([measure, units], i) => {
            if (this.state.unitType === measure) {
              return (<Form.Group className="mb-3" controlId={measure}>
                <div>
                  {
                    units.map((elt) => (
                      <Form.Check name="unit" type={'radio'} id={elt} label={elt}
                        checked={this.state.unit === elt} onClick={this.selectUnit}

                      // checked={this.props.unit === elt} onChange={(e) => (e.target.id == elt)}
                      />
                    ))
                  }
                </div>
              </Form.Group>)
            }
          })
        }
      </div>
    )

    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Form.Group className="mb-3" controlId="formBasicValue">
            <Form.Label>Value</Form.Label>
            <Form.Control type="value" placeholder="Enter value" value={this.state.value} onChange={this.selectValue} />
            <Form.Text className="text-muted">
              Provide a scalar value.
            </Form.Text>
          </Form.Group>
        </Row>

        <Row>
          <Col>
            {measures}
          </Col>
          <Col>
            {subgroups}
          </Col>
        </Row>
        <Button variant="primary" type="submit">Save</Button>
      </Form>
    );
  }
}

let typeConfigurators = {
  "http://bioprotocols.org/uml#ValueSpecification": TypeConfigurator,
  "http://www.ontology-of-units-of-measure.org/resource/om-2/Measure": MeasureConfigurator,
  "http://bioprotocols.org/paml#SampleCollection": TypeConfigurator,
  "http://sbols.org/v3#Component": TypeConfigurator,
  "http://bioprotocols.org/paml#SampleArray": TypeConfigurator,
  "http://bioprotocols.org/paml#SampleData": TypeConfigurator,
  "http://www.w3.org/2001/XMLSchema#anyURI": TypeConfigurator,
  "http://www.w3.org/2001/XMLSchema#integer": TypeConfigurator,
  "http://www.w3.org/2001/XMLSchema#double": TypeConfigurator,
  "http://sbols.org/v3#Identified": TypeConfigurator,
  "http://bioprotocols.org/paml#ContainerSpec": TypeConfigurator
}

let getTypeConfigurator = (props) => {
  if (props.pamlType in typeConfigurators) {
    let tc = typeConfigurators[props.pamlType];

    let tcObj = React.createElement(tc, props);
    return tcObj;
  } else {
    // return new TypeConfigurator();
    return null;
  }
}

export class PAMLInputControlComponent extends React.Component {
  state = { show: false };

  componentDidMount() {
    this.props.onMount();
    // this.setState({
    //   value: this.props.value
    // });
  }
  handleClick = () => {
    console.log("Clicked! " + this.props.input.name);
    this.setState({ show: true })
  }
  handleClose = () => {
    console.log("Clicked! " + this.props.input.name);
    // console.log("Clicked! " + this.props.io.node.name + " " + this.props.io.name);
    this.setState({ show: false })
  }

  handleSave = (props) => {
    //this.socket.data = { ...this.socket.data, ...props };
    this.props.onChange(props)
    // this.setState({ data: props });
    try {
      this.props.input.node.saveProtocol();
    } catch (error) {
      console.log("Error Saving Protocol in PAMLInputControl.doUpdate()");
    }
    //Object.entries(props).forEach((k, v) => this.props.io.control.putData(k, v));

    //this.props.io.control.putData(this.props.io.name, props);
    //this.props.io.control.setData(props);
    // this.socket.change(props);
  }

  getModal = () => {

    let title = this.props.input ? (<Modal.Title>{this.props.input.node.name}.{this.props.input.name}</Modal.Title>) : (<Modal.Title></Modal.Title>);
    let type = this.props.input ? this.props.input.type : "";
    let data = (this.props.input && this.props.input.control && this.props.input.name in this.props.input.control.getNode().data) ? this.props.input.control.getData(this.props.input.name) : {}
    let configurator = this.props.input ? getTypeConfigurator({ pamlType: this.props.input.type, handleSave: this.handleSave, ...data }) : null;
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          {title}
        </Modal.Header>
        <Modal.Body>
          Type: {type}
          {configurator}
        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
    )
  }

  render() {
    // const { socket, type } = this.props;
    let name = this.props.input ? this.props.input.name : "";
    return (
      <div>
        <Button onClick={this.handleClick}>{name}</Button>
        {this.getModal()}
      </div>
      // <div
      //   className={`socket ${type} ${kebab(socket.name)}`}
      //   title={socket.name}
      //   ref={el => this.createRef(el)} // force update for new IO with a same key
      //   onDoubleClick={this.handleClick}
      // >
      //   {
      //     this.getModal()
      //   }
      // </div >
    )
  }
}

export class MyNode extends Node {

  render() {
    const { node, bindSocket, bindControl } = this.props;
    const { outputs, controls, inputs, selected } = this.state;

    var start = inputs.find(element => element.key === "Start");
    var end = outputs.find(element => element.key === "End");

    var startElt;
    if (start) {
      startElt = (<div className="input" key={start.key}>
        <Socket
          type="input"
          socket={start.socket}
          io={start}
          innerRef={bindSocket}
        />
        {!start.showControl() && (
          <div className="input-title">{start.name}</div>
        )}
        {start.showControl() && (
          <Control
            className="input-control"
            control={start.control}
            innerRef={bindControl}
          />
        )}
      </div>)
    }
    var endElt;
    if (end) {
      endElt = (<div className="output" key={end.key}>
        <div className="output-title">{end.name}</div>
        <Socket
          type="output"
          socket={end.socket}
          io={end}
          innerRef={bindSocket}
        />
      </div>)
    }

    return (
      <div
        className={`node ${selected}`}
        name={this.props.node.name}
        ismodule={`${"isModule" in node.data && node.data["isModule"]}`}
      >
        <div className="title">{node.name}</div>
        {/* Start */}
        {startElt}
        {/* End */}
        {endElt}
        {/* Outputs */}
        {outputs.map(output => {
          if (output.key !== "End") {
            return (
              <div className="output" key={output.key}>
                <div className="output-title">{output.name}</div>
                <Socket
                  type="output"
                  socket={output.socket}
                  io={output}
                  innerRef={bindSocket}
                />
              </div>
            )
          } else {
            return null;
          }
        })}
        {/* Controls */}
        {controls.map(control => (
          // <div className="control-title">{control.key}
          <Control
            className="control"
            key={control.key}
            control={control}
            innerRef={bindControl}
          />
          // </div>
        ))}
        {/* Inputs */}
        {inputs.map(input => {
          if (input.key !== "Start") {
            return (
              <div className="input" key={input.key}>
                <Socket
                  type="input"
                  socket={input.socket}
                  io={input}
                  innerRef={bindSocket}
                />
                {!input.showControl() && (
                  <div className="input-title">{input.name}</div>
                )}
                {input.showControl() && (
                  <Control
                    className="input-control"
                    control={input.control}
                    innerRef={bindControl}
                  />
                )}
              </div>
            )
          } else {
            return null;
          }
        })}
      </div>
    );
  }
}
