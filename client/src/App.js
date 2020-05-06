import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import { DocumentEditor } from './components/DocumentEditor';
import { DocumentCard } from './components/DocumentCard';
import { PrivateRoute } from './components/PrivateRoute';
import { Main } from './components/Main';
import io from 'socket.io-client';
import { firebaseConfig } from './firebaseConfig';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

const firebase = require('firebase');
const supportedLanguages = ['Spanish', 'French', 'Portuguese', 'Italian', 'Romanian'];
const socket = io('');

firebase.initializeApp(firebaseConfig);
var uiConfig = {
  signInSuccessUrl: '/',
  signInFlow: 'popup',
  signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
};

const App = () => {
  const [userDocuments, setUserDocuments] = useState([]);
  const [displayForm, setDisplayForm] = useState(false);
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      console.log(`User connected`);
      setUser(user);
      setLoaded(true);
      console.log(user);
    });
  }, []);

  const displayDocumentCards = () => {
    return userDocuments.map((document, i) => {
      return <DocumentCard key={i} document={document}></DocumentCard>
    })
  };

  const createNewDocument = (e) => {
    e.preventDefault();

    let newDocument = { 
      uniqueId: (new Date()).getTime(),
      name: e.target.documentName.value,
      language: e.target.language.value,
      createdBy: user.email,
      user: user.uid 
    };

    console.log(newDocument)
    
    setDisplayForm(false)
    e.target.reset()

    socket.emit('new-document', newDocument)
    // setUserDocuments([...userDocuments, newDocument]);
  }

  const displayNewDocumentForm = () => {
    return <div> 
      <div className="transparentLayer"></div>
      <section className="newDocumentForm">
        <h3>New Document</h3>
        <form className="form" onSubmit={createNewDocument} autoComplete="off">
          <label htmlFor="documentName">Document name:</label>
          <input type="text" id="documentName" required></input>
          <label>Language: </label>
          <div className="formLanguages">
            {supportedLanguages.map((language, i) => {
              return <div key={i}>
                <input type="radio" id={language} name="language" value={language} required></input>
                <label htmlFor={language}>{language}</label><br></br>
              </div>
            })}
          </div>
          <div className="submitButtons">
            <input className="button" type="submit" id="submit"></input>
            <button className="button" onClick={() => setDisplayForm(false)}>Cancel</button>
          </div>
        </form>
      </section> 
    </div>          
  }

  useEffect(() => {
    if (!user) return;
    console.log('Requesting documents')
    socket.emit('request-initial-documents', user.uid);

    socket.on('initial-documents', (documentData) => {
      let documentsArray = [];
      Object.keys(documentData).forEach((documentId) => {
        let document = documentData[documentId];
        document.uniqueId = documentId;
        documentsArray.push(document);
      });
      setUserDocuments([...documentsArray])
    });
  }, [user])

  // TODO replace once the proper admin interface in the server has been set up
  useEffect(() => {
    if (!user) return;
    console.log('Sending user data')
    socket.emit('new-user', user);
  }, [user])

  useEffect(() => {
    socket.on(`new-document-from-server`, (data) => {
      console.log('New document received');
      // console.log(data);
      let document = data.document;
      document.uniqueId = data.id;

      // console.log(userDocuments);
      setUserDocuments([...userDocuments, document]);
      // console.log(userDocuments);
    });

    return () => {
      socket.off(`new-document-from-server`);
    };

  }, [userDocuments])

  return (
    <div className="App">
      <BrowserRouter>
        <PrivateRoute
          exact
          path={'/'}
          component={Main}
          user={user}
          loaded={loaded}
          displayForm={displayForm} 
          setDisplayForm={setDisplayForm}
          displayDocumentCards={displayDocumentCards}
          displayNewDocumentForm={displayNewDocumentForm}
        />
        <Route exact path ='/login'>
          <section className="loginTitle">
            <h3>Access to the following page requires to log in:</h3>
          </section>
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        </Route>
        <Route path="/document/:uniqueId" render={props => <DocumentEditor {...props} socket={socket} />} />
      </BrowserRouter>
    </div>   
  );
}

export default App;