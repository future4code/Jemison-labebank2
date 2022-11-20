import { Account, Transaction } from "./types"

export let accounts: Account[] = [
    {
        id: 1,
        name: 'Maria',
        cpf: '07021914504',
        birthDate: '1990/01/13',
        balance: 1000
    },
    {
        id: 2,
        name: 'João',
        cpf: '01274344530',
        birthDate: '1976/02/20',
        balance: 300,
    },
    {
        id: 3,
        name: 'Ana',
        cpf: '02345899050',
        birthDate: '1980/05/16',
        balance: 3000,
    }
]

export const transactions: Transaction[] = [
    {
        id: 1,
        payerId: 1,
        dateTime: '10/11/2022 15:40',
        value: 150,
        description: "devolução empréstimo",
        recieverId: 3
    },
    {
        id: 2,
        payerId: 1,
        dateTime: '10/11/2022 18:00',
        value: 100,
        description: "encomenda de bolo",
        recieverId: 3
    },
    {
        id: 3,
        payerId: 3,
        dateTime: '11/11/2022 09:10',
        value: 300,
        description: "carona até a praia",
        recieverId: 2
    },

]