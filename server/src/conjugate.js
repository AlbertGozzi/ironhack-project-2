// Download file
let fs = require('fs');

let languages = ['es', 'fr', 'pt', 'ro', 'it'];
let languagesLong = {
    Spanish: 'es',
    French: 'fr',
    Portuguese: 'pt',
    Romanian: 'ro',
    Italian: 'it'
};
let languageConjugationStructure = {
    fr: {
        modes: [
            {   name: 'Infinitif', 
                times: [
                    {
                        name: 'infinitif-présent',
                        persons: 1
                    }
                ]
            }, 
            {   name: 'Indicatif', 
                times: [
                    {
                        name: 'présent',
                        persons: 6
                    },
                    {
                        name: 'imparfait',
                        persons: 6
                    },
                    {
                        name: 'futur-simple',
                        persons: 6
                    },
                    {
                        name: 'passé-simple',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Conditionnel', 
                times: [
                    {
                        name: 'présent',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Subjonctif', 
                times: [
                    {
                        name: 'présent',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Imperatif', 
                times: [
                    {
                        name: 'imperatif-présent',
                        persons: 3
                    }
                ]
            }, 
            {   name: 'Participe', 
                times: [
                    {
                        name: 'participe-présent',
                        persons: 1
                    },
                    {
                        name: 'participe-passé',
                        persons: 4
                    }
                ]
            }
        ],
        persons: {
            1: ['All'], 
            6: ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils'],
            3: ['tu', 'nous', 'vous'],
            4: ['il', 'ils', 'elle', 'elles']
        }
    }
}

let conjFile = {};
let verbFile = {};
let verbToConjugate = {};
let conjugate = {};

languages.forEach(language => {
    // console.log(`<---- Loading ${languagesLong[language]} ---->`);
    conjFile[language] = JSON.parse(fs.readFileSync(`files/${language}.json`));
    // console.log(`Number of conjugations: ${conjFile[language].template.length}`)
    verbFile[language] = JSON.parse(fs.readFileSync(`files/verbs-${language}.json`));
    // console.log(`Number of verbs: ${verbFile[language].v.length}`);

    verbToConjugate[language] = {};
    language === 'fr' ?
        verbFile[language].v.forEach(verb => verbToConjugate[language][verb.i] = verb.t )
        : verbFile[language].v.forEach(verb => verbToConjugate[language][verb.i.__text] = verb.t.__text );

    conjugate[language] = {};
    conjFile[language].template.forEach(conjugableVerb => conjugate[language][conjugableVerb._name] = conjugableVerb )
});

// console.log(JSON.stringify(conjugate['fr'][verbToConjugate['fr']['aller']]));
const conjugator = (language, verb, mode, time, person) => {
    let fullConj = fullConjugation(language, verb); 
    if (!mode) { return fullConj;}
    if (!time) { return fullConj[mode];}
    if (!person) {return fullConj[mode][time];}
    return fullConj[mode][time].p[person-1].i[0];  
}

const fullConjugation = (language, verb) => {
    return conjugate[language][verbToConjugate[language][verb]]; 
}

// console.log(JSON.stringify(conjugator('fr', 'aller', 'Indicatif', 'présent', 2)));

exports.fullConjugation = fullConjugation;
exports.languagesLong = languagesLong;
exports.languageConjugationStructure = languageConjugationStructure;




