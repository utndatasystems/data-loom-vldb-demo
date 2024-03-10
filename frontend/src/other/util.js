import React from 'react';
import { useNavigate, useParams } from "react-router-dom";

// ------------------------------------------------------------------------------------
// These functions are used to enable navigation and parameter for my ReactComponents inside of Routers

export const withNavigation = (Component) => {
    return props => <Component {...props} navigate={useNavigate()} />;
}

export const withParams = (Component) => {
    return props => <Component {...props} params={useParams()} />;
}

export const withParamsAndNavigation = (Component) => {
    return props => <Component {...props} params={useParams()} navigate={useNavigate()} />;
}