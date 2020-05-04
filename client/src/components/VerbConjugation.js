import React from 'react';

const VerbConjugation = (props) => {
    let verbsToPractice = props.verbsToPractice;
    let conjugatedVerbs = props.conjugatedVerbs;

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

    return (
        <div className="editor">
            {verbsToPractice.map((verb, i) => {
                return <div key={i}>
                  <p><strong>{verb} =></strong></p>
                  <span>{displayFullConjugation(verb)}</span>
                </div>
            })}
        </div>
    );
};

export default VerbConjugation;