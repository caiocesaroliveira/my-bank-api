const Account = require("../models/Account")

module.exports = {
  async index(req, res) {
    try {
      const account = await Account.find()

      return res.status(200).json(account)
    } catch (error) {
      return res.status(400).json({ erro: error })
    }
  },

  async details(req, res) {
    const { agencia, conta } = req.params

    try {
      const findAccount = await Account.findOne({ agencia, conta })

      return res.status(200).json(findAccount)
    } catch (error) {
      return res.status(400).json({ erro: error })
    }
  },

  async deposit(req, res) {
    const { agencia, conta } = req.params
    const { value } = req.body

    try {
      if (!agencia)
        return res.status(400).json({ erro: "Agencia não informada" })
      if (!conta) return res.status(400).json({ erro: "Conta não informada" })
      if (!value) return res.status(400).json({ erro: "Valor não informada" })

      const findAccount = await Account.findOne({ agencia, conta })

      if (!findAccount) {
        return res.status(400).json({ erro: "Agencia e Conta não encontrados" })
      }

      findAccount.balance += value

      await findAccount.save()

      return res.status(200).json(findAccount)
    } catch (error) {
      return res.status(500).json({ erro: error })
    }
  },

  async withdraw(req, res) {
    const { agencia, conta } = req.params
    const { value } = req.body
    const rate = 1
    try {
      if (!agencia)
        return res.status(400).json({ erro: "Agencia não informada" })
      if (!conta) return res.status(400).json({ erro: "Conta não informada" })
      if (!value) return res.status(400).json({ erro: "Valor não informada" })

      const findAccount = await Account.findOne({ agencia, conta })

      if (!findAccount) {
        return res.status(400).json({ erro: "Agencia e Conta não encontrados" })
      }

      const newValue = findAccount.balance - value - rate

      if (newValue < 0)
        return res.status(400).json({ erro: "Saldo insuficiente para saque" })

      findAccount.balance = newValue

      await findAccount.save()

      return res.status(200).json(findAccount)
    } catch (error) {
      return res.status(500).json({ erro: error })
    }
  },

  async getBalance(req, res) {
    const { agencia, conta } = req.query

    try {
      if (!agencia)
        return res.status(400).json({ erro: "Agencia não informada" })
      if (!conta) return res.status(400).json({ erro: "Conta não informada" })

      const findAccount = await Account.findOne({ agencia, conta })

      if (!findAccount) {
        return res.status(400).json({ erro: "Agencia e Conta não encontrados" })
      }

      return res.status(200).json({ balance: findAccount.balance })
    } catch (error) {
      return res.status(500).json({ erro: error })
    }
  },

  async delete(req, res) {
    const { agencia, conta } = req.params

    try {
      if (!agencia)
        return res.status(400).json({ erro: "Agencia não informada" })
      if (!conta) return res.status(400).json({ erro: "Conta não informada" })

      await Account.findOneAndDelete({ agencia, conta })

      const activeAccounts = await Account.find({ agencia })

      return res.status(200).json(activeAccounts.length)
    } catch (error) {
      return res.status(500).json({ erro: error })
    }
  },

  async transfer(req, res) {
    const { debitAccount, creditAccount } = req.params
    const { value } = req.body
    const rate = 8

    try {
      if (!debitAccount)
        return res.status(400).json({ erro: "Conta de origem não informada" })

      if (!creditAccount)
        return res.status(400).json({ erro: "Conta de destino não informada" })

      if (!value) return res.status(400).json({ erro: "Valor não informada" })

      const findDebitAccount = await Account.findOne({ conta: debitAccount })
      const findCreditAccount = await Account.findOne({ conta: creditAccount })

      if (findDebitAccount.agencia !== findCreditAccount.agencia)
        findDebitAccount.balance -= rate

      findDebitAccount.balance -= value
      findCreditAccount.balance += value

      await findDebitAccount.save()
      await findCreditAccount.save()

      return res.status(200).json({ findDebitAccount, findCreditAccount })
    } catch (error) {
      return res.status(500).json({ erro: error })
    }
  },

  async avgBalance(req, res) {
    const { agencia } = req.query

    try {
      if (!agencia)
        return res.status(400).json({ erro: "Agencia não informada" })

      const findAccounts = await Account.aggregate([
        { $match: { agencia: Number(agencia) } },
        { $group: { _id: "$agencia", avgBalance: { $avg: "$balance" } } },
      ])
      if (!findAccounts || findAccounts.length === 0) {
        return res.status(400).json({ erro: "Agencia não encontrada" })
      }
      return res.status(200).json(findAccounts)
    } catch (error) {
      return res.status(500).json({ erro: error })
    }
  },

  async lowestAccountBalance(req, res) {
    const { limit } = req.query

    try {
      if (!limit) return res.status(400).json({ erro: "Limite não informado" })

      const findAccounts = await Account.aggregate([
        { $project: { agencia: 1, conta: 1, balance: 1, _id: false } },
        { $sort: { balance: 1 } },
        { $limit: Number(limit) },
      ])

      if (!findAccounts || findAccounts.length === 0) {
        return res.status(400).json({ erro: "Agencia não encontrada" })
      }
      return res.status(200).json(findAccounts)
    } catch (error) {
      return res.status(500).json({ erro: error })
    }
  },

  async biggestAccountBalance(req, res) {
    const { limit } = req.query

    try {
      if (!limit) return res.status(400).json({ erro: "Limite não informado" })

      const findAccounts = await Account.aggregate([
        { $project: { agencia: 1, conta: 1, name: 1, balance: 1, _id: false } },
        { $sort: { balance: -1, name: 1 } },
        { $limit: Number(limit) },
      ])

      if (!findAccounts || findAccounts.length === 0) {
        return res.status(400).json({ erro: "Agencia não encontrada" })
      }
      return res.status(200).json(findAccounts)
    } catch (error) {
      return res.status(500).json({ erro: error })
    }
  },

  async transferCustomerTopBalance(req, res) {
    try {
      const findAgencies = await Account.distinct("agencia")
      let vipAccounts = []

      for (const agency of findAgencies) {
        const findTopAccount = await Account.find({ agencia: agency })
          .sort({ balance: -1 })
          .limit(1)

        const { name, balance, conta } = findTopAccount[0]

        const accountExist = await Account.findOne({
          agencia: 99,
          conta: Number(conta),
        })

        if (!accountExist) {
          vipAccounts.push({
            agencia: 99,
            name,
            balance,
            conta,
          })
        }
      }

      if (vipAccounts.length > 0) {
        await Account.insertMany(vipAccounts)
      }

      const findPrivateAgency = await Account.find({ agencia: 99 })

      return res.status(200).json(findPrivateAgency)
    } catch (error) {
      return res.status(500).json({ erro: error })
    }
  },
}
