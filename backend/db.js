const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1";

const connectTOMongo = () =>{
    mongoose.connect(mongoURI);
    console.log("Connected to Mongo Successfully");
}

module.exports = connectTOMongo;