import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, Route } from 'react-router-dom';
import { createEditor } from 'slate';
import { withReact} from 'slate-react';
import { withHistory } from 'slate-history';
import io from 'socket.io-client';
import { withHtml } from './withHtml';
import { SyncingEditor } from './SyncingEditor';

const socket = io('');

export const GroupEditor = (props) => {
    const [value, setValue] = useState([]);
    const editor = useMemo(() => withHistory(withHtml(withReact(createEditor()))), [])
    const groupId = props.match.params.id;

    useEffect(() => {
        console.log("Mounting...");
        socket.emit('group-id', groupId);
      
        socket.on(`initial-value-${groupId}`, (value) => {
          console.log('Initial value received');
          setValue(value);
        });
    
        socket.on(`new-remote-operations-${groupId}`, ({editorId, ops, value}) => {
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
          socket.off(`new-remote-operations-${groupId}`);
          socket.disconnect();
        };
    }, []);
    
    return (
        <div className="main">
            <h3 className="title">Document: {groupId}</h3>
            <section className ="navbar">
                <NavLink to={`/group/${groupId}`}><h4>Main</h4></NavLink>
                <NavLink to={`/group/${groupId}/theory`}><h4>Theory</h4></NavLink>
                <NavLink to={`/group/${groupId}/practice`}><h4>Practice</h4></NavLink>
            </section>
            <section>
                <Route exact path={`/group/${groupId}`}>
                    <SyncingEditor groupId={groupId} value={value} setValue={setValue} editor={editor} socket={socket}/>
                </Route>
                <Route exact path={`/group/${groupId}/theory`}>
                    <section>
                        <h4 className="theoryTitle"> Theory Summary </h4>
                        <div className="theoryEditor">
                            {value.map((text,i) => {
                            return <p key={i}>{text.children.map((element, j) => {
                                if (element.theory) {
                                return <span key={j}>{element.text}</span>;
                                }
                                return '';
                            })}</p>
                            })}
                        </div>   
                    </section>
                </Route>
            </section>            
        </div>
    );
};