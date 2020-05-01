// Download file
let fs = require('fs');

let languages = ['es', 'fr', 'pt', 'ro', 'it'];
let languagesLong = {
    es: 'Spanish',
    fr: 'French',
    pt: 'Portuguese',
    ro: 'Romanian',
    it: 'Italian'
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




