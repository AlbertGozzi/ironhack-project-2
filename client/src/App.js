import React from 'react';
import './App.css';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { DocumentEditor } from './components/DocumentEditor';

const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Route 
          path="/" 
          exact 
          render={() => {
            return <Redirect to={`/document/sampledoc/main`}/>;
          }}
        />
        <Route path="/document/:id" render={props => <DocumentEditor {...props} />} />
      </BrowserRouter>

    </div>   
  );
}

export default App;