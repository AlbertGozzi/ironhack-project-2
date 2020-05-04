import React, {useEffect, useState} from 'react';

const TranslationSideBar = (props) => {
    let value = props.value;
    let socket = props.socket;
    let docId = props.docId;

    const [translatedTexts, setTranslatedTexts] = useState([]);
    const [translations, setTranslations] = useState([]);

    useEffect(() => {
        let translatedTextsValue = [];
        value.forEach((text,i) => {
            let textsToTranslate = text.children.filter((element) => element.translate);
            textsToTranslate.forEach(element => {
                let text = element.text;
                translatedTextsValue.push(text);
                if (!translations[text]) {
                    let data = {
                        text: text,
                        docId: docId
                    }
                    socket.emit('new-text-to-translate', data);
                }
            })
        })

        setTranslatedTexts([...translatedTextsValue]);

    }, [value, docId, socket, translations])

    useEffect(() => {
        socket.on(`new-translation-data-${docId}`, (serverTranslations) => {
            console.log('Translations received');
            setTranslations(serverTranslations);
        });
    }, [docId, socket])
    
    const displayTranslation = (text) => {
        let translation = translations[text];
        if (typeof translation === 'string') {
            return translation;
        } else {
            return "Loading..."
        }
    }

    return (
        <div>
            {translatedTexts.map((text, i) => {
                return <div key={i} className="translateCard">
                  <p><strong>{text} =></strong></p>
                  <p>{displayTranslation(text)}</p>
                </div>
            })}
        </div>
    );
};

export default TranslationSideBar;