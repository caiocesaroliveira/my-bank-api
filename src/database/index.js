const mongoose = require("mongoose")

require("dotenv/config")

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

mongoose.Promise = global.Promise

module.exports = mongoose
