import React from "react";
import { querySession, queryCSRF, queryLoginStatus } from "../utils";
import { axios, endpoint } from "../API";

export default class LoginStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            csrf: "",
            isAuthenticated: null,
            user: null
        };

        this.refreshCSRF = this.refreshCSRF.bind(this);
        this.checkSession = this.checkSession.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);

        this.onAuthenticationGained = this.onAuthenticationGained.bind(this);
        this.onAuthenticationLost = this.onAuthenticationLost.bind(this);
    }

    componentDidMount() {
        this.checkSession();
    }

    refreshCSRF() {
        queryCSRF((csrfToken) => {
            this.setState({ csrf: csrfToken });
        })
    }

    componentDidUpdate(_, prevState) {
        if (prevState.isAuthenticated !== this.state.isAuthenticated) {
            this.props.onAuthenticationChanged(this.state.isAuthenticated);
        }
    }

    onAuthenticationGained() {
        this.refreshCSRF();
        queryLoginStatus((data) => {
            this.setState({
                isAuthenticated: true,
                user: {
                    email: data.email,
                }
            });
        });
    }

    onAuthenticationLost() {
        this.setState({ isAuthenticated: false, user: null });
        this.refreshCSRF();
    }

    checkSession() {
        querySession((data) => {
            if (data.isAuthenticated) {
                this.onAuthenticationGained();
            } else {
                this.onAuthenticationLost();
            }
        }, (err) => {
            if (err.response.status === 403) {
                this.onAuthenticationLost();
                return;
            }
            console.error(err);
        });
    }

    login(email, password, onLogin, onError) {
        let payload = JSON.stringify({ email: email, password: password });
        axios.post(endpoint.accounts.login, payload, {
                xsrfCookieName: 'csrftoken',
                xsrfHeaderName: 'X-CSRFToken',
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRFToken': this.state.csrf,
                }
            })
            .then((_) => {
                this.onAuthenticationGained();
                if(onLogin !== undefined) {
                    onLogin();
                }
            })
            .catch((error) => {
                if(onError !== undefined) {
                    onError(error);
                }
            });
    }

    logout(onLogout, onError) {
        axios.get(endpoint.accounts.logout)
            .then((_) => {
                this.onAuthenticationLost();
                if(onLogout !== undefined) {
                    onLogout();
                }
            })
            .catch((error) => {
                if(onError === undefined) {
                    console.error(error);
                    return;
                }
                onError(error);
            });
    }

    signup(email, password, onLogin, onError) {
        let payload = JSON.stringify({ email: email, password: password });
        axios.post(endpoint.accounts.signup, payload, {
                xsrfCookieName: 'csrftoken',
                xsrfHeaderName: 'X-CSRFToken',
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRFToken': this.state.csrf,
                }
            })
            .then((_) => {
                this.onAuthenticationGained();
                if(onLogin !== undefined) {
                    onLogin();
                }
            })
            .catch((error) => {
                if(onError !== undefined) {
                    onError(error);
                }
            });
    }

    render() {
        return (null);
    }
}