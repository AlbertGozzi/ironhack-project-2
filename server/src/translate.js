var GOOGLE_APPLICATION_CREDENTIALS = require('../googlecloud-apikey.json')

// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;
// Creates a client
const translate = new Translate({keyFilename: "../server/googlecloud-apikey.json"});
// console.log(GOOGLE_APPLICATION_CREDENTIALS);

// async function listLanguages() {
//     // Lists available translation language with their names in English (the default).
//     const [languages] = await translate.getLanguages();
  
//     console.log('Languages:');
//     languages.forEach(language => console.log(language));
// }
// listLanguages()

async function translateTextWithModel(text, target) {
  const options = {
    to: target,
    model: 'nmt',
  };

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  let [translations] = await translate.translate(text, options);
  translations = Array.isArray(translations) ? translations : [translations];
  return translations[0];
  // translations.forEach((translation, i) => {
  //   console.log(`${text} => (${target}) ${translation}`);
  // });
}

exports.translateTextWithModel = translateTextWithModel;