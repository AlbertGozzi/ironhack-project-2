// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const mongoose = require('mongoose');

// Local Imports
const conjugator = require('./conjugate.js');
const translator = require('./translate.js');
const Document = require('../models/Document.js')

const MONGODB_URI = 'mongodb://localhost:27017/languages-app';

// Setting up server
const app = express();
const server = http.Server(app);
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

// Connect to database
mongoose
  .connect(MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(self => {
    console.log(`Connected to the database: "${self.connection.name}"`);
    // Before adding any documents to the database, let's delete all previous entries
    // return self.connection.dropDatabase();
  })
  .catch(error => {
    console.error('Error connecting to the database', error);
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
      let {name, language, createdBy, user} = newDocument;
      let languageCode = conjugator.languagesLong[language];

      console.log(`---`);
      console.log(`New document by ${createdBy}`);

      let newDoc = {
        name: name,
        language: language,
        languageCode: conjugator.languagesLong[language],
        languageConjugationStructure: conjugator.languageConjugationStructure[languageCode],
        translations: {},
        conjugations: {},
        value: initialEditorValue[languageCode],
        createdBy: createdBy,
        users: [user],
      }
      
      Document.create(newDoc)
        .then(document => {
          io.to(socket.id).emit('new-document-from-server', {document: document})

          //Push ID to users documents
          if (!userDocuments[user]) {userDocuments[user] = [];}
          userDocuments[user].push(document._id);

        })
        .catch(err => console.log(err))


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

        let documentsPromises = userDocuments[userId].map(documentId => {
          return Document.findById(documentId);
        }) 

        Promise.all([...documentsPromises])
          .then(documents => {
            documents.forEach(document => {
              usersDocuments[document._id] = document              
            });
            io.to(socket.id).emit('initial-documents', usersDocuments)
          })
          .catch(err => console.log(err))
      }
    });

    socket.on('request-initial-data', (docId) => {
      console.log(`---`);
      console.log(`New user in document [${docId}]: ${socket.id}`);
      Document.findById(docId)
        .then(document => {
          console.log(`Sending initial value ${JSON.stringify(document.value)}`);
          console.log(`---`);
          io.to(socket.id).emit(`initial-value-${docId}`, document);    
        })
        .catch(err => console.log(err))
    });


    socket.on('new-operations', (data) => {
      Document.findByIdAndUpdate(data.docId, {"value": data.value})
        .then(document => {
          io.emit(`new-remote-operations-${document._id}`, data);
          console.log(`Change in document [${document._id}]: ${JSON.stringify(document.value)}`);
        })
        .catch(err => console.log(err))
    });

    socket.on('new-text-to-translate', (data) => {
      let docId = data.docId;
      let text = data.text;

      translator.translateTextWithModel(text, 'en').then(translation => {
        Document.findById(docId)
        .then(document => {
          document.translations[text] = translation;
          document.markModified('translations')
          document.save().then(updatedDocument => io.emit(`new-translation-data-${docId}`, updatedDocument.translations) ) 
        })
        .catch(err => console.log(err))
      });
    })

    socket.on('new-verb-to-conjugate', (data) => {
      let docId = data.docId;
      let verb = data.verb;
      let language = data.language;
      let languageCode = conjugator.languagesLong[language];

      let conjugation = conjugator.fullConjugation(languageCode, verb);

      if (conjugation) {
        Document.findById(docId)
        .then(document => {
          document.conjugations[verb] = conjugation;
          document.markModified('conjugations')
          document.save().then(updatedDocument => io.emit(`new-conjugation-data-${docId}`, updatedDocument.conjugations) ) 
        })
        .catch(err => console.log(err))
      }
    })

    socket.on('disconnect', (reason) => {
      console.log(`Disconnected ${socket.id}`);
    });
});
