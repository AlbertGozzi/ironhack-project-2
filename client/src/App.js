import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route} from 'react-router-dom';
import { DocumentEditor } from './components/DocumentEditor';
import { DocumentCard } from './components/DocumentCard';
import io from 'socket.io-client';

const supportedLanguages = ['Spanish', 'French', 'Portuguese', 'Italian', 'Romanian'];
const socket = io('');

const App = () => {
  const [userDocuments, setUserDocuments] = useState([]);
  const [displayForm, setDisplayForm] = useState(false);

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
      createdBy: socket.id
    };
    
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
          <input className="formSubmit" type="submit" id="submit"></input>
        </form>
      </section> 
    </div>          
  }

  useEffect(() => {
    console.log('Requesting documents')
    socket.emit('request-initial-documents', (''));

    socket.on('initial-documents', (documentData) => {
      let documentsArray = [];
      Object.keys(documentData).forEach((documentId) => {
        let document = documentData[documentId];
        document.uniqueId = documentId;
        document.createdBy = document.users[0];
        documentsArray.push(document);
      });
      setUserDocuments((userDocuments) => [...userDocuments, ...documentsArray])
    });
  }, [])

  useEffect(() => {
    socket.on(`new-document-from-server`, (data) => {
      console.log('New document received');
      // console.log(data);
      let document = data.document;
      document.uniqueId = data.id;
      document.createdBy = document.users[0];

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
        <Route exact path ='/'>
          <section className="allDocumentsTitle">
            <h2><strong>My Documents</strong></h2>
            <button className="button" onClick={() => setDisplayForm(true)}>Create new document</button>
          </section>
          <section className="allDocuments">
            {displayDocumentCards()}
          </section>
          {displayForm ? displayNewDocumentForm() : ''}
        </Route>
        <Route path="/document/:uniqueId" render={props => <DocumentEditor {...props} socket={socket} />} />
      </BrowserRouter>

    </div>   
  );
}

export default App;