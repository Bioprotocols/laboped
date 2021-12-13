import axios from "axios";

export default axios.create({});

export let axios_csrf_options = {
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
}