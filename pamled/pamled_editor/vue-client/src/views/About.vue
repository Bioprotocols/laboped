<template>
  <div class="about">
    <h1>This is an about page</h1>
    {{ info }}
    <ul id="lib">
      <li v-for="lib in info" v-bind:key='lib'>
        {{ lib.message }}
      </li>
    </ul>
  </div>
</template>
<script>
import axios from 'axios';
import https from 'https';

export default {
  el: 'lib',
  data() {
    return {
      info: null,
    };
  },
  mounted() {
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    axios
      .create({
        httpsAgent: new https.Agent({
          // rejectUnauthorized: false,
        }),
      })
      .get('http://localhost:8000/lib')
      .then((response) => (this.info = response)); // eslint-disable-line no-return-assign
  },
};
</script>
