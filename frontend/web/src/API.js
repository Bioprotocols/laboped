import { default as ax } from "axios";

export let axios = ax.create({});

export let axios_csrf_options = {
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'x-csrftoken',
}

const BASE_API_URL = "/api";
const EDITOR_API_URL = `${BASE_API_URL}/editor`;
const ACCOUNTS_API_URL = `${BASE_API_URL}/accounts`;
export let endpoint = {
  editor: {
    protocol:`${EDITOR_API_URL}/protocol/`,
    primitive:`${EDITOR_API_URL}/primitive/`,
    rebuild:`${EDITOR_API_URL}/primitive/rebuild/`,
  },
  accounts: {
    csrf: `${ACCOUNTS_API_URL}/csrf/`,
    signup: `${ACCOUNTS_API_URL}/signup/`,
    login: `${ACCOUNTS_API_URL}/login/`,
    logout: `${ACCOUNTS_API_URL}/logout/`,
    session: `${ACCOUNTS_API_URL}/session/`,
    whoami: `${ACCOUNTS_API_URL}/whoami/`,
  },
};
