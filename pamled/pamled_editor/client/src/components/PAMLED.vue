<template>
  <div class="pamled">
    <h1>PAML Editor</h1>
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
  data() {
    return {
      editor: null,
    };
  },
  async mounted() {
    const numSocket = new Rete.Socket('Number value');

    let currentModule = {};

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

    class AddComponent extends Rete.Component {
      constructor() {
        super('Add');
      }

      builder(node) { // eslint-disable-line class-methods-use-this
        let inp1 = new Rete.Input('num', 'Number', numSocket);
        let inp2 = new Rete.Input('num2', 'Number2', numSocket);
        let out = new Rete.Output('num', 'Number', numSocket);
        inp1.addControl(new NumControl(this.editor, 'num'));
        inp2.addControl(new NumControl(this.editor, 'num2'));
        return node
          .addInput(inp1)
          .addInput(inp2)
          .addControl(new NumControl(this.editor, 'preview', true))
          .addOutput(out);
      }

      worker(node, inputs, outputs) {
        let n1 = inputs.num.length ? inputs.num[0] : node.data.num1;
        let n2 = inputs.num2.length ? inputs.num2[0] : node.data.num2;
        let sum = n1 + n2;
        this.editor.nodes.find((n) => n.id === node.id).controls.get('preview').setValue(sum);
        outputs.num = sum; // eslint-disable-line no-param-reassign
      }
    }

    let container = this.$refs.nodeEditor;
    let editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin, { curvature: 0.4 });
    editor.use(VueRenderPlugin);
    editor.use(ContextMenuPlugin);
    editor.use(AreaPlugin);
    let engine = new Rete.Engine('demo@0.1.0');

    let components = [
      new NumComponent(),
      new AddComponent(),
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
      editor.register(c);
      engine.register(c);
      // return 1;
    });

    // const initialData = () => ({ id: 'demo@0.1.0', nodes: {} });
    const modules = {
      ...modulesData,
    };

    // function addModule() {
    //   modules['module' + Object.keys(modules).length + '.rete'] = {
    //     data: initialData()
    //   };
    // }

    async function openModule(name) {
      currentModule.data = editor.toJSON();

      currentModule = modules[name];
      await editor.fromJSON(currentModule.data);
      editor.trigger('process');
    }

    // editor.use(ModulePlugin.default, { engine, modules });

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

    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
      console.log('process');
      await engine.abort();
      await engine.process(editor.toJSON());
    });
    editor.view.resize();
    openModule('ludox.rete').then(() => {
      AreaPlugin.zoomAt(editor);
    });
    editor.trigger('process');
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
</style>
