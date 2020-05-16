require('dotenv').config()

const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({credentials: JSON.parse(process.env.credentials)});

async function translateTextWithModel(text, target) {
  const options = {
    to: target,
    model: 'nmt',
  };

  let [translations] = await translate.translate(text, options);
  translations = Array.isArray(translations) ? translations : [translations];
  return translations[0];
  // translations.forEach((translation, i) => {
  //   console.log(`${text} => (${target}) ${translation}`);
  // });
}

exports.translateTextWithModel = translateTextWithModel;