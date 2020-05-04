// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');

// Local Imports
const conjugator = require('./conjugate.js');
const translator = require('./translate.js');

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

io.on('connection', (socket) => {
    console.log(`Connected ${socket.id}`);

    socket.on('initial-data', (initialData) => {
      let docId = initialData.docId;
      let language = initialData.docLanguage;
      let languageCode = conjugator.languagesLong[language];
      console.log(`---`);
      console.log(`New user in document [${docId}]: ${socket.id}`);
      if (!(docId in documentsData)) {
          console.log('First user in document');
          documentsData[docId] = {};
          documentsData[docId].language = language;
          documentsData[docId].languageCode = languageCode;
          documentsData[docId].languageConjugationStructure = conjugator.languageConjugationStructure[languageCode];
          documentsData[docId].translations = {};
          documentsData[docId].conjugations = {};
          documentsData[docId].value = initialEditorValue;
      }
      console.log(`Sending initial value ${JSON.stringify(documentsData[docId].value)}`);
      console.log(`---`);
      io.to(socket.id).emit(`initial-value-${docId}`, documentsData[docId]);
    });


    socket.on('new-operations', (data) => {
      documentsData[data.docId].value = data.value;
      console.log(`Change in document [${data.docId}]: ${JSON.stringify(documentsData[data.docId].value)}`);
      io.emit(`new-remote-operations-${data.docId}`, data);
    });

    socket.on('new-text-to-translate', (data) => {
      let docId = data.docId;
      let text = data.text;

      translator.translateTextWithModel(text, 'en').then(res => {
        documentsData[docId].translations[text] = res;
        // console.log(`--New text to translate--`)
        // console.log(JSON.stringify(documentsData[docId].translations))
        io.emit(`new-translation-data-${docId}`, documentsData[docId].translations)  
      });
    })

    socket.on('new-verb-to-conjugate', (data) => {
      let docId = data.docId;
      let verb = data.verb;
      let language = documentsData[docId].language;
      let languageCode = conjugator.languagesLong[language];

      let conjugation = conjugator.fullConjugation(languageCode, verb);
      documentsData[docId].conjugations[verb] = conjugation;

      // Old version
      // if (!conjugation) { documentsData[docId].conjugations[verb] = 'Verb not found' }
      // io.emit(`new-conjugation-data-${docId}`, documentsData[docId].conjugations)  
      if (conjugation) { io.emit(`new-conjugation-data-${docId}`, documentsData[docId].conjugations) }

    })

    socket.on('disconnect', (reason) => {
      console.log(`Disconnected ${socket.id}`);
    });
});
