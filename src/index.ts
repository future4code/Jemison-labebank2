import express, { Request, Response } from "express"

import cors from 'cors'

const app = express()

app.use(express.json())

app.use(cors())

type transaction = {
    value: number,
    date: string,
    description: string
}

type account = {
    name: string,
    cpf: string,
    birthDate: string,
    balance: number,
    transactions: transaction[]
}

let accounts: account[] = [
    {
        name: 'Maria',
        cpf: '07021914504',
        birthDate: '01/01/2000',
        balance: 1000,
        transactions: [
            {
                value: 40,
                date: '18/08/2022',
                description: 'Corte de cabelo'
            },
            {
                value: 5,
                date: '10/11/2022',
                description: 'Cafe expresso'
            }
        ]
    },
    {
        name: 'João',
        cpf: '01274344530',
        birthDate: '10/02/1976',
        balance: 0,
        transactions: []
    }
]

//Endpoint que cadastra um novo usuário
app.post("/accounts", (req: Request, res: Response) => {
    const {name, cpf, birthDate} = req.body

    const newAccount: account= {
        name,
        cpf,
        birthDate,
        balance: 0,
        transactions: []
    }
    accounts.push(newAccount)
    res.status(200).send("Create account")
})

// Endpoint que retorna todos os usuários 
app.get("/accounts", (req: Request, res: Response) => {
    res.status(200).send(accounts)
})

app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});