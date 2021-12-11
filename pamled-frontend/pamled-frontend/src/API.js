import axios from "axios";
const package_json = require("../package.json")

export default axios.create({});

export let axios_csrf_options = {
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
}