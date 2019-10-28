//Require
const mongoose = require('mongoose');

//Schemas
var Network = new mongoose.Schema({
    title: String,
    link: String
})

Network.index({title: 'text'});

//Export
var Network = module.exports = mongoose.model('Network', Network);