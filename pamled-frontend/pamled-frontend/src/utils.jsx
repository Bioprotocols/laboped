import React from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios, { axios_csrf_options } from "./API";

export function withRouter(Component) {
  return (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} location={location} />;
  }
}

function handleError(error, errorHandler) {
  if (errorHandler === undefined) {
    console.error(error)
    return;
  }
  errorHandler(error);
}

export function querySession(dataHandler, errorHandler) {
  axios.get("/api/session/")
    .then(function (response) {
      dataHandler(response.data);
    })
    .catch(function (error) {
      handleError(error, errorHandler);
    });
}

export function queryCSRF(dataHandler, errorHandler) {
  axios.get("/api/csrf/")
    .then(function (response) {
      let csrfToken = response.headers["x-csrftoken"];
      dataHandler(csrfToken);
    })
    .catch(function (error) {
      handleError(error, errorHandler);
    });
}

export function queryLoginStatus(dataHandler, errorHandler) {
  axios.get("/api/whoami/")
    .then(function (response) {
      dataHandler(response.data);
    })
    .catch(function (error) {
      handleError(error, errorHandler);
    });
}