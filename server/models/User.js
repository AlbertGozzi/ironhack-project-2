const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: String,
    email: String,
    documents: [String]
}, { _id: false } );

const User = mongoose.model('User', userSchema);

module.exports = User;