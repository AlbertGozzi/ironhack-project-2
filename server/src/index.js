// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;

// Renaming
let app = express();
let server = http.Server(app);
let io = socketIO(server);

// For deployment
app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/', 'index.html'));
});

// Set port for Heroku
let port = process.env.PORT;
if (port == null || port == "") {port = 5000;}
app.set('port', port);

// Starts the server.
server.listen(port, function() {
    console.log(`Starting server on port ${port}`);
});

const initialEditorValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

const documentsData = {};

// Google translate
const translate = new Translate();
// async function listLanguages() {
//     // Lists available translation language with their names in English (the default).
//     const [languages] = await translate.getLanguages();
  
//     console.log('Languages:');
//     languages.forEach(language => console.log(language));
// }
// listLanguages()

async function translateTextWithModel(text, target) {
  const options = {
    // The target language, e.g. "ru"
    to: target,
    // Make sure your project is whitelisted.
    // Possible values are "base" and "nmt"
    model: 'nmt',
  };

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  let [translations] = await translate.translate(text, options);
  translations = Array.isArray(translations) ? translations : [translations];
  console.log(`Log: ${translations[0]}`)
  return translations[0];
  // translations.forEach((translation, i) => {
  //   console.log(`${text} => (${target}) ${translation}`);
  // });
}

io.on('connection', (socket) => {
    console.log(`Connected ${socket.id}`);

    socket.on('doc-id', (docId) => {
        console.log(`---`);
        console.log(`New user in document [${docId}]: ${socket.id}`);
        if (!(docId in documentsData)) {
            console.log('First user in document');
            documentsData[docId] = {};
            documentsData[docId].translations = {};
            documentsData[docId].conjugations = {};
            documentsData[docId].value = initialEditorValue;
        }
        console.log(`Sending initial value ${JSON.stringify(documentsData[docId].value)}`);
        console.log(`---`);
        io.to(socket.id).emit(`initial-value-${docId}`, documentsData[docId].value);
    });

    socket.on('new-operations', (data) => {
      documentsData[data.docId].value = data.value;
      console.log(`Change in document [${data.docId}]: ${JSON.stringify(documentsData[data.docId].value)}`);
      io.emit(`new-remote-operations-${data.docId}`, data);
    });

    socket.on('new-text-to-translate', (data) => {
      let docId = data.docId;
      let text = data.text;

      translateTextWithModel(text, 'en').then(res => {
        documentsData[docId].translations[text] = res;
        console.log(`--New text to translate--`)
        console.log(JSON.stringify(documentsData[docId].translations))
        io.emit(`new-translation-data-${docId}`, documentsData[docId].translations)  
      });
    })

    socket.on('new-verb-to-conjugate', (data) => {
      let docId = data.docId;
      let verb = data.verb;


      // translateTextWithModel(text, 'en').then(res => {
      documentsData[docId].conjugations[verb] = 'This is the conjugation';
      // console.log(`--New text to translate--`)
      // console.log(JSON.stringify(documentsData[docId].translations))
      io.emit(`new-conjugation-data-${docId}`, documentsData[docId].conjugations)  
      // });
    })

    socket.on('disconnect', (reason) => {
      console.log(`Disconnected ${socket.id}`);
    });
});
