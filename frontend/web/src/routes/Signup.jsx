import React from "react";
import { withRouter } from "../utils";
import LoginStatus from '../login/LoginStatus';

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: null,
    };

    this.signup = this.signup.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handlePasswordConfirmChange = this.handlePasswordConfirmChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.onAuthenticationChanged = this.onAuthenticationChanged.bind(this);

    this.loginStatus = React.createRef();
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

  onAuthenticationChanged(isAuthenticated) {
    this.setState({ isAuthenticated: isAuthenticated });
    if (isAuthenticated) {
      this.props.navigate("/login");
    }
  }

  signup(event) {
    event.preventDefault();
    let password = this.state.password;
    if (password !== this.state.passwordConfirm) {
      this.setState({ error: "Password does not match." });
      return;
    }
    this.loginStatus.current.signup(this.state.email, this.state.password,
      () => {
        console.log("Logged in as: ", this.state.email);
      },
      () => {
        this.setState({ error: "Failed to signup" });
      });
  }

  renderSignup() {
    if (this.state.isAuthenticated === null || this.state.isAuthenticated) {
      return (null);
    }
    return (
      <div className="container mt-3">
        <h1>PAML Editor</h1>
        <br />
        <h2>Sign Up</h2>
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
          <br />
          <button type="submit" className="btn btn-primary">Sign up</button>
          <button type="button" className="btn btn-link" onClick={() => this.props.navigate("/login")}>Login</button>
        </form>
      </div>
    );
  }

  render() {
    return (
      <div className="container mt-3">
        <LoginStatus ref={this.loginStatus} onAuthenticationChanged={this.onAuthenticationChanged} />
        {this.renderSignup()}
      </div>
    )
  }
}

export default withRouter(Signup);