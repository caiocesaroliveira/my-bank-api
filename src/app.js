const express = require("express")
const cors = require("cors")
const routes = require("./routes/account.routes")

// require("./database")

const app = express()
app.use(cors())
app.use(express.json())
app.use(routes)

//Alternativa de rotas
// require("./database")(app)

module.exports = app
