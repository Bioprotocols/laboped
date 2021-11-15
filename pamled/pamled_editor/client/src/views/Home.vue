<template>
  <div class="home">
    <PAMLED/>
  </div>
</template>

<script>
// @ is an alias to /src
import PAMLED from '@/components/PAMLED.vue';

export default {
  name: 'Home',
  components: {
    PAMLED,
  },
  data: () => ({
    error: '',
    messages: [],
  }),
  mounted() {
  },
  methods: {},
};
</script>
