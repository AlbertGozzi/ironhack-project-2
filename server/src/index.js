// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');

// Local Imports
const conjugator = require('./conjugate.js');
const translator = require('./translate.js');

// Setting up server
let app = express();
let server = http.Server(app);
app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/', 'index.html'));
});
let port = process.env.PORT;
if (port == null || port == "") {port = 5000;}
app.set('port', port);
server.listen(port, function() {
    console.log(`Starting server on port ${port}`);
});


const initialEditorValue = {
  es: [
    {
      type: 'paragraph',
      children: [{ text: 'Una línea de texto en un párrafo.' }],
    },
  ],
  fr: [
    {
      type: 'paragraph',
      children: [{ text: 'Une ligne de text dans un paragraphe.' }],
    },
  ],
  pt: [
    {
      type: 'paragraph',
      children: [{ text: 'Uma linhea de texto em um parágrafo.' }],
    },
  ],
  ro: [
    {
      type: 'paragraph',
      children: [{ text: 'O linie de text dintr-un paragraf.' }],
    },
  ],
  it: [
    {
      type: 'paragraph',
      children: [{ text: 'Una riga di testo in un paragrafo.' }],
    },
  ]
}

// Local 'database'
const documentsData = {};
const userDocuments = {};
//TODO: replace for proper connection to firebase via API
// https://firebase.google.com/docs/admin/setup
// https://firebase.google.com/docs/auth/admin/manage-users
const userDatabase = {};

// Socket connection
let io = socketIO(server);
io.on('connection', (socket) => {
    console.log(`Connected ${socket.id}`);

    // TODO: replace for proper connection to firebase via API
    socket.on('new-user', (user) => {
      let userId = user.uid;
      let email = user.email;

      userDatabase[email] = userId;

    });

    socket.on('new-document', (newDocument) => {
      let {uniqueId, name, language, createdBy, user} = newDocument;
      let languageCode = conjugator.languagesLong[language];

      console.log(`---`);
      console.log(`New document: ${uniqueId}`);

      //Create entry
      documentsData[uniqueId] = {};
      documentsData[uniqueId].name = name;
      documentsData[uniqueId].language = language;
      documentsData[uniqueId].languageCode = languageCode;
      documentsData[uniqueId].languageConjugationStructure = conjugator.languageConjugationStructure[languageCode];
      documentsData[uniqueId].translations = {};
      documentsData[uniqueId].conjugations = {};
      documentsData[uniqueId].value = initialEditorValue[languageCode];
      documentsData[uniqueId].createdBy = createdBy;
      documentsData[uniqueId].users = [];
      documentsData[uniqueId].users.push(user);

      //Push ID to users documents
      if (!userDocuments[user]) {userDocuments[user] = [];}
      userDocuments[user].push(uniqueId);

      io.to(socket.id).emit('new-document-from-server', {document: documentsData[uniqueId], id: uniqueId})
    });

    socket.on('new-user-in-document', (data) => {
      let docId = data.docId;
      let userEmail = data.userEmail;
      let userId = userDatabase[userEmail];

      console.log(`New user added to document ${docId}`);
      
      //Push ID to users documents
      if (!userDocuments[userId]) {userDocuments[userId] = [];}
      userDocuments[userId].push(docId);
      
    });

    socket.on('request-initial-documents', (userId) => {
      console.log('New user requests documents');
      
      // Do nothing if user has no documents
      if (userDocuments[userId]) { 
        let usersDocuments = {};
        userDocuments[userId].forEach(documentId => {
          usersDocuments[documentId] = documentsData[documentId]
        }) 
        io.to(socket.id).emit('initial-documents', usersDocuments);
      };

    });

    socket.on('request-initial-data', (docId) => {
      console.log(`---`);
      console.log(`New user in document [${docId}]: ${socket.id}`);
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

      if (conjugation) { io.emit(`new-conjugation-data-${docId}`, documentsData[docId].conjugations) }
    })

    socket.on('disconnect', (reason) => {
      console.log(`Disconnected ${socket.id}`);
    });
});
