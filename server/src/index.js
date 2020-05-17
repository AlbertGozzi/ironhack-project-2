// Dependencies
require('dotenv').config()
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.service_account);

// Local Imports
const conjugator = require('./conjugate.js');
const translator = require('./translate.js');
const Document = require('../models/Document.js')
const User = require('../models/User.js')

// Setting up server
const app = express();
const server = http.Server(app);
app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/', 'index.html'));
});

let port = process.env.PORT;
app.set('port', port);
server.listen(port, function() {
    console.log(`Starting server on port ${port}`);
});

// Connect to database
mongoose
  .connect(process.env.MONGODB_URI, {
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

// Connect to firebase database
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ironhack-project-1588001243753.firebaseio.com"
});

// function listAllUsers(nextPageToken) {
//   // List batch of users, 1000 at a time.
//   admin.auth().listUsers(1000, nextPageToken)
//     .then(function(listUsersResult) {
//       listUsersResult.users.forEach(function(userRecord) {
//         // console.log('user', userRecord.toJSON());
//         console.log('user', userRecord.email);
//       });
//       if (listUsersResult.pageToken) {
//         // List next batch of users.
//         listAllUsers(listUsersResult.pageToken);
//       }
//     })
//     .catch(function(error) {
//       console.log('Error listing users:', error);
//     });
// }
// // Start listing users from the beginning, 1000 at a time.
// listAllUsers();

// 5JBM1D8jiWROD6sD7J195S8ghfs1

// admin.auth().getUser('5JBM1D8jiWROD6sD7J195S8ghfs1')
//   .then(function(userRecord) {
//     // See the UserRecord reference doc for the contents of userRecord.
//     console.log('Successfully fetched user data:', userRecord.toJSON());
//   })
//   .catch(function(error) {
//     console.log('Error fetching user data:', error);
//   });

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

// Socket connection
let io = socketIO(server);
io.on('connection', (socket) => {
    console.log(`Connected ${socket.id}`);

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

          // Add document to user, creating user if not previously created
          User.findById(user)
            .then(dbUser => {
              if(!dbUser) {
                let newUser = {
                  _id: user,
                  email: createdBy,
                  documents: [document._id]
                }
                User.create(newUser)
              } else {
                dbUser.documents.push(document._id);
                dbUser.save();
              }
            })
            .catch(err => console.error(err))

        })
        .catch(err => console.log(err))


    });

    socket.on('new-user-in-document', (data) => {
      let docId = data.docId;
      let userEmail = data.userEmail;

      console.log(`New user added to document ${docId}`);

      // Push ID to users' documents, creating it if it doesn't exist already
      admin.auth().getUserByEmail(userEmail)
        .then((userRecord) => {

          User.findById(userRecord.uid)
            .then(user => {
              if(!user) {
                let newUser = {
                  _id: userRecord.uid,
                  email: userEmail,
                  documents: [docId]
                }
                User.create(newUser)
              } else {
                user.documents.push(docId);
                user.save();
              }
            })
            .catch(err => console.error(err))
          
        })
        .catch((error) => {
          console.log('Error fetching user data:', error);
        });
      
    });

    socket.on('request-initial-documents', (userId) => {
      console.log('New user requests documents');

      User.findById(userId)
        .then(user => {
          
          // Do nothing if user has no documents
          if (user.documents) { 

            let documentsPromises = user.documents.map(documentId => {
              return Document.findById(documentId);
            }) 
    
            Promise.all([...documentsPromises])
              .then(documents => {
                let allDocuments = {}
                documents.forEach(document => {
                  allDocuments[document._id] = document;              
                });
                io.to(socket.id).emit('initial-documents', allDocuments)
              })
              .catch(err => console.log(err))
          }   
        })
      
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
