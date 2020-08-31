const express = require("express")
const AccountController = require("../controllers/accounts.js")

const routes = express.Router()

routes.get("/", AccountController.index)
routes.get("/:agencia/:conta", AccountController.details)

routes.put("/deposit/:agencia/:conta", AccountController.deposit) //4
routes.put("/withdraw/:agencia/:conta", AccountController.withdraw) //5
routes.get("/getBalance", AccountController.getBalance) //6
routes.delete("/:agencia/:conta", AccountController.delete) //7
routes.put("/transfer/:debitAccount/:creditAccount", AccountController.transfer) //8
routes.get("/avgBalance", AccountController.avgBalance) //9
routes.get("/lowestAccountBalance", AccountController.lowestAccountBalance) //10
routes.get("/biggestAccountBalance", AccountController.biggestAccountBalance) //11
//prettier-ignore
routes.get("/transferCustomerTopBalance", AccountController.transferCustomerTopBalance) //12

module.exports = routes
