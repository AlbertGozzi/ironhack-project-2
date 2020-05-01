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

    const displayFullConjugation = (verb) => {
        let conjugation = conjugatedVerbs[verb];
        try {
            let conjugatesAs = conjugation._name.toString();
            let ending = conjugatesAs.slice(conjugatesAs.indexOf(':') + 1); 
            let root = verb.replace(ending, '');
            return <div>
                {Object.keys(conjugation).map((mode, i) => {
                    if (mode === "_name") {return <p><strong>Conjugates as: </strong>{conjugation[mode].replace(':','')}</p>}
                    let modeConjugation = conjugation[mode];
                    return <span><strong>{mode}</strong><ul>
                        {Object.keys(modeConjugation).map((time, j) => {
                            let timeConjugation = modeConjugation[time];
                            return <li>{time}<ul>
                                {timeConjugation.p.map((person, k) => {
                                    return <li>{`${k + 1}: `}{root}{person.i[0]}</li>
                                })}
                            </ul></li>
                        })}
                    </ul></span>
                })}
            <hr></hr></div>;
        }
        catch {
            return "Loading..."; 
        }
    }

    const getConjugation = (verb, mode, time, person) => {
        let conjugation = conjugatedVerbs[verb];
        try {
            let conjugatesAs = conjugation._name.toString();
            let ending = conjugatesAs.slice(conjugatesAs.indexOf(':') + 1); 
            let root = verb.replace(ending, '');    
            return root.concat(conjugation[mode][time].p[person-1].i[0]);
        }
        catch {
            return "Loading..."
        }
    }

    return (
        <div className="theoryEditor">
            {verbsToPractice.map((verb, i) => {
                return <div key={i}>
                  <p><strong>{verb} =></strong></p>
                  <p>{getConjugation(verb, 'Indicatif', 'présent', 1)}</p>
                </div>
            })}
        </div>
    );
};

export default VerbPractice;