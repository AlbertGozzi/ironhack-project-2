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
            console.log(`Modes`)
            console.log(Object.keys(conjugation));
            return <div>
                {Object.keys(conjugation).map((mode, i) => {
                    if (mode === "_name") {return <p key={i}><strong>Conjugates as: </strong>{conjugation[mode].replace(':','')}</p>}
                    let modeConjugation = conjugation[mode];
                    console.log(`Mode`)
                    console.log(modeConjugation)
                    console.log(`Times`)
                    console.log(Object.keys(modeConjugation))
                    return <span key={i}><strong>{mode}</strong><ul>
                        {Object.keys(modeConjugation).map((time, j) => {
                            let timeConjugation = modeConjugation[time];
                            console.log(`Time`)
                            console.log(timeConjugation)
                            console.log(timeConjugation.p)
                            return <li key={j}>{time}<ul>
                                {timeConjugation.p.map((person, k) => {
                                    {/* return <li key={k}>{`${k + 1}: `}{root}{person.i}</li> */} // Portuguese
                                    {/* return <li key={k}>{`${k + 1}: `}{root}{person.i[0]}</li> // Spanish, French */}
                                    return <li key={k}>{`${k + 1}: `}{root}{person.i.__text}</li> // Italian
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