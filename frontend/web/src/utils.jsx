import React from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { axios, endpoint } from "./API";

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
  axios.get(endpoint.accounts.session)
    .then(function (response) {
      dataHandler(response.data);
    })
    .catch(function (error) {
      handleError(error, errorHandler);
    });
}

export function queryCSRF(dataHandler, errorHandler) {
  axios.get(endpoint.accounts.csrf)
  .then(function (response) {
    let csrfToken = response.headers["x-csrftoken"];
    dataHandler(csrfToken);
  })
  .catch(function (error) {
    handleError(error, errorHandler);
  });
}

export function queryLoginStatus(dataHandler, errorHandler) {
  axios.get(endpoint.accounts.whoami)
    .then(function (response) {
      dataHandler(response.data);
    })
    .catch(function (error) {
      handleError(error, errorHandler);
    });
}