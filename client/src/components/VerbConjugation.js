import React from 'react';

const VerbConjugation = (props) => {
    let verbsToPractice = props.verbsToPractice;
    let conjugatedVerbs = props.conjugatedVerbs;
    let conjugationStructure = props.conjugationStructure;
    let language = props.language;

    const displayFullConjugation = (verb) => {
        let conjugation = conjugatedVerbs[verb];
        try {
            let conjugatesAs = conjugation._name.toString();
            let ending = conjugatesAs.slice(conjugatesAs.indexOf(':') + 1); 
            let root = verb.replace(ending, '');
            return <div>
                {Object.keys(conjugation).map((mode, i) => {
                    if (mode === "_name" ) {return <p key={i}><strong>Conjugates as: </strong>{conjugation[mode].replace(':','')}</p>}
                    if (mode === "_xmlns" ) {return '' }
                    let modeConjugation = conjugation[mode];
                    return <span key={i}><strong>{mode}</strong><ul>
                        {Object.keys(modeConjugation).map((time, j) => {
                            if (time === '_xmlns') { return '' }
                            let timeConjugation = modeConjugation[time];
                            return <li key={j}>{time}<ul>
                                {timeConjugation.p.map((person, k) => {
                                    let ending = '';
                                    switch (language.current) {
                                        case 'Portuguese':
                                            ending = person.i;
                                            break;
                                        case 'Spanish': case 'French':
                                            ending = person.i[0];
                                            break;
                                        case 'Italian':
                                            ending = person.i.__text;
                                            break;
                                        case 'Romanian':
                                            ending = person.i[0].__text;
                                            break;
                                        default:
                                            console.log("Error: language not found")
                                    }
                                    let personName = conjugationStructure.current.persons[timeConjugation.p.length][k];
                                    if (timeConjugation.p.length === 1) {personName = ''};
                                    return <li key={k}>{personName} <strong>{root}{ending}</strong></li>
                                })}
                            </ul></li>
                        })}
                    </ul></span>
                })}
            <hr></hr></div>;
        }
        catch (err) {
            console.log(err);
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