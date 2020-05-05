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
    es: {
        modes: [
            {   name: 'Infinitivo', 
                times: [
                    {
                        name: 'infinitivo',
                        persons: 1
                    }
                ]
            }, 
            {   name: 'Indicativo', 
                times: [
                    {
                        name: 'presente',
                        persons: 6
                    },
                    {
                        name: 'pretérito-imperfecto',
                        persons: 6
                    },
                    {
                        name: 'futuro',
                        persons: 6
                    },
                    {
                        name: 'pretérito-perfecto-simple',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Condicional', 
                times: [
                    {
                        name: 'presente',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Imperativo', 
                times: [
                    {
                        name: 'afirmativo',
                        persons: 3
                    },
                    {
                        name: 'negativo',
                        persons: 3
                    }
                ]
            }, 
            {   name: 'Participo', 
                times: [
                    {
                        name: 'participo',
                        persons: 1
                    }
                ]
            },
            {   name: 'Gerundio', 
                times: [
                    {
                        name: 'gerundio',
                        persons: 1
                    }
                ]
            }
        ],
        persons: {
            1: ['All'], 
            2: ['Gerundio', 'Participio'], 
            3: ['tu', 'vosotros', 'ellos'],
            5: ['tu', 'él/ella', 'nosotros', 'vosotros', 'ellos'],
            6: ['yo', 'tu', 'él/ella', 'nosotros', 'vosotros', 'ellos']
        }
    },
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
    },
    pt: {
        modes: [
            {   name: 'Infinitivo', 
                times: [
                    {
                        name: 'infinitivo-pessoal-presente',
                        persons: 6
                    },
                    {
                        name: 'infinitivo',
                        persons: 2
                    }
                ]
            }, 
            {   name: 'Indicativo', 
                times: [
                    {
                        name: 'presente',
                        persons: 6
                    },
                    {
                        name: 'pretérito-imperfeito',
                        persons: 6
                    },
                    {
                        name: 'pretérito-mais-que-perfeito',
                        persons: 6
                    },
                    {
                        name: 'futuro-do-presente',
                        persons: 6
                    },
                    {
                        name: 'pretérito-perfeito',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Condicional', 
                times: [
                    {
                        name: 'futuro-do-pretérito',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Subjuntivo', 
                times: [
                    {
                        name: 'presente',
                        persons: 6
                    },
                    {
                        name: 'pretérito-imperfeito',
                        persons: 6
                    },
                    {
                        name: 'futuro',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Imperativo', 
                times: [
                    {
                        name: 'afirmativo',
                        persons: 6
                    },
                    {
                        name: 'negativo',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Particípio', 
                times: [
                    {
                        name: 'particípio',
                        persons: 1
                    }
                ]
            },
            {   name: 'Gerúndio', 
                times: [
                    {
                        name: 'gerúndio',
                        persons: 1
                    }
                ]
            }
        ],
        persons: {
            1: ['All'],
            2: ['Inf/Ger', 'Participio'],
            6: ['eu', 'tu', 'ele/ela', 'nós', 'vós', 'eles/elas']
        }
    },
    ro: {
        modes: [
            {   name: 'Infinitiv', 
                times: [
                    {
                        name: 'afirmativ',
                        persons: 1
                    }
                ]
            }, 
            {   name: 'Indicativ', 
                times: [
                    {
                        name: 'prezent',
                        persons: 6
                    },
                    {
                        name: 'imperfect',
                        persons: 6
                    },
                    {
                        name: 'mai-mult-ca-perfect',
                        persons: 6
                    },
                    {
                        name: 'perfect-simplu',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Conjunctiv', 
                times: [
                    {
                        name: 'prezent',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Imperativ', 
                times: [
                    {
                        name: 'imperativ',
                        persons: 2
                    },
                    {
                        name: 'negativ',
                        persons: 2
                    }
                ]
            }, 
            {   name: 'Participiu', 
                times: [
                    {
                        name: 'participiu',
                        persons: 1
                    }
                ]
            },
            {   name: 'Gerunziu', 
                times: [
                    {
                        name: 'gerunziu',
                        persons: 1
                    }
                ]
            }
        ],
        persons: {
            1: ['All'], 
            2: ['tu', 'voi'],
            6: ['eu', 'tu', 'el/ea', 'noi', 'voi', 'ei/ele']
        }
    },
    it: {
        modes: [
            {   name: 'Infinito', 
                times: [
                    {
                        name: 'gerundio',
                        persons: 4
                    }
                ]
            }, 
            {   name: 'Indicativo', 
                times: [
                    {
                        name: 'presente',
                        persons: 6
                    },
                    {
                        name: 'imperfetto',
                        persons: 6
                    },
                    {
                        name: 'futuro',
                        persons: 6
                    },
                    {
                        name: 'passato-remoto',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Condizionale', 
                times: [
                    {
                        name: 'presente',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Congiuntivo', 
                times: [
                    {
                        name: 'presente',
                        persons: 6
                    },
                    {
                        name: 'imperfetto',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Imperativo', 
                times: [
                    {
                        name: 'affermativo',
                        persons: 6
                    },
                    {
                        name: 'negativo',
                        persons: 6
                    }
                ]
            }, 
            {   name: 'Participio', 
                times: [
                    {
                        name: 'participio',
                        persons: 1
                    }
                ]
            }
        ],
        persons: {
            1: ['All'], 
            4: ['Infinito', 'Gerundio Composto', 'Gerundio Semplice', 'Gerundio Composto'],
            5: ['All', 'lui', 'lei', 'loro (m)', 'loro (f)'],
            6: ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro']
        }
    }
};

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




