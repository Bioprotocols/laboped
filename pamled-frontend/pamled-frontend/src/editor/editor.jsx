import Rete from "rete";
import ReactRenderPlugin from "rete-react-render-plugin";
import ConnectionPlugin from "rete-connection-plugin";
import ContextMenuPlugin from "rete-context-menu-plugin";
import DockPlugin from "rete-dock-plugin";
import AreaPlugin from "rete-area-plugin";
import { MyNode } from "./components/Node";
import { AddComponent } from "./components/Primitive";


export default async function(container) {
  console.log(container);
  var components = [new AddComponent()];

  var editor = new Rete.NodeEditor("demo@0.1.0", container);
  editor.use(ConnectionPlugin);
  editor.use(DockPlugin, {
    container: document.querySelector('.dock'),
    itemClass: 'item', // default: dock-item 
    plugins: [ReactRenderPlugin], // render plugins
  });
  editor.use(ReactRenderPlugin, {
    component: MyNode
  });
  editor.use(ContextMenuPlugin);

  var engine = new Rete.Engine("demo@0.1.0");

  components.map(c => {
    editor.register(c);
    engine.register(c);
    return c;
  });

  editor.on(
    "process nodecreated noderemoved connectioncreated connectionremoved",
    async () => {
      console.log("process");
      await engine.abort();
      await engine.process(editor.toJSON());
    }
  );

  editor.fromJSON({
    id: "demo@0.1.0",
    nodes: {
      "1": {
        id: 1,
        data: {},
        inputs: { num1: { connections: [] } },
        outputs: {
          num: { connections: [{ node: 2, input: "num1", data: {} }] }
        },
        position: [-285.5, -105.375],
        name: "Add"
      },
      "2": {
        id: 2,
        data: {},
        inputs: {
          num1: { connections: [{ node: 1, output: "num", data: {} }] }
        },
        outputs: { num: { connections: [] } },
        position: [-16.5, -99.375],
        name: "Add"
      }
    }
  });

  editor.view.resize();
  AreaPlugin.zoomAt(editor);
  editor.trigger("process");
}
