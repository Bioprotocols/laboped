import React from "react";
import { withRouter } from "../utils";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      csrf: "",
      email: "",
      password: "",
      error: "",
      isAuthenticated: false,
    };

    this.getCSRF = this.getCSRF.bind(this);
    this.getSession = this.getSession.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.whoami = this.whoami.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.isResponseOk = this.isResponseOk.bind(this);
  }

  componentDidMount() {
    this.getSession();
  }
  
  handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }

  handleEmailChange(event) {
    this.setState({email: event.target.value});
  }

  isResponseOk(response) {
    if (response.status >= 200 && response.status <= 299) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  }

  getCSRF() {
    fetch("/api/csrf/", {
      credentials: "same-origin",
    })
      .then((res) => {
        let csrfToken = res.headers.get("X-CSRFToken");
        this.setState({ csrf: csrfToken });
        console.log(csrfToken);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getSession() {
    fetch("/api/session/", {
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.isAuthenticated) {
          this.setState({ isAuthenticated: true });
        } else {
          this.setState({ isAuthenticated: false });
          this.getCSRF();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  whoami() {
    fetch("/api/whoami/", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("You are logged in as: " + data.email);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  login(event) {
    event.preventDefault();
    fetch("/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": this.state.csrf,
      },
      credentials: "same-origin",
      body: JSON.stringify({ email: this.state.email, password: this.state.password }),
    })
      .then(this.isResponseOk)
      .then((data) => {
        this.setState({ isAuthenticated: true, email: "", password: "", error: "" });
      })
      .catch((err) => {
        this.setState({ error: "Wrong email or password." });
      });
  }

  logout() {
    fetch("/api/logout", {
      credentials: "same-origin",
    })
      .then(this.isResponseOk)
      .then((data) => {
        console.log(data);
        this.setState({ isAuthenticated: false });
        this.getCSRF();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    if (!this.state.isAuthenticated) {
      return (
        <div className="container mt-3">
          <h1>React Cookie Auth</h1>
          <br />
          <h2>Login</h2>
          <form onSubmit={this.login}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="text" className="form-control" id="email" name="email" value={this.state.email} onChange={this.handleEmailChange} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" className="form-control" id="password" name="password" value={this.state.password} onChange={this.handlePasswordChange} />
              <div>
                {this.state.error &&
                  <small className="text-danger">
                    {this.state.error}
                  </small>
                }
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
        </div>
      );
    }
    return (
      <div className="container mt-3">
        <h1>React Cookie Auth</h1>
        <p>You are logged in!</p>
        <button className="btn btn-primary mr-2" onClick={this.whoami}>WhoAmI</button>
        <button className="btn btn-danger" onClick={this.logout}>Log out</button>
      </div>
    )
  }
}

export default withRouter(Login);