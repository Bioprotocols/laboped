import Rete from 'rete'; // eslint-disable-line max-classes-per-file
import VueNumControl from '../NumControl.vue';

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

export default NumControl;
