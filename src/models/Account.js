const mongoose = require("../database/index.js")

const AccountSchema = new mongoose.Schema(
  {
    agencia: {
      type: Number,
      require: true,
    },
    conta: {
      type: Number,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    balance: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
)

const Account = mongoose.model("Account", AccountSchema, "accounts")

module.exports = Account
