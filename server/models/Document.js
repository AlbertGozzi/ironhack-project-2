const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
    name: String,
    language: {
        type: String,
        enum: ['Spanish', 'French', 'Portuguese', 'Italian', 'Romanian']
    },
    languageCode : {
        type: String,
        enum: ['es', 'fr', 'pt', 'it', 'ro']  
    },
    languageConjugationStructure: Schema.Types.Mixed,
    translations: Schema.Types.Mixed,
    conjugations: Schema.Types.Mixed,
    value: Schema.Types.Mixed,
    createdBy: String,
    users: [String]
}, { minimize: false });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;