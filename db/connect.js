require("dotenv").config();
const mongoose = require("mongoose");

let URI;

if (process.env.NODE_ENV === "development") {
  URI = process.env.DEV_DB_URI;
}
if (process.env.NODE_ENV === "test") {
  URI = process.env.TEST_DB;
}
if (process.env.NODE_ENV === "production") {
  URI = process.env.MONGO_URI;
}

async function connectDB() {
  return await mongoose.connect(URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
}

module.exports = connectDB;
