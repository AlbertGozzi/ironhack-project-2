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

const supportedLanguages = ['Spanish', 'French', 'Portuguese', 'Italian', 'Romanian'];

// Firebase configuration
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);
var uiConfig = {
  signInSuccessUrl: '/',
  signInFlow: 'popup',
  signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
};

const socket = io('');

const App = () => {
  const [userDocuments, setUserDocuments] = useState([]);
  const [displayForm, setDisplayForm] = useState(false);
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Set up a listener to update the value of the 'User' state whenever a user connects
  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      console.log(`User connected`);
      setUser(user);
      setLoaded(true);
    });
  }, []);

  // When a new user connects, send the user data to the server to have a list with all the users
  // TODO replace once the proper admin interface in the server has been set up
  useEffect(() => {
    if (!user) return;
    console.log('Sending user data')
    socket.emit('new-user', user);
  }, [user])

  // When a user connects, send a new message to the server to retrieve all the documents for that user
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

  // Displays all the documents in the main site
  const displayDocumentCards = () => {
    return userDocuments.map((document, i) => {
      return <DocumentCard key={i} document={document}></DocumentCard>
    })
  };

  // Displays the JSX for the new document form
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
  
  // Creates new document once the submit button is clicked in the new document form
  const createNewDocument = (e) => {
    e.preventDefault();

    let newDocument = { 
      uniqueId: (new Date()).getTime(),
      name: e.target.documentName.value,
      language: e.target.language.value,
      createdBy: user.email,
      user: user.uid 
    };

    console.log(`New document: ${newDocument}`)
    
    setDisplayForm(false)
    e.target.reset()

    socket.emit('new-document', newDocument)
    // setUserDocuments([...userDocuments, newDocument]);
  }

  // After creating a new document and sending data to server, handle the response from the server (which appended extra information such as conjugations)
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

        {/* Main route that displays all the documents */}
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

        {/* Simple login page with firebase UI */}
        <Route exact path ='/login'>
          <section className="loginTitle">
            <h3>Access to the following page requires to log in:</h3>
          </section>
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        </Route>

        {/* Route for each individual document */}
        <Route path="/document/:uniqueId" render={props => <DocumentEditor {...props} socket={socket} />} />
        
      </BrowserRouter>
    </div>   
  );
}

export default App;