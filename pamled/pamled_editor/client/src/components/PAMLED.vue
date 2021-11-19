<template>
  <div class="pamled">
    <h1>PAML Editor</h1>
    <div class="modules" ref="modules">
      <ul id="v-for-object" class="modules">
        <li v-for="mod_name in modules"
            v-bind:key="mod_name.name"
            v-on:click="openModule(mod_name.name)">
          {{ mod_name }}
        </li>
      </ul>
      <button v-on:click="addModule">Add</button>
    </div>
    <div class="wrapper"><div class="node-editor" ref="nodeEditor"></div></div>
  </div>
</template>

<script>
import Rete from 'rete'; // eslint-disable-line max-classes-per-file
import ConnectionPlugin from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
// import ModulePlugin from 'rete-module-plugin';
import AreaPlugin from 'rete-area-plugin';
import VueNumControl from './NumControl.vue';
// import NumControl from './paml/NumControl';

import {
  modulesData,
  InputComponent,
  ModuleComponent,
  OutputComponent,
  OutputFloatComponent,
  NumOutputComponent,
  EmptyContainerComponent,
  PlateCoordinatesComponent,
  MeasureAbsorbanceComponent,
  ProvisionComponent,
} from './paml/ludox';

export default {
  name: 'PAMLED',
  props: {},
  methods: {
    addModule() {
      const mname = Object.keys(this.modules).length;
      const smname = `module${mname}.rete`;
      this.modules[smname] = {
        name: smname,
        data: this.initialData(),
      };
      return this.modules[smname];
    },
    initialData() {
      return { id: 'demo@0.1.0', nodes: {} };
    },
    module_names() {
      return this.modules.keys();
    },
    openModule(name) {
      this.currentModule.data = this.editor.toJSON();
      this.currentModule = this.modules[name];
      this.editor.fromJSON(this.currentModule.data).then();
      this.editor.trigger('process');
    },
  },
  data() {
    return {
      modules: {},
      currentModule: this.addModule(),
      editor: {},
    };
  },
  async mounted() {
    // this.currentModule = this.addModule();

    const numSocket = new Rete.Socket('Number value');

    class NumControl extends Rete.Control {
      constructor(emitter, key, readonly) {
        super(key);
        this.component = VueNumControl;
        this.props = { emitter, ikey: key, readonly };
        // this.data.render = 'vue';
      }

      setValue(val) {
        this.vueContext.value = val;
      }
    }

    class NumComponent extends Rete.Component { // eslint-disable-line no-unused-vars
      constructor() {
        super('Number');
      }

      builder(node) { // eslint-disable-line class-methods-use-this
        let out1 = new Rete.Output('num', 'Number', numSocket);
        let c1 = new NumControl(this.editor, 'num');
        return node.addControl(c1).addOutput(out1);
      }

      static worker(node, inputs, outputs) { // eslint-disable-line no-unused-vars
        outputs.num = node.data.num; // eslint-disable-line no-param-reassign
      }
    }

    // class AddComponent extends Rete.Component {
    //   constructor() {
    //     super('Add');
    //   }

    //   builder(node) { // eslint-disable-line class-methods-use-this
    //     let inp1 = new Rete.Input('num', 'Number', numSocket);
    //     let inp2 = new Rete.Input('num2', 'Number2', numSocket);
    //     let out = new Rete.Output('num', 'Number', numSocket);
    //     inp1.addControl(new NumControl(this.editor, 'num'));
    //     inp2.addControl(new NumControl(this.editor, 'num2'));
    //     return node
    //       .addInput(inp1)
    //       .addInput(inp2)
    //       .addControl(new NumControl(this.editor, 'preview', true))
    //       .addOutput(out);
    //   }

    //   worker(node, inputs, outputs) {
    //     let n1 = inputs.num.length ? inputs.num[0] : node.data.num1;
    //     let n2 = inputs.num2.length ? inputs.num2[0] : node.data.num2;
    //     let sum = n1 + n2;
    //     this.editor.nodes.find((n) => n.id === node.id).controls.get('preview').setValue(sum);
    //     outputs.num = sum; // eslint-disable-line no-param-reassign
    //   }
    // }

    let container = this.$refs.nodeEditor;
    this.editor = new Rete.NodeEditor('demo@0.1.0', container);
    this.editor.use(ConnectionPlugin, { curvature: 0.4 });
    this.editor.use(VueRenderPlugin);
    this.editor.use(ContextMenuPlugin);
    this.editor.use(AreaPlugin);
    let engine = new Rete.Engine('demo@0.1.0');

    let components = [
      new NumComponent(),
      // new AddComponent(),
      new InputComponent(),
      new ModuleComponent(),
      new OutputComponent(),
      new OutputFloatComponent(),
      new NumOutputComponent(),
      new EmptyContainerComponent(),
      new PlateCoordinatesComponent(),
      new ProvisionComponent(),
      new MeasureAbsorbanceComponent(),
    ];

    components.map((c) => { // eslint-disable-line array-callback-return
      this.editor.register(c);
      engine.register(c);
      // return 1;
    });

    this.modules = {
      ...modulesData,
    };

    // const m = this.get_modules();
    // this.editor.use(ModulePlugin.default, { engine, m });

    // let n1 = await components[0].createNode({ num: 2 });
    // let n2 = await components[0].createNode({ num: 0 });
    // let add = await components[1].createNode();

    // n1.position = [80, 200];
    // n1.position = [80, 400];
    // add.position = [500, 240];

    // editor.addNode(n1);
    // editor.addNode(n2);
    // editor.addNode(add);

    // editor.connect(n1.outputs.get('num'), add.inputs.get('num'));
    // editor.connect(n2.outputs.get('num'), add.inputs.get('num2'));

    this.editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
      console.log('process');
      await engine.abort();
      await engine.process(this.editor.toJSON());
    });
    this.editor.view.resize();
    this.openModule('ludox.rete');
    AreaPlugin.zoomAt(this.editor);
    this.editor.trigger('process');
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.node-editor {
  text-align: left;
  height: 100vh;
  width: 100vw;
}
.node .control input, .node .input-control input {
  width: 140px;
}
select, input {
  width: 100%;
  border-radius: 30px;
  background-color: white;
  padding: 2px 6px;
  border: 1px solid #999;
  font-size: 110%;
  width: 170px;
}

.node .socket.number {
  background: #96b38a;
}

.node .socket.control {
  background: gray;
}

.node .socket.float {
  background: red;
}

.executable {
  background: #b5b39c;
}

.objectnode {
  background: #b3b59c;
}

.node.selected {
  background: #bd7ebf;
}

</style>
