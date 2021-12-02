import React from "react";
import { withRouter } from "../utils";

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      csrf: "",
      email: "",
      password: "",
      passwordConfirm: "",
      error: "",
      isAuthenticated: false,
    };

    this.getCSRF = this.getCSRF.bind(this);
    this.getSession = this.getSession.bind(this);
    this.signup = this.signup.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handlePasswordConfirmChange = this.handlePasswordConfirmChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.isResponseOk = this.isResponseOk.bind(this);
  }

  componentDidMount() {
    this.getSession();
  }
  
  handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }

  handlePasswordConfirmChange(event) {
    this.setState({passwordConfirm: event.target.value});
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
        if (data.isAuthenticated) {
          this.setState({ isAuthenticated: true });
          this.props.navigate("/login");
        } else {
          this.setState({ isAuthenticated: false });
          this.getCSRF();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  signup(event) {
    event.preventDefault();
    let password = this.state.password;
    if (password !== this.state.passwordConfirm) {
      this.setState({ error: "Password does not match." });
      return;
    }
    fetch("/api/signup/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": this.state.csrf,
      },
      credentials: "same-origin",
      body: JSON.stringify({ email: this.state.email, password: password }),
    })
      .then(this.isResponseOk)
      .then((_) => {
        this.setState({ isAuthenticated: true, email: "", password: "", error: "" });
      })
      .catch((err) => {
        this.setState({ error: "Wrong email or password." });
      });
  }

  render() {
    if (!this.state.isAuthenticated) {
      return (
        <div className="container mt-3">
          <h1>Signup</h1>
          <br />
          <form onSubmit={this.signup}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="text" className="form-control" id="email" name="email" value={this.state.email} onChange={this.handleEmailChange} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Password</label>
              <input type="password" className="form-control" id="password" name="password" value={this.state.password} onChange={this.handlePasswordChange} />
              <label htmlFor="password">Confirm Password</label>
              <input type="password" className="form-control" id="password-confirm" name="password-confiem" value={this.state.passwordConfirm} onChange={this.handlePasswordConfirmChange} />
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
        <h1>Loading...</h1>
      </div>
    )
  }
}

export default withRouter(Signup);