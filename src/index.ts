import express, { Request, Response } from "express"
import { accounts, transactions } from './data'
import { Account, Transaction } from "./types"
import cors from 'cors'


const app = express()

app.use(express.json())

app.use(cors())


//FUNCIONALIDADES

// Crie um método GET na entidade users função que será responsável por pegar todos os usuários existentes no array de usuários.

app.get("/accounts", (req: Request, res: Response) => {
    res.status(200).send(accounts)
})

// - CRIAR CONTA 
//Adicione, uma validação no item 1 (Criar conta): o usuário deve possuir mais do que 18 anos para conseguir se cadastrar. Caso não possua, exiba uma mensagem de erro.

// Opcionais:
//Adicione mais uma validação na função do item 1 (Criar conta): verifiquem se o CPF passado já não está atrelado a alguma conta existente.

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

//OPCIONAL 2.
// Crie um endpoint get que receba um CPF como parâmetro e retorne o saldo da conta do usuário dono daquele CPF.
// A informação deve ser igual ao que estiver salvo no sistema. Se for diferente, exiba uma mensagem de erro. 

app.get("/accounts/balance", (req: Request, res: Response) => {

    let errorCode = 500

    try {

        const cpf = req.query.cpf as string

        if (!req.query.cpf) {
            errorCode = 422
            throw new Error("Informe o CPF");
        }

        if (typeof (cpf) !== "string" || isNaN(Number(cpf)) || cpf.length !== 11 || cpf.includes(" ")) {
            errorCode = 422
            res.send("CPF incorreto")
        }

        const accountBalance = accounts.filter(account => {
            return account.cpf === cpf
        }).map(account => {
            return { balance: account.balance }
        })

        if (accountBalance.length === 0) {
            errorCode = 404
            throw new Error("Conta não encontrada");
        }

        res.status(200).send(accountBalance)

    } catch (error: any) {

        res.status(errorCode).send(error.message)
    }
})



//OPCIONAL 3 -
// Crie um endpoint put que receba um nome, um CPF e um valor. Ele deve adicionar o valor ao saldo do usuário.
// O nome e o CPF devem ser iguais ao que estiver salvo no sistema Se algum dos dados for diferente, exiba uma mensagem de erro.
//Endpoint que adiciona saldo

app.put("/accounts/addBalance", (req: Request, res: Response) => {

    let errorCode = 500

    try {

        const { name, cpf, value } = req.body

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

app.post("/accounts/payTheBills", (req: Request, res: Response) => {

    let errorCode = 500


    try {

        let { cpf, value, description, payday } = req.body
        let datePayday = new Date(payday).setHours(0, 0, 0, 0)
        let today = new Date(Date.now()).setHours(0, 0, 0, 0)

        if (!value || !description || !cpf) {
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
        const findUser = accounts.find((user) => {
            return user.cpf === cpf
        })

        if (!findUser) {
            errorCode = 422
            throw new Error("Usuário inesistente");
        }
        if (findUser) {
            //usuario tem saldo
            if (value > findUser.balance) {
                throw new Error("Saldo insuficiente")
            } else {
                if (!payday) {
                    payday = new Date(Date.now()).setHours(0, 0, 0, 0)

                }

                if (datePayday < today) {
                    return res.status(400).send("Data de pagamento já se passou")
                }
                if (datePayday === today) {
                    findUser.balance = findUser.balance - value
                    accounts.map((user) => {
                        if (user.id === findUser.id) {
                            user.balance = findUser.balance
                        }
                    })
                    res.status(200).send("Pagamento Efetuado")
                } else if (datePayday > today) {
                    transactions.push({
                        id: transactions.length + 1,
                        payerId: findUser.id,
                        dateTime: payday,
                        value: value,
                        description: description,
                        recieverId: transactions.length + 100000
                    })
                    return res.status(200).send("Agendamento Realizado com sucesso.")
                }
            }
        } else {
            res.status(404).send("Usuário não encontrado")
        }

    } catch (error: any) {

        res.status(errorCode).send(error.message)
    }
})


// Crie um novo endpoint put responsável por atualizar o saldo de um cliente.
// Para isto, percorra os itens do extrato e atualize o saldo somente para as contas cujas datas são anteriores a hoje. 
app.put("/accounts/updateBalance/:userId", (req: Request, res: Response) => {

    let errorCode = 500
    const userId = req.params.userId

    try {

        const findUser = accounts.find((user) => {
            return Number(user.id) === Number(userId)
        })

        if (!findUser) {
            errorCode = 422
            throw new Error("Usuário inexistente");
        } else if (findUser) {
            transactions.map((transaction) => {
                let dateTransaction = new Date(transaction.dateTime).setHours(0, 0, 0, 0)
                if (dateTransaction <= new Date(Date.now()).setHours(0, 0, 0, 0)) {
                    if (Number(userId) === Number(transaction.payerId)) {

                        findUser.balance = findUser.balance - transaction.value

                    } else if (Number(userId) === Number(transaction.recieverId)) {

                        findUser.balance = findUser.balance + transaction.value

                    }

                    return res.status(200).send(findUser)

                }
            })
        }

    } catch (error: any) {

        res.status(errorCode).send(error.message)
    }
})


//Endpoint de transferência entre contas
app.post("/accounts/moneyTransfer", (req: Request, res: Response) => {

    let errorCode = 500
    let payerId: number;
    let recieverId: number;

    try {

        const { payerName, payerCpf, value, description, recieverName, recieverCpf } = req.body

        if (!payerName) {
            errorCode = 422
            throw new Error('Nome do usuário da conta faltando')
        }
        if (!payerCpf) {
            errorCode = 422
            throw new Error('CPF do usuário da conta faltando')
        }
        if (!value) {
            errorCode = 422
            throw new Error('Valor da transferência faltando')
        }
        if (!recieverName) {
            errorCode = 422
            throw new Error('Nome da pessoa que vai receber faltando')
        }
        if (!recieverCpf) {
            errorCode = 422
            throw new Error('CPF da pessoa que vai receber faltando')
        }

        const payerAccountExists = accounts.find((user) => {
            return (user.name === payerName && user.cpf === payerCpf)

        })

        if (!payerAccountExists) {
            errorCode = 409
            throw new Error('Nome e CPF não correspondem á uma conta bancária válida')
        }
        const recieverAccountExists = accounts.find((user) => {
            return user.name === recieverName && user.cpf === recieverCpf
        })

        if (!recieverAccountExists) {
            errorCode = 409
            throw new Error('A pessoa que vai receber o dinheiro, não possui uma conta bancária')
        }
        if (!description) {
            //Verifica Saldo
            accounts.map((user) => {
                if (user.balance < value) {
                    errorCode = 409
                    throw new Error('Saldo insuficiente para a transação ')
                } else {
                    if (user.name === payerName && user.cpf === payerCpf) {
                        payerId = user.id
                    }
                    if (user.name === recieverName && user.cpf === recieverCpf) {
                        recieverId = user.id
                    }
                }
                const actualDate = new Date(Date.now()).toString()
                transactions.push({
                    id: transactions.length + 1,
                    payerId: Number(payerId),
                    dateTime: actualDate,
                    value: value,
                    description: ' ',
                    recieverId: Number(recieverId)
                })
            })

        } else {
            accounts.map((user) => {
                if (user.name === payerName && user.cpf === payerCpf) {
                    payerId = user.id
                }
                if (user.name === recieverName && user.cpf === recieverCpf) {
                    recieverId = user.id
                }
                const actualDate = new Date(Date.now()).toString()
                transactions.push({
                    id: transactions.length + 1,
                    payerId: Number(payerId),
                    dateTime: actualDate,
                    value: value,
                    description: description,
                    recieverId: Number(recieverId)
                })
            })
        }

        res.status(200).send('Transferência Realizada com sucesso!')

    } catch (error: any) {

        res.status(errorCode).send(error.message)
    }
})


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});

