import React from "react";
import { Row, Col } from "react-bootstrap"
import { withRouter, queryLoginStatus } from "../utils";
import LoginStatus from '../login/LoginStatus';
import DisclaimerModal from "../editor/DisclaimerModal"

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
      isAuthenticated: null,
      disclaimerVisible: true
    };
    this.whoami = this.whoami.bind(this);

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.onAuthenticationChanged = this.onAuthenticationChanged.bind(this);
    this.onDisclaimer = this.onDisclaimer.bind(this);
    this.onDisclaimerDone = this.onDisclaimerDone.bind(this);

    this.loginStatus = React.createRef();
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  onAuthenticationChanged(isAuthenticated) {
    this.setState({ isAuthenticated: isAuthenticated });
    if (isAuthenticated) {
      this.props.navigate("/editor");
    }
  }

  onDisclaimerDone() {
    this.setState({ disclaimerVisible: null })
  }
  onDisclaimer() {
    this.setState({ disclaimerVisible: true })
  }

  whoami() {
    queryLoginStatus((data) => {
      console.log("You are logged in as: " + data.email);
    });
  }

  login(event) {
    event.preventDefault();
    this.loginStatus.current.login(this.state.email, this.state.password,
      () => {
        console.log("Logged in as: ", this.state.email);
        this.setState({ email: "", password: "", error: "" });
      },
      () => {
        this.setState({ error: "Invalid email or password." });
      });
  }

  logout() {
    this.loginStatus.current.logout(() => {
      console.log("Logging out");
      this.setState({ email: "", password: "", error: "" });
    });
  }

  renderLogin() {
    if (this.state.isAuthenticated === null) {
      return (null);
    }
    if (this.state.isAuthenticated) {
      return (
        <div className="container">
          {/* <h1>React Cookie Auth</h1>
          <p>You are logged in!</p>
          <button className="btn btn-primary mr-2" onClick={this.whoami}>WhoAmI</button>
          <button className="btn btn-danger" onClick={this.logout}>Log out</button> */}
        </div>
      );
    }

    return (
      <div className="container">
        <h1>LabOP Editor</h1>
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
          <br />
          <button type="submit" className="btn btn-primary">Login</button>
          <button type="button" className="btn btn-link" onClick={() => this.props.navigate("/signup")}>Sign up</button>
        </form>
      </div>
    );
  }

  render() {
    return (
      <Col>
        <Row md={8}>
          <div className="container mt-3">
            <LoginStatus ref={this.loginStatus} onAuthenticationChanged={this.onAuthenticationChanged} />
            {this.renderLogin()}
          </div>
        </Row>
        <Row></Row>
        <Row md={8}>
          <DisclaimerModal
            show={this.state.disclaimerVisible !== null}
            handleDone={() => this.onDisclaimerDone()}
          />
        </Row>
      </Col>
    );
  }
}

export default withRouter(Login);