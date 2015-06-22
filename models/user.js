var restful = require('node-restful'),
    mongoose = restful.mongoose;

var UserSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    admin: Boolean
});

mongoose.model('User', UserSchema);
module.exports.schema = UserSchema;