import React from "react";
import { withRouter } from "../utils";
import LoginStatus from '../login/LoginStatus';
import { default as Workspace } from "../editor/editor";

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAuthenticated: null
        };

        this.onAuthenticationChanged = this.onAuthenticationChanged.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.loginStatus = React.createRef();
    }

    onAuthenticationChanged(isAuthenticated) {
        if (!isAuthenticated) {
            this.props.navigate("/login");
        }
        this.setState({ isAuthenticated: isAuthenticated });
    }

    onLogout() {
        this.loginStatus.current.logout();
    }

    renderEditor() {
        if (this.state.isAuthenticated === null) {
            return (null);
        }
        return (
            <Workspace onLogout={this.onLogout} currentUser={this.loginStatus.current.state.user} />
        )
    }

    render() {
        return (
            <div className="container mt-3">
                <LoginStatus ref={this.loginStatus} onAuthenticationChanged={this.onAuthenticationChanged} />
                {this.renderEditor()}
            </div>
        )
    }
}

export default withRouter(Editor);