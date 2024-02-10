const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true, minLength: 6},
    image: { type: String, required: true},
    //  mongoose.Types.ObjectId => access id mongoose Id
    // ref used to give refernce of collection in which we want to make relation
    // [] represents places will be multiple values OR ARRAY
    places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Places'}],
});

// used to validate unique email value
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);