import React, { useState, useEffect, useRef } from 'react';

const VerbPractice = (props) => {
    let conjugationStructure = props.conjugationStructure;
    let conjugatedVerbs = props.conjugatedVerbs;
    let [currentConjugation, setCurrentConjugation] = useState([]);
    let [answerMessage, setAnswerMessage] = useState([]);
    const inputRef = useRef(null);
    const specialCharacters = useRef(null);

    const getConjugation = (verb, mode, time, person) => {
        let conjugation = conjugatedVerbs[verb];
        if (conjugation === 'Verb not found') return conjugation;
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

    const getRandomConjugation = () => {
        if (!conjugationStructure.current.modes) { return }

        let modes = conjugationStructure.current.modes;
        let randomModeIndex = Math.floor(Math.random() * modes.length);
        let randomMode = modes[randomModeIndex];

        let randomTimeIndex = Math.floor(Math.random() * randomMode.times.length);
        let randomTime = randomMode.times[randomTimeIndex];

        let randomPerson = Math.floor(Math.random() * randomTime.persons);
        let personName = conjugationStructure.current.persons[randomTime.persons][randomPerson];

        let availableVerbs = Object.keys(conjugatedVerbs);
        let randomVerb = availableVerbs[Math.floor(Math.random() * availableVerbs.length)];

        if(!randomVerb) { return }

        let randomConjugation = {
            mode: randomMode.name,
            time: randomTime.name,
            person: randomPerson + 1,
            personName: personName,
            verb: randomVerb
        }

        return randomConjugation;
    }

    const displayRandomVerb = (conjugation) => {
        if (!conjugation?.mode) {return <p className='verbToConjugate'>No verbs to conjugate! Please go to the Main section and select a new verb to conjugate.</p>}
        return <div className='verbToConjugate'>
            <p>{toTitleCase(conjugation.mode)} {toTitleCase(conjugation.time)}</p>
            <p>{conjugation.personName}</p>
            <p>{toTitleCase(conjugation.verb)}</p>
            {/* <p>{getConjugation(conjugation.verb, conjugation.mode, conjugation.time, conjugation.person)}</p> */}
        </div>
    }

    const toTitleCase = (str) => {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    useEffect(() => {
        setCurrentConjugation(getRandomConjugation());
    }, [conjugationStructure, conjugatedVerbs])

    const checkAnswer = () => {
        let rightAnswer = getConjugation(currentConjugation.verb, currentConjugation.mode, currentConjugation.time, currentConjugation.person);
        let attempt = inputRef.current?.value;

        if (specialCharacters.current.checked) {rightAnswer = rightAnswer.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}

        if (attempt.toLowerCase() === rightAnswer) { 
            setAnswerMessage(<div className='verbConjugationAnswer correct'> Correct! :) </div>);
            setCurrentConjugation(getRandomConjugation());
            inputRef.current.value = '';
        } else {
            setAnswerMessage(<div className='verbConjugationAnswer incorrect'> Incorrect :( Please try again. </div>);
            console.log(`Right answer: ${rightAnswer}`)
        }
    }

    return (
        <div >
            <br></br>
            {displayRandomVerb(currentConjugation)}
            <input ref={inputRef} className="verbPracticeInput" placeholder="Your answer here." onKeyPress={event => {if (event.key === 'Enter') {checkAnswer()}}}></input>
            <div className="buttonCheckboxGroup">
                <button className="button verbPracticeButton" onClick={checkAnswer}>Check Answer</button>
                <input type="checkbox" id="ignore-characters" ref={specialCharacters} value="randomValue"></input>
                <label htmlFor="ignore-characters">Ignore accents/special characters</label> 
            </div>
            {answerMessage}
        </div>
    );
};

export default VerbPractice;