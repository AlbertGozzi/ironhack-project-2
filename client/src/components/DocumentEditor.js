import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, NavLink, Route } from 'react-router-dom';
import { createEditor, Editor } from 'slate';
import { withReact} from 'slate-react';
import { withHistory } from 'slate-history';
import { withHtml } from './withHtml';
import { SyncingEditor } from './SyncingEditor';
import CheatsheetSummary from './CheatsheetSummary';
import TranslationSideBar from './TranslationSideBar';
import VerbPractice from './VerbPractice';
import VerbConjugation from './VerbConjugation'


export const DocumentEditor = (props) => {
    const [value, setValue] = useState([]);
    const [verbsToPractice, setVerbsToPractice] = useState([]);
    const [conjugatedVerbs, setConjugatedVerbs] = useState([]);
    const [displayShare, setDisplayShare] = useState(false);
    const editor = useMemo(() => withHistory(withHtml(withReact(createEditor()))), [])
    const docId = props.match.params.docId;
    const socket = props.socket;
    const docLanguage = useRef([]);
    const conjugationStructure = useRef([]);
    const documentName = useRef([]);

    // On connection, request initial data and add listener for new operations in other editors
    useEffect(() => {
      console.log("Mounting...");
      
      socket.emit('request-initial-data', docId);
    
      socket.on(`initial-value-${docId}`, (data) => {
        console.log('Initial value received');
        setValue(data.value);
        conjugationStructure.current = data.languageConjugationStructure;
        documentName.current = data.name;
        docLanguage.current = data.language;
      });
  
      socket.on(`new-remote-operations-${docId}`, ({editorId, ops, value}) => {
        if (socket.id !== editorId) {
          console.log('Receiving operation');
          try {
            console.log('Applying operation - Remote');
            Editor.withoutNormalizing(editor, () => {
              ops.forEach(op => editor.apply(op));
            })
          } 
          catch (err) {
            console.log('Hardcoding operation - Remote'); //TODO Review
            setValue(value);
          }
        }
      });
  
      return () => {
        console.log("Unmounting...");
        socket.off(`initial-value-${docId}`);
        socket.off(`new-remote-operations-${docId}`);
      };
    }, [docId, editor, socket]);
  
    // Every time a new verb is received, add it to the verbsToPractice array
    useEffect(() => {
      let verbsToPracticeValue = [];
      value.forEach((text,i) => {
          let verbsToPractice = text.children.filter((element) => element.verb);
          verbsToPractice.forEach(element => {
              let verb = element.text.toLowerCase();
              verbsToPracticeValue.push(verb);
              if (!conjugatedVerbs[verb]) {
                  let data = {
                      verb: verb,
                      docId: docId,
                      language: docLanguage.current
                  }
                  socket.emit('new-verb-to-conjugate', data);
              }
          });
      });
      setVerbsToPractice([...verbsToPracticeValue]);

    }, [value, docId, conjugatedVerbs, setVerbsToPractice, socket]);

    // Every time a new verb is received, add it to the conjugatedVerbs array
    useEffect(() => {
      socket.on(`new-conjugation-data-${docId}`, (serverConjugations) => {
          console.log('Conjugations received');
          // console.log(serverConjugations);
          setConjugatedVerbs(serverConjugations);
      });
    }, [docId, setConjugatedVerbs, socket]);

    // Display the form to add a new user after pressing the 'Share' button
    const displayAddUserForm = () => {
      return <div> 
        <div className="transparentLayer"></div>
        <section className="newDocumentForm">
          <h3>Add a new user to document</h3>
          <form className="form" onSubmit={addNewUserToDoc} autoComplete="off">
            <label htmlFor="usersEmail">Users email:</label>
            <input type="email" id="usersEmail" required></input>
            <div className="submitButtons">
              <input className="button" type="submit" id="submit"></input>
              <button className="button" onClick={() => setDisplayShare(false)}>Cancel</button>
            </div>
          </form>
        </section> 
      </div>          
    }
    
    // Manage the addition of a new user after a person submits the new user form from 'Share'
    const addNewUserToDoc = (e) => {
      e.preventDefault();

      let data = {
        docId: docId,
        userEmail: e.target.usersEmail.value,
      }
        
      setDisplayShare(false)
      e.target.reset()

      //TODO: Add validation for user existing?

      socket.emit('new-user-in-document', data)
    }
    
    return (
        <div>

          <div className="leftPanel">
            <Link to={`/`}><p><span>&#8592; </span>to All Documents</p></Link>
          </div>

          <div className="main">
              <section className="title">
                <h4><strong>Document: </strong>{documentName.current}</h4>
                <h4><strong>Language: </strong>{docLanguage.current}</h4>
                <button className="button" onClick={() => setDisplayShare(true)}>Share</button>
              </section>
              <section className ="navbar">
                  <NavLink to={`/document/${docId}/main`}><h4>Main</h4></NavLink>
                  <NavLink to={`/document/${docId}/cheatsheets`} ><h4>Cheatsheets</h4></NavLink>
                  <NavLink to={`/document/${docId}/verbpractice`}><h4>Verb Practice</h4></NavLink>
              </section>
              <section>
                  <Route exact path={`/document/${docId}/main`}>
                    <SyncingEditor docId={docId} value={value} setValue={setValue} editor={editor} socket={socket}/>
                  </Route>

                  <Route path={`/document/${docId}/cheatsheets`} >
                    <section className ="navbar secondaryNavbar">
                      <NavLink exact to={`/document/${docId}/cheatsheets`}><h4>Main Summary</h4></NavLink>
                      <NavLink to={`/document/${docId}/cheatsheets/verb-conjugation`}><h4>Verb Conjugation</h4></NavLink>
                    </section>
                  </Route>
                  <Route exact path={`/document/${docId}/cheatsheets/verb-conjugation`} >
                    <VerbConjugation verbsToPractice={verbsToPractice} conjugatedVerbs={conjugatedVerbs} language={docLanguage} conjugationStructure={conjugationStructure}/>
                  </Route>
                  <Route exact path={`/document/${docId}/cheatsheets`}>
                    <CheatsheetSummary value={value} />
                  </Route>

                  <Route exact path={`/document/${docId}/verbpractice`}>
                    <VerbPractice conjugationStructure={conjugationStructure} conjugatedVerbs={conjugatedVerbs} setConjugatedVerbs={setConjugatedVerbs} language={docLanguage}/>
                  </Route>

              </section>            
          </div>
          
          <div className="rightPanel">
            <Route exact path={`/document/${docId}/main`}>
              <TranslationSideBar docId={docId} value={value} socket={socket}/>
            </Route>
          </div>

          {displayShare ? displayAddUserForm() : ''}
          
        </div>  
    );
};