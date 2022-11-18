import express, { Request, Response } from "express"
import { accounts, Transactions } from './data'
import { Account, Transaction } from "./types"
import cors from 'cors'

const app = express()

app.use(express.json())

app.use(cors())


//Endpoint que cadastra um novo usuário
app.post("/accounts/newAccount", (req: Request, res: Response) => {

    let errorCode = 500

    try {
        const { name, cpf, birthDate }: Account = req.body

        const separateDate = birthDate.split("/")

        const validateAge = function (birthdayYear: number, birthdayMonth: number, birthdayDay: number) {
            let d = new Date

            let currentYear = d.getFullYear()
            let currentMonth = d.getMonth() + 1
            let currentDay = d.getDate()

            if (currentYear - birthdayYear > 17) {
                return true
            } else if (currentMonth >= birthdayMonth && currentDay >= birthdayDay) {
                return true
            } else {
                return false
            }
        }
        if (!name) {
            errorCode = 422
            throw new Error('Nome do usuário da conta faltando')
        }
        if (typeof (name) != 'string') {
            errorCode = 422
            throw new Error('Nome inválido')
        }
        if (!cpf) {
            errorCode = 422
            throw new Error('CPF do usuário da nova conta faltando')
        }

        const cpfExists = accounts.find((user) => {
            return user.cpf === cpf
        })

        if (cpfExists) {
            errorCode = 409
            throw new Error('Já existe um usuário cadastrado com este CPF')
        }

        if (!birthDate) {
            errorCode = 422
            throw new Error('Data de nascimento do usuário da nova conta faltando')
        }

        if (!validateAge(Number(separateDate[0]), Number(separateDate[1]), Number(separateDate[2]))) {
            res.status(400).send('Conta não criada. É necessário ter 18 anos ou mais')
        } else {
            accounts.push({
                id: accounts.length + 1,
                name: name,
                cpf: cpf,
                birthDate: birthDate,
                balance: 0

            })
        }
        res.status(200).send('Conta criada com sucesso')

    } catch (error: any) {

        res.status(errorCode).send(error.message)
    }
})


// Endpoint que retorna todos os usuários 
app.get("/accounts", (req: Request, res: Response) => {
    res.status(200).send(accounts)
})

app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});


//Endpoint que adiciona saldo
let errorCode = 400

app.put("/accounts/account", (req: Request, res: Response) => {

    try {

        const { name, value, cpf } = req.body

        if (!cpf || !name || !value) {
            errorCode = 422
            throw new Error("Passe todos os paramentros");
        }

        if (typeof (name) !== "string") {
            errorCode = 422
            throw new Error("Name inválido");
        }

        if (typeof (cpf) !== "string" || isNaN(Number(cpf)) || cpf.length !== 11 || cpf.includes(" ")) {
            errorCode = 422
            throw new Error("CPF inválido");
        }

        if (typeof (value) !== "number") {
            errorCode = 422
            throw new Error("Valor inválido");
        }

        let check: boolean = false

        for (const account of accounts) {
            if (account.name === name && account.cpf === cpf) {
                check = true
            }
        }
        if (check === false) {
            errorCode = 422
            throw new Error("Please check name and cpf");
        }
        let userBalance = {}
        accounts.map((account) => {
            if (account.name === name && account.cpf === cpf) {
                account.balance = account.balance + value
                userBalance = {
                    name: account.name,
                    cpf: account.cpf,
                    birthDate: account.birthDate,
                    balance: account.balance
                }

                return userBalance
            }
        })

        res.status(200).send(userBalance)

    } catch (error: any) {
        res.status(errorCode).send(error.message)
    }
})

//Endpoint que paga conta

app.patch("/accounts/:id/payTheBills", (req: Request, res: Response) => {

    try {

        const user = Number(req.params.id)
        let { value, description, payday } = req.body

        if (!value || !description) {
            errorCode = 422
            throw new Error("Passe os parametros corretamente");
        }

        if (typeof (value) !== "number") {
            errorCode = 422
            throw new Error("Valor inválido");
        }

        if (typeof (description) !== "string") {
            errorCode = 422
            throw new Error("Descrição inválido");
        }

        let d = new Date();
        d.setHours(0,0,0,0)

        let currentYear = d.getFullYear()
        let currentMonth = d.getMonth() + 1
        let currentDay = d.getDate()

        if(!payday) {
            payday = `${currentYear}/${currentMonth}/${currentDay}`
        }

        const separatePayday = payday.split("/")

        const findUser = accounts.find((current: Account) => {
            return current.id === user
        })

        if (findUser) {
            //usuario tem saldo
            if (value > findUser.balance) {
                res.status(400).send("Saldo insuficiente")
            } else {
                //payday válido
                const date = new Date(`${separatePayday[2]}-${separatePayday[1]}-${separatePayday[0]} 00:00:00`);

                if (date < d) {
                   return res.status(400).send("Data inválido")
                } else if(date > d) {
                    findUser.balance = findUser.balance - value
                   return res.status(200).send("Agendamento Realizado com sucesso.")
                }
                findUser.balance = findUser.balance - value
                
                return res.status(200).send("Conta paga")
            }

        } else {
            res.status(404).send("Usuário não encontrado")
        }

    } catch (error: any) {
        res.status(errorCode).send(error.message)
    }

})
