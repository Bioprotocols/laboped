
export const portMap = {
    "http://bioprotocols.org/uml#ValueSpecification": "valueSpecification",
    "http://www.ontology-of-units-of-measure.org/resource/om-2/Measure": "measure",
    "http://bioprotocols.org/labop#SampleCollection": "sampleCollection",
    "http://sbols.org/v3#Component": "component",
    "http://bioprotocols.org/labop#SampleData": "sampleData",
    "http://bioprotocols.org/labop#SampleArray": "sampleArray",
    "http://www.w3.org/2001/XMLSchema#anyURI": "anyURI",
    "http://bioprotocols.org/labop#SampleMask": "sampleMask",
    "http://www.w3.org/2001/XMLSchema#integer": "integer",
    "http://www.w3.org/2001/XMLSchema#float": "float",
    "http://www.w3.org/2001/XMLSchema#double": "double",
    "http://bioprotocols.org/labop#ContainerSpec": "containerSpec",
    "http://sbols.org/v3#Identified": "identified",
    "http://www.w3.org/ns/prov#Agent": "agent"

}
export const compatibleWithMap = {
    "http://bioprotocols.org/uml#ValueSpecification":
        [
            "http://www.ontology-of-units-of-measure.org/resource/om-2/Measure",
            "http://www.w3.org/2001/XMLSchema#integer",
            "http://www.w3.org/2001/XMLSchema#float",
            "http://www.w3.org/2001/XMLSchema#double",
            "http://bioprotocols.org/labop#ContainerSpec"
        ],
    "http://www.ontology-of-units-of-measure.org/resource/om-2/Measure": ["http://bioprotocols.org/uml#ValueSpecification"],
    "http://bioprotocols.org/labop#SampleCollection": ["http://bioprotocols.org/labop#SampleArray", "http://bioprotocols.org/labop#SampleMask"],
    "http://sbols.org/v3#Component": [],
    "http://bioprotocols.org/labop#SampleData": [],
    "http://bioprotocols.org/labop#SampleArray": ["http://bioprotocols.org/labop#SampleCollection"],
    "http://www.w3.org/2001/XMLSchema#anyURI": [],
    "http://bioprotocols.org/labop#SampleMask": ["http://bioprotocols.org/labop#SampleCollection"],
    "http://www.w3.org/2001/XMLSchema#integer": ["http://bioprotocols.org/uml#ValueSpecification"],
    "http://www.w3.org/2001/XMLSchema#float": ["http://bioprotocols.org/uml#ValueSpecification"],
    "http://www.w3.org/2001/XMLSchema#double": ["http://bioprotocols.org/uml#ValueSpecification"],
    "http://bioprotocols.org/labop#ContainerSpec":
        [
            "http://bioprotocols.org/uml#ValueSpecification",
            "http://sbols.org/v3#Identified"
        ],
    "http://sbols.org/v3#Identified": ["http://bioprotocols.org/labop#ContainerSpec"],
    "http://www.w3.org/ns/prov#Agent": []
};