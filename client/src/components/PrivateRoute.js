import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";

const override = css`
  display: block;
  margin: 0 auto;
  margin-top: 3em;
`;

export const PrivateRoute = ({component: Component, user, loaded, displayForm, setDisplayForm, displayDocumentCards, displayNewDocumentForm,  ...rest}) => {
    
    return (
        <Route {...rest} render={props => (
            !!user
            ? <Component {...props} displayForm={displayForm} setDisplayForm={setDisplayForm} displayDocumentCards={displayDocumentCards} displayNewDocumentForm={displayNewDocumentForm} />
            : loaded
                ? <Redirect to="/login" />
                : (
                <div className="sweet-loading">
                    <ClipLoader
                    css={override}
                    size={100}
                    color={'#ffffff'}
                    />
                </div>
                )  
        )} />
    );
};