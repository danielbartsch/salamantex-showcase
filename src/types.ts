import { currencies } from "./constants"

export type CryptoCurrency = {
  type: typeof currencies[number]
  walletId: string
  balance: number
  maxTransactionAmount: number
}
export type User = {
  id: string
  name: string
  description: string
  email: string
  currencies: Array<CryptoCurrency>
}

export type Transaction = {
  id: string
  amount: number
  type: CryptoCurrency["type"]
  sourceUserId: User["id"]
  targetUserId: User["id"]
  created: number
  processed: number | null
  state: "invalid" | "processed" | null
}
