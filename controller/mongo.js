// Export mongoose
const  mongoose = require("mongoose");
const Schema = mongoose.Schema
require('dotenv').config();

const uri = process.env.M_DATABASE_URL
// const db = require("../models");
// console.log("🚀 ~ file: mongodb.js:8 ~ uri:", uri)

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(result => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });