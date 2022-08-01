import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

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
};

export function getTypeConfigurator(props) {
    if (props.pamlType in typeConfigurators) {
        let tc = typeConfigurators[props.pamlType];

        let tcObj = React.createElement(tc, props);
        return tcObj;
    } else {
        // return new TypeConfigurator();
        return null;
    }
}