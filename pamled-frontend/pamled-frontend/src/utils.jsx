import React from "react";
import { 
    useLocation,
    useNavigate,
} from "react-router-dom";

export function withRouter( Component ) {
  return ( props ) => {
    const location = useLocation();
    const navigate = useNavigate();
    return <Component { ...props } navigate={ navigate } location={ location } />;
  }
}