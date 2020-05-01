import React, { useEffect, useState } from 'react';

const VerbPractice = (props) => {
    let value = props.value;
    let socket = props.socket;
    let docId = props.docId;

    const [verbsToPractice, setVerbsToPractice] = useState([]);
    const [conjugatedVerbs, setConjugatedVerbs] = useState([]);

    useEffect(() => {
        let verbsToPracticeValue = [];
        value.forEach((text,i) => {
            let verbsToPractice = text.children.filter((element) => element.verb);
            verbsToPractice.forEach(element => {
                let verb = element.text;
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

    }, [value, docId, socket, conjugatedVerbs]);

    useEffect(() => {
        socket.on(`new-conjugation-data-${docId}`, (serverConjugations) => {
            console.log('Conjugations received');
            setConjugatedVerbs(serverConjugations);
        });
    }, [docId, socket]);

    const displayConjugation = (verb) => {
        let conjugation = conjugatedVerbs[verb];
        if (typeof conjugation === 'string') {
            return conjugation;
        } else {
            return "Loading..."
        }
    }

    return (
        <div>
            {verbsToPractice.map((verb, i) => {
                return <div key={i}>
                  <p><strong>{verb} =></strong></p>
                  <p>{displayConjugation(verb)}</p>
                </div>
            })}
        </div>
    );
};

export default VerbPractice;