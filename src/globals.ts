import * as React from "react"
import { User, Transaction } from "./types"

type Users = {
  [key in User["id"]]: User
}
type Transactions = {
  [key in Transaction["id"]]: Transaction
}

export type Database = { users: Users; transactions: Transactions }

export const initialDatabase: Database = {
  users: {
    a: {
      id: "a",
      name: "Franz Ferdinand",
      description: "Prince of Austria-Hungary",
      email: "franz.ferdinand@royal.kuk",
      currencies: [
        {
          type: "bitcoin",
          balance: 445,
          walletId: "1GVY5eZvtc5bA6EFEGnpqJeHUC5YaV5dsb",
          maxTransactionAmount: 10,
        },
        {
          type: "ethereum",
          balance: 18000,
          walletId: "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be",
          maxTransactionAmount: 500,
        },
      ],
    },
    b: {
      id: "b",
      name: "Marie Antoinette",
      description: "Queen of France",
      email: "marie.antoinette@larepublique.fr",
      currencies: [
        {
          type: "bitcoin",
          balance: 2500,
          walletId: "3VGW5eZvtc5bA6EFEGnpqJeHUC5YaV5dsb",
          maxTransactionAmount: 50,
        },
        {
          type: "ethereum",
          balance: 25000,
          walletId: "0xff0ce5fbfe3e9af3971dd833d26ba9b5c936f0be",
          maxTransactionAmount: 12500,
        },
      ],
    },
  },
  transactions: {
    one: {
      id: "one",
      amount: 25,
      type: "ethereum",
      sourceUserId: "b",
      targetUserId: "a",
      created: new Date(2020, 3, 20).getTime(),
      processed: new Date(2020, 3, 21).getTime(),
      state: "processed",
    },
    two: {
      id: "two",
      amount: 42,
      type: "ethereum",
      sourceUserId: "a",
      targetUserId: "b",
      created: new Date(2020, 2, 18).getTime(),
      processed: new Date(2020, 2, 19).getTime(),
      state: "processed",
    },
    three: {
      id: "three",
      amount: 10,
      type: "bitcoin",
      sourceUserId: "a",
      targetUserId: "b",
      created: new Date(2020, 2, 18).getTime(),
      processed: null,
      state: null,
    },
    four: {
      id: "four",
      amount: 600,
      type: "bitcoin",
      sourceUserId: "a",
      targetUserId: "b",
      created: new Date(2020, 5, 9).getTime(),
      processed: null,
      state: null,
    },
    five: {
      id: "five",
      amount: 3000,
      type: "bitcoin",
      sourceUserId: "b",
      targetUserId: "a",
      created: new Date(2020, 5, 9).getTime(),
      processed: new Date(2020, 5, 20).getTime(),
      state: "invalid",
    },
  },
}

export const DatabaseContext = React.createContext(initialDatabase)
