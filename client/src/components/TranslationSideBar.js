import React, {useRef, useEffect, useState} from 'react';
const TranslationSideBar = (props) => {
    let value = props.value;
    let socket = props.socket;
    let docId = props.docId;

    const translatedTexts = useRef([]);
    const [placeholder, forceState] = useState([]);
    const translations = useRef({});

    useEffect(() => {
        let translatedTextsValue = [];
        value.forEach((text,i) => {
            let textsToTranslate = text.children.filter((element) => element.translate);
            textsToTranslate.forEach(element => {
                let text = element.text;
                translatedTextsValue.push(text);
            })
        })

        translatedTexts.current = [...translatedTextsValue];
        forceState(translatedTextsValue);

        translatedTexts.current.forEach(text => {
            if (!translations[text]) {
                // console.log(translateTextWithModel('Bonjour! Comment allez vous?', 'en'));
                let data = {
                    text: text,
                    docId: docId
                }
                socket.emit('new-text-to-translate', data);
                // translations.current[text] = 'Translation';
            }
        })
    }, [value])

    useEffect(() => {
        socket.on(`new-translation-data-${docId}`, (serverTranslations) => {
            console.log('Translations received');
            translations.current = serverTranslations;
            forceState(serverTranslations);
        });
    }, [socket])
    
    const displayTranslation = (text) => {
        let translation = translations.current[text];
        if (typeof translation === 'string') {
            return translation;
        } else {
            return "Loading..."
        }
    }

    return (
        <div>
            {translatedTexts.current.map((text, i) => {
                return <div key={i} className="translateCard">
                  <p><strong>{text} ==></strong></p>
                  <p>{displayTranslation(text)}</p>
                </div>
            })}
        </div>
    );
};

export default TranslationSideBar;