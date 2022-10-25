import Rete from "rete";
import ReactRenderPlugin from "rete-react-render-plugin";
import ConnectionPlugin from "rete-connection-plugin";
import ContextMenuPlugin from "rete-context-menu-plugin";
import DockPlugin from "rete-dock-plugin";
import AreaPlugin from "rete-area-plugin";

import { MyNode } from "./components/Node";
import { loadComponentsFromAPI, LABOPPrimitiveComponent } from "./components/Primitive";
import { LABOPProtocolComponent } from "./components/ProtocolComponent";
import { InputComponent, OutputComponent, ParameterComponent } from "./components/IOComponents";
import { Palette } from "./palette";
import Menu from "./menu";

import React from "react";
import { Component } from "react";
import { Row, Col, Container } from "react-bootstrap";

import { axios, axios_csrf_options, endpoint } from "../API";
import "./editor.css"
import { ProtocolInspectorGroup } from "./components/ProtocolInspector";
import RenameProtocolModal from "./RenameProtocolModal";
import DownloadProtocolModal from "./DownloadProtocolModal";
import RebuildPrimitivesModal from "./RebuildPrimitivesModal";
import UserGuideModal from "./UserGuideModal";
import { portMap, compatibleWithMap } from "./components/ports";

import { withRouter } from "../utils";

function downloadStringAsFile(data, filename) {
  let url = window.URL.createObjectURL(new Blob([data]))
  let link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export class Editor extends Component {
  constructor(props) {
    super(props);
    this.workspaceRef = React.createRef();
    this.menuRef = React.createRef();
    this.saveSpaceRef = React.createRef();
    this.paletteRef = React.createRef();

    this.loginStatus = props.loginStatus;

    this.editor = null;
    this.state = {
      showModal: false,
      currentProtocol: null,
      protocols: {},
      specializations: [],
      primitiveComponents: {},
      protocolComponents: {},
      controlsComponents: {},
      libraries: new Set(),
      portTypes: {},
      isRebuildingPrimitives: true,
      download: null,
      renameProtocol: null,
      userGuideVisible: null,
      nodeToProtocol: {},
      toggle: false,
      initializing: false,
    }

    this.dataTypes = new Set();


    this.processHandler = this.processHandler.bind(this);
    this.displayProtocol = this.displayProtocol.bind(this);
    this.displayNewProtocol = this.displayNewProtocol.bind(this);
    this.createProtocol = this.createProtocol.bind(this);
    this.openProtocol = this.openProtocol.bind(this);
    this.renameProtocol = this.renameProtocol.bind(this);
    this.deleteProtocol = this.deleteProtocol.bind(this);
    this.downloadProtocol = this.downloadProtocol.bind(this);
    this.handleProtocolDownload = this.handleProtocolDownload.bind(this);
    this.displayAnyProtocol = this.displayAnyProtocol.bind(this);
    this.rebuildPrimitives = this.rebuildPrimitives.bind(this);
    this.getSpecializations = this.getSpecializations.bind(this);
    this.getProtocolSpecialization = this.getProtocolSpecialization.bind(this);
    this.onUserGuide = this.onUserGuide.bind(this);
    this.onUserGuideDone = this.onUserGuideDone.bind(this);
    this.nodeCreated = this.nodeCreated.bind(this);

  }

  componentDidMount() {

    this.setState({ initializing: true }, () => {
      this.initialize(() => { })
    });
    this.setState({ initializing: false });
    console.log("initialized");
  }

  initialize(callback) {
    //var editor = new Rete.NodeEditor("demo@0.1.0", document.querySelector('.editor'));
    this.editor = new Rete.NodeEditor("demo@0.1.0", this.workspaceRef.current);
    this.editor.use(ConnectionPlugin);
    this.editor.use(ReactRenderPlugin
      , {
        component: MyNode
      }
    );
    this.editor.use(ContextMenuPlugin);
    this.engine = new Rete.Engine("demo@0.1.0");

    this.editor.on("process nodecreated noderemoved connectioncreated connectionremoved", this.processHandler);
    this.editor.on("nodecreated", this.nodeCreated);


    this.editor.view.resize();

    const background = document.createElement('div');
    background.classList = 'editor-workspace-background';
    this.editor.use(AreaPlugin, { background });

    AreaPlugin.zoomAt(this.editor);
    this.editor.trigger("process");

    this.rebuildPrimitives(() => {
      this.getSpecializations(() => {
        this.initializePortTypes(() => {
          this.initializeComponents(() => {
            this.retrieveProtocols(callback);
          });
        });
      });
    });

  }

  componentWillUnmount() {
    this.editor.destroy();
  }

  async processHandler() {
    // console.log("process");
    await this.engine.abort();
    await this.engine.process(this.editor.toJSON());
    // this.saveCurrentProtocol();
  }

  async nodeCreated(node) {
    let nodeToProtocol = this.state.nodeToProtocol;
    let currentProtocolName = this.state.currentProtocol;
    // let currentProtocol = this.state.protocols[currentProtocolName];
    //node.setProtocol(currentProtocol, this.updateProtocolComponent);
    nodeToProtocol[node.id] = currentProtocolName;
    this.setState({ nodeToProtocol: nodeToProtocol });
  }


  labopShortDataType(item) {
    let lastHash = item.indexOf("#");
    let slashSplit = item.split("/");
    return lastHash >= 0 ? item.split("#")[1] : slashSplit[slashSplit.length - 1];
  }

  initializePortTypes(callback) {


    // Return one socket unique to each type
    let portTypes = {};
    Object.keys(portMap).map((key, index) => {
      let typeName = this.labopShortDataType(key);
      portTypes[key] = {
        typeName: typeName,
        socket: new Rete.Socket(typeName)
      };
      return key;
    });
    Object.keys(portTypes).map((key, index) => {
      compatibleWithMap[key].map((elt, i) => {
        portTypes[key].socket.combineWith(portTypes[elt].socket);
        return elt;
      })
      return key;
    });

    this.setState({ portTypes: portTypes }, () => callback());
  }

  // getPortTypeSocket(portType) {

  //   let portMap = {
  //     "http://bioprotocols.org/uml#ValueSpecification": "valueSpecification",
  //     "http://www.ontology-of-units-of-measure.org/resource/om-2/Measure": "measure",
  //     "http://bioprotocols.org/labop#SampleCollection": "sampleCollection",
  //     "http://sbols.org/v3#Component": "component",
  //     "http://bioprotocols.org/labop#SampleData": "sampleData",
  //     "http://bioprotocols.org/labop#SampleArray": "sampleArray",
  //     "http://www.w3.org/2001/XMLSchema#anyURI": "anyURI",
  //     "http://bioprotocols.org/labop#SampleMask": "sampleMask",
  //     "http://www.w3.org/2001/XMLSchema#integer": "integer",
  //     "http://www.w3.org/2001/XMLSchema#float": "float",
  //     "http://www.w3.org/2001/XMLSchema#double": "double",
  //     "http://bioprotocols.org/labop#ContainerSpec": "containerSpec",
  //     "http://sbols.org/v3#Identified": "identified"

  //   }

  //   // Return one socket unique to each type
  //   let portTypes = this.state.portTypes;
  //   let pname = (portType in portMap) ? portMap[portType] : portType;

  //   if (!(pname in portTypes)) {
  //     portTypes[pname] = new Rete.Socket(pname);
  //     this.setState({ portTypes: portTypes });
  //   }
  //   return portTypes[pname];
  // }



  async initializeComponents(callback) {
    let components = await loadComponentsFromAPI(); //[new AddComponent()];
    let libraries = this.state.libraries;
    components.map((c) => { libraries.add(c.library); return c; });

    components = components.map((primitive) => {
      let c = new LABOPPrimitiveComponent({
        portTypes: this.state.portTypes,
        primitive: primitive,
        saveProtocol: this.saveCurrentProtocol.bind(this)
      });
      // c.builder = function(node) {
      //   return node;
      // }
      //for (let item of c.dataTypes) this.dataTypes.add(this.labopShortDataType(item));
      return c;
    });

    // var dataTypeArray = Array.from(this.dataTypes);

    var primitiveComponents = this.state.primitiveComponents;
    components.map(c => {
      if (Object.keys(primitiveComponents).indexOf(c.name) < 0) {
        primitiveComponents[c.name] = c;
        this.editor.register(c);
        this.engine.register(c);
      }
      return c;
    });


    let props = {
      portTypes: this.state.portTypes,
      saveProtocol: this.saveCurrentProtocol.bind(this),
      updateProtocolComponent: this.updateProtocolComponent.bind(this),
      editor: this
    };
    let controlsComponents = [
      new InputComponent(props),
      new OutputComponent(props),
      new ParameterComponent(props)
    ];
    controlsComponents.map(c => {
      this.editor.register(c);
      this.engine.register(c);
      return c;
    });

    this.setState({ primitiveComponents: primitiveComponents, libraries: libraries, controlsComponents: controlsComponents }, callback);
  }

  initialGraph() {
    return { id: "demo@0.1.0", nodes: {} };
  }

  createProtocol(name = null, graph = null) {
    if (!name) {
      let existing = Object.keys(this.state.protocols)
      let i = 0
      do {
        name = "New Protocol " + i
        i += 1
      } while (existing.includes(name))
    }

    let protocols = this.state.protocols;
    let pname = name
    let i = 1
    while (pname in protocols) {
      pname = `${name}(${i})`
      i += 1
    }

    return new Promise((resolve) => {
      this.saveProtocol(pname, graph).then((protocol) => {
        resolve(protocol)
      }).catch((error) => {
        console.error(error)
      })
    })
  }

  displayNewProtocol(name = null, graph = null) {
    // ask the server to create a new protocol
    let makeNew = () => {
      this.createProtocol(name, graph).then((protocol) => {
        let name = protocol.name;
        let protocols = this.state.protocols;
        protocols[name] = protocol;
        // add that protocol to the local state
        this.setState({ protocols: protocols }, () => {
          // display the new protocol
          this.displayProtocol(protocol.name, false)
        });
      }).catch((error) => {
        console.log(error);
      });
    }

    if (this.state.currentProtocol) {
      // TODO decide if this should save the protocol to remote
      // or simply save the protocol graph locally
      this.saveProtocol(this.state.currentProtocol)
        .then(() => {
          makeNew();
        })
        .catch((error) => {
          console.error(error)
        })
      return;
    }
    makeNew();
  }

  displayProtocol(protocolName, saveOld = true) {
    if (!protocolName) {
      return false
    }
    console.log(`Displaying protocol ${protocolName}`)
    let currentProtocols = this.state.protocols;
    let protocol = currentProtocols[protocolName];
    // Update the current protocol, load graph, and update state.
    if (saveOld) {
      this.saveProtocolGraphInState(this.state.currentProtocol);
    }

    this.setState({ currentProtocol: protocolName }, () => {
      this.editor.fromJSON(protocol.graph)
        .then(() => {
          this.editor.trigger("process");
          this.editor.view.resize();
          // TODO this should really store the id instead of the name
          // but I would need to unravel the use of name in currentProtocol
          // so instead just use name for now
          localStorage.setItem('opened-protocol', protocol.name)
        })
        .catch((error) => {
          console.error(error)
        });
    });
    return true
  }

  saveProtocolGraphInState(protocolName, overrideGraph = null) {
    if (!protocolName) {
      return;
    }
    // If there is a current protocol, then save its graph as JSON.
    let protocols = this.state.protocols;

    if (!(protocolName in protocols)) {
      console.log(`Making new protocol for ${protocolName}`)
      let p = {
        id: null,
        name: protocolName,
        graph: this.initialGraph(),
        rdf_file: null
      };
      protocols[protocolName] = p;
    }
    console.log(`Updating graph for protocol ${protocolName}`)

    let graph = null;
    if (overrideGraph) {
      graph = overrideGraph
    } else {
      try {
        if (protocolName !== this.state.currentProtocol) {
          graph = protocols[protocolName].graph;
        } else {
          graph = this.editor.toJSON();
        }
      } catch (error) {
        console.error(error)
        graph = this.initialGraph();
      }
    }
    protocols[protocolName].graph = graph;
    this.setState({ protocols: protocols });
    // this.updateProtocolComponent(this.state.currentProtocol);
  }

  saveCurrentProtocol() {
    if (this.state.currentProtocol) {
      this.saveProtocol(this.state.currentProtocol)
    }
  }

  saveProtocol(protocolName, overrideGraph = null) {
    if (this.state.initializing) {
      return;
    }

    console.log(`Saving protocol ${protocolName}`)
    // retrieve the current protocol from the Rete editor
    this.saveProtocolGraphInState(protocolName, overrideGraph);

    let protocol = this.state.protocols[protocolName]

    return new Promise((resolve, reject) => {
      axios.post(endpoint.editor.protocol, [protocol], {
        withCredentials: true,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'x-csrftoken',
        headers: {
          "Content-Type": "application/json",
          'x-csrftoken': this.loginStatus.state.csrf,
        }
      }).then((response) => {
        let result = response.data[0];
        if (!result) {
          throw new Error('Save returned null protocol');
        }
        var currentProtocols = this.state.protocols;
        currentProtocols[result.name] = result;

        this.setState({ protocols: currentProtocols }, () => {
          // FIXME retrieve all the protocols again since we are not saving just a specific
          // protocol and I do not want to rummage through all of the protocols to determine
          // what ID was assigned to any newly saved (previous local-only) protocols.
          // Note: Might become OBE if we just make all protocols stores remotely (no local-only)
          // this.retrieveProtocols()
          resolve(result)
        });
      }).catch(reject)
    })
  }

  // TODO this should probably just save the current protocol
  async saveAllProtocols() {
    // retrieve the current protocol from the Rete editor
    this.saveProtocolGraphInState(this.state.currentProtocol);

    this.setState({ showModal: true })
    await axios.post(endpoint.editor.protocol, Object.values(this.state.protocols), {
      withCredentials: true,
      xsrfCookieName: 'csrftoken',
      xsrfHeaderName: 'x-csrftoken',
      headers: {
        "Content-Type": "application/json",
        'x-csrftoken': this.loginStatus.state.csrf,
      }
    })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        return [];
      });
    // FIXME retrieve all the protocols again since we are not saving just a specific
    // protocol and I do not want to rummage through all of the protocols to determine
    // what ID was assigned to any newly saved (previous local-only) protocols.
    // Note: Might become OBE if we just make all protocols stores remotely (no local-only)
    // this.retrieveProtocols()
  }

  async retrieveProtocols(callback) {
    var protocols = await axios.get(endpoint.editor.protocol, axios_csrf_options)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        return [];
      });

    var currentProtocols = this.state.protocols;
    protocols.map((p) => {
      //p.graph = JSON.parse(p.graph); // read json serialized as string
      currentProtocols[p.name] = p;
      return p;
    });

    let protocolComponents = {};
    Object.keys(currentProtocols).map((name) => { protocolComponents[name] = this.initializeProtocolComponent(name); return name; });
    let newState = {
      protocols: currentProtocols,
      protocolComponents: protocolComponents
    };


    this.setState(newState, () => {
      // if we have a previous opened protocol in localstorage
      // and it can display then return
      let prev = localStorage.getItem('opened-protocol')
      if (prev in currentProtocols && this.displayProtocol(prev)) {
        callback();
        return
      }

      // if we have no current protocols the create one
      if (currentProtocols.length < 1) {
        this.displayNewProtocol();
        callback();
        return
      }

      // otherwise just display the first protocol from currentProtocols
      this.displayAnyProtocol()
      callback();
    });

  }

  initializeProtocolComponent(protocol) {

    // var primitiveComponents = this.state.primitiveComponents;
    let protocolComponent = new LABOPProtocolComponent(
      {
        portTypes: this.state.portTypes,
        protocol: this.state.protocols[protocol],
        saveProtocol: this.saveProtocol,
        updateProtocolComponent: this.updateProtocolComponent.bind(this)
      });
    // primitiveComponents[protocolComponent.name] = protocolComponent;

    // if (this.editor.components.has(protocolComponent.name)) {
    //   this.editor.components.set(protocolComponent.name, protocolComponent);
    // } else {
    this.editor.register(protocolComponent);
    // }
    // if (this.engine.components.has(protocolComponent.name)) {
    //   this.engine.components.set(protocolComponent.name, protocolComponent);
    // } else {
    //   this.engine.register(protocolComponent);
    // }
    // this.setState({ primitiveComponents: primitiveComponents });
    // this.editor.trigger("process");
    return protocolComponent;

  }

  async updateProtocolComponent(node) {
    let protocol = this.state.nodeToProtocol[node.id];
    let protocolComponents = this.state.protocolComponents;
    let component = protocolComponents[protocol];
    //await component.update();
    if (component && this.editor.components.has(component.name)) {
      this.editor.components.delete(component.name);
      this.editor.components.set(component.name, component);
      let protocolComponent = Array.from(this.paletteRef.current.paletteRefs.Protocols.current.children).find((elt) => (elt.textContent.startsWith(protocol)));
      protocolComponent.remove();
      this.editor.events.componentregister = [];
      let options = {
        container: this.paletteRef.current.paletteRefs.Protocols.current,
        itemClass: 'item', // default: dock-item
        plugins: [ReactRenderPlugin], // render plugins
      };
      DockPlugin.install(this.editor, options || {});
      this.editor.trigger("componentregister", component);
      // this.forceUpdate();
      // this.setState({ toggle: !this.state.toggle });
    } else if (component) {
      this.editor.register(component);
    } else {
      console.log("Updating unknown component")
    }
  }

  rebuildPrimitives(callback) {
    axios.get(endpoint.editor.rebuild)
      .then((response) => {
        this.setState({ isRebuildingPrimitives: false }, () => {
          callback(response.data)
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  getSpecializations(callback) {
    axios.get(endpoint.editor.specializations, axios_csrf_options)
      .then((response) => {
        let specs = this.state.specializations;
        response.data.forEach(
          (specialization) => { specs[specialization.id] = specialization }
        );
        this.setState({ specializations: specs }, () => {
          callback(response.data)
        })
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }

  async getProtocolSpecialization(protocolName, specializationId) {
    if (protocolName) {
      let protocols = this.state.protocols;
      let protocol = protocols[protocolName];
      let specialization = await this.specializeProtocol(protocolName, specializationId).then((specialization) => {
        protocol.specializations[specializationId] = specialization;
        protocols[protocolName] = protocol;
        this.setState({ protocols: protocols });
      });

      return specialization;

    }
  }

  async downloadGraph(protocol = null) {
    // TODO I need to convert the protocol storage on the client to
    // match the server side primary key (id) instead of using the
    // protocol name.
    if (protocol === null) {
      console.error(`Must select a protocol to download`)
      return
    }
    var protocolObj = this.state.protocols[protocol]
    downloadStringAsFile(JSON.stringify(protocolObj.graph, null, 2), "graph.json")
  }

  downloadProtocol(protocolName) {
    if (!protocolName) {
      console.error(`Must select a protocol to download`)
      return
    }
    console.log(`Downloading protocol ${protocolName}`)

    let canceledDownload = false
    let promise = new Promise((resolve, reject) => {
      // Always save the protocol prior to downloading it
      this.saveProtocol(protocolName)
        .then((protocol) => {
          if (canceledDownload) {
            reject({ isCanceled: true, error: null })
            return
          }
          // once the protocol is saved we can request the download
          axios.get(`${endpoint.editor.protocol}${protocol.id}/download/`, {
            responseType: 'blob'
          }).then(function (response) {
            if (canceledDownload) {
              reject({ isCanceled: true, error: null })
              return
            }
            // on the download is down we can read the headers
            let disposition = response.headers['content-disposition'];
            let filename = 'unknown_file'
            // from https://stackoverflow.com/a/40940790
            if (disposition && disposition.indexOf('attachment') !== -1) {
              let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              let matches = filenameRegex.exec(disposition);
              if (matches !== null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
              }
            }
            downloadStringAsFile(response.data, filename)
            resolve()
          })
            .catch(function (error) {
              // failed to download
              reject({ isCanceled: true, error: error })
            })
        })
        .catch((error) => {
          // failed to save
          reject(error)
        })
    })
    return {
      promise,
      cancel() {
        canceledDownload = true;
      },
    }
  }

  specializeProtocol(protocolName, specializationId) {
    if (!protocolName) {
      console.error(`Must select a protocol to download`)
      return
    }
    if (!specializationId) {
      console.error(`Must select a specialization to apply`)
      return
    }
    console.log(`Specializing protocol ${protocolName} with ${specializationId}`)

    let canceledSpecialize = false
    // Always save the protocol prior to specializing it
    let specialization = this.saveProtocol(protocolName)
      .then(async (protocol) => {
        if (canceledSpecialize) {
          return
        }
        // once the protocol is saved we can request the specialization
        let protocol_specialization = axios.get(
          `${endpoint.editor.protocol}${protocol.id}/specialization/${specializationId}`
        ).then(function (response) {
          if (canceledSpecialize) {
            return
          }
          return response.data;
        })
          .catch(function (error) {
            // failed to download
            console.log("Could not retrieve specialization:" + error)
          })
        return protocol_specialization
      })
      .catch((error) => {
        // failed to save
        console.log("Could not save protocol:" + error)
      })
    return specialization;
  }


  handleProtocolDownload(protocolName) {
    let cancelablePromise = this.downloadProtocol(protocolName)

    cancelablePromise.promise
      .then(() => {
        this.setState({
          download: {
            name: protocolName,
            done: true,
            error: null,
            promise: null,
            cancel: () => { }
          }
        })
      })
      .catch((result) => {
        console.error(result.error)
        this.setState({
          download: {
            name: protocolName,
            done: true,
            error: result.error.toString(),
            promise: null,
            cancel: () => { }
          }
        })
      })

    this.setState({
      download: {
        name: protocolName,
        done: false,
        error: null,
        promise: cancelablePromise.promise,
        cancel: cancelablePromise.cancel
      }
    })
  }

  updateProtocol(protocol) {
    let currentProtocols = this.state.protocols;
    currentProtocols[protocol.name] = protocol;
    this.setState({ protocols: currentProtocols });
  }

  getProtocol(protocol) {
    if (protocol && protocol in this.state.protocols) {
      return this.state.protocols[protocol];
    } else {
      return null;
    }
  }

  getCurrentProtocol() {
    return this.getProtocol(this.state.currentProtocol);
  }

  getProtocols() {
    return Object.keys(this.state.protocols);
  }

  openProtocol(protocolName) {
    this.displayProtocol(protocolName)
  }

  renameProtocol(protocolName) {
    let currentProtocols = this.state.protocols;
    let protocol = currentProtocols[protocolName];
    this.setState({ renameProtocol: protocol });
  }

  displayAnyProtocol() {
    let options = Object.values(this.state.protocols)
    if (options.length < 1) {
      this.displayNewProtocol()
    } else {
      this.displayProtocol(options[0].name, false)
    }
  }

  async deleteProtocol(protocolName) {
    let currentProtocols = this.state.protocols;
    let protocol = currentProtocols[protocolName];

    let success = await axios.post(`${endpoint.editor.protocol}${protocol.id}/delete/`, [], {
      withCredentials: true,
      xsrfCookieName: 'csrftoken',
      xsrfHeaderName: 'x-csrftoken',
      headers: {
        "Content-Type": "application/json",
        'x-csrftoken': this.loginStatus.state.csrf,
      }
    }).then(function (response) {
      return response.status === 200;
    })
      .catch(function (error) {
        // handle error
        console.log(error);
        return false;
      });

    if (success) {
      let currentProtocols = this.state.protocols;
      let currentProtocol = this.state.currentProtocol;
      delete currentProtocols[protocol.name];

      let newState = { protocols: currentProtocols }
      if (protocol.name === currentProtocol) {
        newState.currentProtocol = null
      }

      this.setState(newState, () => {
        if (!this.state.currentProtocol) {
          this.displayAnyProtocol()
        }
      });
    } else {
      console.error(`Failed to delete ${protocol.name}`)
    }
  }

  executeProtocol(pname) {
    this.props.navigate('/execute', { state: { protocol: this.state.protocols[pname] } });
  }

  onCancelRename() {
    this.setState({
      renameProtocol: null,
      renameProtocolError: null
    });
  }

  onConfirmRename(protocol, name) {
    if (!name) {
      return "Name must not be empty"
    }
    if (protocol.name === name) {
      return "Name must be new assignment"
    }
    var currentProtocols = this.state.protocols;
    if (name in currentProtocols) {
      return "Name already exists"
    }

    if (this.state.currentProtocol === protocol.name) {
      this.setState({ currentProtocol: name });
    }

    delete currentProtocols[protocol.name]
    protocol.name = name
    currentProtocols[protocol.name] = protocol

    this.setState({
      renameProtocol: null,
      renameProtocolError: null,
      protocols: currentProtocols
    });
    this.saveProtocol(protocol.name)
    return null
  }

  onCancelDownload() {
    this.state.download.cancel()
    this.setState({ download: null })
  }

  onDoneDownload() {
    this.setState({ download: null })
  }

  onUserGuideDone() {
    this.setState({ userGuideVisible: null })
  }
  onUserGuide() {
    this.setState({ userGuideVisible: true })
  }

  render() {

    let workspaceComponent = () => (
      <div className="editor-workspace" ref={this.workspaceRef} />
    )

    let palette = (
      Array.from(this.state.libraries).length > 0 &&
      Object.keys(this.state.primitiveComponents).length > 0
    ) ?
      (<Palette
        components={this.state.primitiveComponents}
        libraries={this.state.libraries}
        protocolComponents={this.state.protocolComponents}
        controlsComponents={this.state.controlsComponents}
        editor={this.editor} ref={this.paletteRef} />) :
      null;

    return (
      <Container className="editor-container" fluid={true}>
        <Menu
          ref={this.menuRef}
          editor={this}
        />
        <Row className="editor" >
          <Col xs={2} sm={2} className="editor-palette-column">
            {palette}
          </Col>

          <Col xs={10} sm={10} className="editor-main-column">

            <ProtocolInspectorGroup
              editor={this}
              currentProtocol={this.state.currentProtocol}
              protocols={this.state.protocols}
              workspaceComponent={workspaceComponent}
            />

          </Col>
        </Row>

        <RenameProtocolModal
          show={this.state.renameProtocol !== null}
          protocol={this.state.renameProtocol}
          handleCancel={() => this.onCancelRename()}
          handleRename={(p, n) => this.onConfirmRename(p, n)}
        />
        <DownloadProtocolModal
          show={this.state.download !== null}
          download={this.state.download}
          handleCancel={() => this.onCancelDownload()}
          handleDone={() => this.onDoneDownload()}
        />
        <UserGuideModal
          show={this.state.userGuideVisible !== null}
          handleDone={() => this.onUserGuideDone()}
        />
        <RebuildPrimitivesModal
          show={this.state.isRebuildingPrimitives}
        />
      </Container>
    );
  }
}
export default withRouter(Editor);

