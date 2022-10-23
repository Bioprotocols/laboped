import React from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import Spreadsheet from "react-spreadsheet";


class TypeConfigurator extends React.Component {
    constructor(props) {
        super(props)
        this.pamlType = props.pamlType;
        this.handleSave = props.handleSave;
        this.state = {
        };
        this.instructions = "";
    }

    render() {
        return (
            // <Button></Button>
            <div></div>
        );
    }
}


class TabularConfigurator extends TypeConfigurator {
    constructor(props) {
        super(props)
        this.state = {
            data: this.emptyArray()
        }

        this.style = {
            overflowY: 'scroll',
            overflowX: 'scroll',
            border: '1px solid',
            width: '100%',
            float: 'left',
            height: '500px',
            position: 'relative'
        }
    };

    emptyArray = () => ([])

    componentDidMount() {
        // If this.props.data is undefined, then use an empty table
        if (!this.props.data || this.props.data.length === 0) {
            this.setState({ data: this.emptyArray() })
        } else {
            this.setState({ data: this.props.data });
        }
    }

    setData = (data) => {
        this.setState({ data: data }, () => this.handleSave({ data: data }));
    }

    render() {

        return (
            <div style={this.style}>
                <p>{this.instructions}</p>
                <Spreadsheet data={this.state.data} onChange={this.setData} />
            </div>
        )
    }
}

class SampleDataConfigurator extends TabularConfigurator {
    constructor(props) {
        super(props)
        // this.state = {
        //     data: [
        //         [{ value: "Source Plate Name" },
        //         { value: "Source plate type" },
        //         { value: "Source Well" },
        //         { value: "Destination Plate Name" },
        //         { value: "Destination Well" },
        //         { value: "Transfer Volume" },
        //         { value: "Part name" }
        //         ],
        //         [],
        //         []]
        // }
        this.instructions = "SampleData";
    }

    emptyArray = () => {
        return [
            [
                { value: "Source" },
                { value: "Destination" },
                { value: "Volume" }
            ].concat([...new Array(7)].map(() => ({ value: "" }))),
            ...[...new Array(500)].map(() => ([]))
            //
        ];
    }
}

class SampleCollectionConfigurator extends TabularConfigurator {
    constructor(props) {
        super(props)
        this.instructions = "Column A is an aliquot id, and Columns B, C, ... are the quantity of the material in Row 1";
    }

    emptyArray = () => {
        return [
            [{ value: "Aliquot" }].concat([...new Array(9)].map(() => ({ value: "" }))),
            ...[...new Array(500)].map(() => ([]))
            //
        ];
    }
}


class SampleArrayConfigurator extends SampleCollectionConfigurator {
}

class ContainerSpecConfigurator extends TypeConfigurator {
    constructor(props) {
        super(props)
        this.containerGroup = {
            "vessel": ["tube", "flask", "dish"],
            "microplate": [6, 12, 24, 48, 96, 384, 1536],

        }
    }

    componentDidMount() {
        this.setState({
            container: this.props.container,
            containerType: this.props.containerType,
            containerName: this.props.containerName
        });
    }

    // componentWillUnmount() {
    //     this.handleSubmit()
    // }

    selectConatinerType = (e) => {
        this.setState({ containerType: e.target.id }, () => this.handleSave(this.state));
    }

    selectContainer = (e) => {
        this.setState({ container: e.target.id }, () => this.handleSave(this.state));
    }

    selectContainerName = (e) => {
        this.setState({ containerName: e.target.value }, () => this.handleSave(this.state));
    }

    // handleSubmit = (e) => {
    //     if (e) {
    //         let container = Object.values(e.target).find((value) => (value.checked && value.name === "container"));
    //         let containerType = Object.values(e.target).find((value) => (value.checked && value.name === "containerType"));
    //         let containerTypeId = containerType ? containerType.id : null;
    //         let containerId = container ? container.id : null;
    //         this.handleSave({ container: containerId, containerType: containerTypeId });
    //     }
    //     return e;
    // }

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


        let containerTypes = (<Form.Group className="mb-3" controlId="formBasicUnits" >
            <div>
                {
                    Object.keys(this.containerGroup).map((elt) => (
                        <Form.Check name="containerType" type={'radio'} key={elt} id={elt} label={elt} checked={this.state.containerType === elt}
                            onChange={this.selectContainerType}
                        />
                    ))
                }
            </div>
        </Form.Group>)

        let nameConfig = (
            <Form.Group className="mb-3" controlId="formBasicValue">
                <Form.Label>Name</Form.Label>
                <Form.Control type="value" placeholder="Enter Container Name" value={this.state.containerName} id="name" onChange={this.selectContainerName} />
                {/* <Form.Text className="text-muted">
                    Provide a Container Name.
                </Form.Text> */}
            </Form.Group>
        )

        let subgroups = (
            <div>
                {
                    Object.entries(this.containerGroup).map(([containerType, containers], i) => {
                        if (this.state.containerType === containerType) {
                            return (<Form.Group className="mb-3" controlId={containerType}>
                                <div>
                                    {
                                        containers.map((elt) => (


                                            <Form.Check name="unit" type={'radio'} id={elt} label={elt}
                                                checked={this.state.container === elt} onClick={this.selectContainer}
                                            />

                                        ))
                                    }
                                </div>
                            </Form.Group>)
                        }
                        return null;
                    })
                }
            </div>
        )

        return (
            // <Form onSubmit={this.handleSubmit}>
            <div>
                <Row>
                    <Col>
                        {nameConfig}
                        {containerTypes}
                    </Col>
                    <Col>
                        {subgroups}
                    </Col>
                </Row>
                {/* <Button variant="primary" type="submit">Save</Button> */}
            </div>
            // </Form>
        );
    }
}

class MeasureConfigurator extends TypeConfigurator {
    constructor(props) {
        super(props)
        this.measureGroup = {
            "volume": ["liter", "milliliter", "microliter"],
            "mass": ["kilogram", "gram", "milligram", "microgram"],
            "time": ["hour", "minute", "second"],
            "temperature": ["degree_Celsius"]
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
                        return null;
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

class SubtypeConfigurator extends TypeConfigurator {
    constructor(props) {
        super(props)
        this.subTypes = {}

        this.state = {
            subType: null,
        }
    }

    componentDidMount() {
        this.setState({ subType: this.props.subType });
    }

    selectSubType = (e) => {
        this.setState({ subType: e.target.value }, () => this.handleSave(this.state));
    }

    render() {
        if (this.state.subType) {
            let subTypes = (<Form.Select className="mb-3" controlId="subTypes" value={this.state.subType} onChange={this.selectSubType}>
                {<option value={undefined}></option>}
                {Object.keys(this.subTypes).map((elt) => {
                    if (this.state.subType === elt) {
                        return (<option value={elt} selected>{elt}</option>);
                    } else {
                        return (<option key={elt} value={elt}>{elt}</option>);
                    }
                })}

            </Form.Select>)

            let subgroups = (
                <div>
                    {
                        Object.entries(this.subTypes).map(([subTypeStr, configurator], i) => {
                            if (this.state.subType === subTypeStr) {
                                return (<Form.Group className="mb-3" controlId={subTypeStr}>
                                    <div>
                                        {
                                            React.createElement(configurator, this.props)

                                        }
                                    </div>
                                </Form.Group>)
                            }
                            return null;
                        })
                    }
                </div>
            )

            return (
                <Form onSubmit={this.handleSubmit}>
                    <Row>
                        {subTypes}
                    </Row>
                    <Row>
                        {subgroups}
                    </Row>
                    {/* <Button variant="primary" type="submit">Save</Button> */}
                </Form>
            );
        } else {
            return null;
        }
    }
}

class IdentifiedConfigurator extends SubtypeConfigurator {
    constructor(props) {
        super(props)
        this.subTypes = {
            "Container Specification": ContainerSpecConfigurator,
            "Component": TypeConfigurator
        }
    }
}

class ValueSpecificationConfigurator extends SubtypeConfigurator {
    constructor(props) {
        super(props)
        this.subTypes = {
            "Aliquots": AliquotConfigurator
        }
    }
}

class AliquotConfigurator extends TypeConfigurator {
    constructor(props) {
        super(props)
        this.state = {
            rectangleList: ""
        }
    }

    componentDidMount() {
        this.setState({ rectangleList: this.props.rectangleList });
    }

    render() {
        return (
            <Form.Control
                type="text"
                placeholder="List aliquot rectangles as: 'A1:C4,B2:D7,C7:D8'"
                // style={{ height: '100px' }}
                value={this.state.rectangleList}
                onChange={(e) => (
                    this.setState({ rectangleList: e.target.value }, this.handleSave(this.state))
                )}>

            </Form.Control>
        );
    }
}


let typeConfigurators = {
    "http://bioprotocols.org/uml#ValueSpecification": ValueSpecificationConfigurator,
    "http://www.ontology-of-units-of-measure.org/resource/om-2/Measure": MeasureConfigurator,
    "http://bioprotocols.org/paml#SampleCollection": SampleCollectionConfigurator,
    "http://sbols.org/v3#Component": TypeConfigurator,
    "http://bioprotocols.org/paml#SampleArray": SampleArrayConfigurator,
    "http://bioprotocols.org/paml#SampleData": SampleDataConfigurator,
    "http://www.w3.org/2001/XMLSchema#anyURI": TypeConfigurator,
    "http://www.w3.org/2001/XMLSchema#integer": TypeConfigurator,
    "http://www.w3.org/2001/XMLSchema#double": TypeConfigurator,
    "http://sbols.org/v3#Identified": IdentifiedConfigurator,
    "http://bioprotocols.org/paml#ContainerSpec": ContainerSpecConfigurator
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