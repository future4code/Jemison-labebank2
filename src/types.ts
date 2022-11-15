

export type Transaction = {
    id: number
    payerId:number
    dateTime:string
    value:number
    recieverId:number
}

export type Account = {
    id: number
    name: string,
    cpf: string,
    birthDate: string,
    balance: number,
    }