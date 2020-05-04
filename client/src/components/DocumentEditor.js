import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, NavLink, Route } from 'react-router-dom';
import { createEditor } from 'slate';
import { withReact} from 'slate-react';
import { withHistory } from 'slate-history';
import io from 'socket.io-client';
import { withHtml } from './withHtml';
import { SyncingEditor } from './SyncingEditor';
import CheatsheetSummary from './CheatsheetSummary';
import TranslationSideBar from './TranslationSideBar';
import VerbPractice from './VerbPractice';
import VerbConjugation from './VerbConjugation'

const socket = io('');

export const DocumentEditor = (props) => {
    const [value, setValue] = useState([]);
    const [verbsToPractice, setVerbsToPractice] = useState([]);
    const [conjugatedVerbs, setConjugatedVerbs] = useState([]);
    const editor = useMemo(() => withHistory(withHtml(withReact(createEditor()))), [])
    const docId = props.match.params.id;
    const docLanguage = 'French';
    const conjugationStructure = useRef([]);

    useEffect(() => {
        console.log("Mounting...");
        const initialData = {
          docId: docId,
          docLanguage: docLanguage
        };
        socket.emit('initial-data', initialData);
      
        socket.on(`initial-value-${docId}`, (data) => {
          console.log('Initial value received');
          setValue(data.value);
          conjugationStructure.current = data.languageConjugationStructure;
        });
    
        socket.on(`new-remote-operations-${docId}`, ({editorId, ops, value}) => {
          if (socket.id !== editorId) {
            console.log('Receiving operation');
            try {
              console.log('Trying to apply operation - Remote');
              ops.forEach(op => editor.apply(op));
            } 
            catch (err) {
              console.log('Tying to apply operation - Remote - Hardcoded'); //TODO Review
              try { 
                setValue(value);
              }
              catch (err) {
                console.log(`Error. Too many operations at the same time! ${err}`)
              }
            }
          }
        });
    
        return () => {
          console.log("Unmounting...");
          socket.off(`new-remote-operations-${docId}`);
          socket.disconnect();
        };
    }, [docId, editor]);

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
                      docId: docId
                  }
                  socket.emit('new-verb-to-conjugate', data);
              }
          });
      });

      setVerbsToPractice([...verbsToPracticeValue]);

    }, [value, docId, conjugatedVerbs, setVerbsToPractice]);

    useEffect(() => {
        socket.on(`new-conjugation-data-${docId}`, (serverConjugations) => {
            console.log('Conjugations received');
            // console.log(serverConjugations);
            setConjugatedVerbs(serverConjugations);
        });
    }, [docId, setConjugatedVerbs]);
    
    return (
        <div>
          <div className="leftPanel">
            <Link to={`/`}><p><span>&#8592; </span>to All Documents</p></Link>
          </div>
          <div className="main">
              <section className="title">
                <h4><strong>Document: </strong>{docId}</h4>
                <h4><strong>Language: </strong>{docLanguage}</h4>
                <button className="button">Share</button>
              </section>
              <section className ="navbar">
                  <NavLink to={`/document/${docId}/main`}><h4>Main</h4></NavLink>
                  <NavLink to={`/document/${docId}/cheatsheets/main-summary`}><h4>Cheatsheets</h4></NavLink>
                  <NavLink to={`/document/${docId}/verbpractice`}><h4>Verb Practice</h4></NavLink>
              </section>
              <section>
                  <Route exact path={`/document/${docId}/main`}>
                    <SyncingEditor docId={docId} value={value} setValue={setValue} editor={editor} socket={socket}/>
                  </Route>

                  <Route path={`/document/${docId}/cheatsheets`} >
                    <section className ="navbar secondaryNavbar">
                      <NavLink to={`/document/${docId}/cheatsheets/main-summary`}><h4>Main Summary</h4></NavLink>
                      <NavLink to={`/document/${docId}/cheatsheets/verb-conjugation`}><h4>Verb Conjugation</h4></NavLink>
                    </section>
                  </Route>
                  <Route exact path={`/document/${docId}/cheatsheets/main-summary`}>
                    <CheatsheetSummary value={value} />
                  </Route>
                  <Route exact path={`/document/${docId}/cheatsheets/verb-conjugation`} >
                    <VerbConjugation verbsToPractice={verbsToPractice} conjugatedVerbs={conjugatedVerbs}/>
                  </Route>

                  <Route exact path={`/document/${docId}/verbpractice`}>
                    <VerbPractice conjugationStructure={conjugationStructure} conjugatedVerbs={conjugatedVerbs} setConjugatedVerbs={setConjugatedVerbs}/>
                  </Route>

              </section>            
          </div>
          <div className="rightPanel">
            <Route exact path={`/document/${docId}/main`}>
              <TranslationSideBar docId={docId} value={value} socket={socket}/>
            </Route>
          </div>
        </div>  
    );
};