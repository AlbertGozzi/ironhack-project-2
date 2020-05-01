import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, Route } from 'react-router-dom';
import { createEditor } from 'slate';
import { withReact} from 'slate-react';
import { withHistory } from 'slate-history';
import io from 'socket.io-client';
import { withHtml } from './withHtml';
import { SyncingEditor } from './SyncingEditor';
import TheorySummary from './TheorySummary';
import TranslationSideBar from './TranslationSideBar';
import VerbPractice from './VerbPractice';

const socket = io('');

export const DocumentEditor = (props) => {
    const [value, setValue] = useState([]);
    const editor = useMemo(() => withHistory(withHtml(withReact(createEditor()))), [])
    const docId = props.match.params.id;

    useEffect(() => {
        console.log("Mounting...");
        socket.emit('doc-id', docId);
      
        socket.on(`initial-value-${docId}`, (value) => {
          console.log('Initial value received');
          setValue(value);
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

    return (
        <div>
          <div className="main">
              <h3 className="title"><strong>Document: </strong>{docId}</h3>
              <section className ="navbar">
                  <NavLink to={`/document/${docId}/main`}><h4>Main</h4></NavLink>
                  <NavLink to={`/document/${docId}/theory`}><h4>Theory</h4></NavLink>
                  <NavLink to={`/document/${docId}/verbpractice`}><h4>Verb Practice</h4></NavLink>
              </section>
              <section>
                  <Route exact path={`/document/${docId}/main`}>
                    <SyncingEditor docId={docId} value={value} setValue={setValue} editor={editor} socket={socket}/>
                  </Route>
                  <Route exact path={`/document/${docId}/theory`}>
                    <TheorySummary value={value} />
                  </Route>
                  <Route exact path={`/document/${docId}/verbPractice`}>
                    <VerbPractice docId={docId} value={value} socket={socket} />
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