import React from "react"

type CryptoCurrencyType = "bitcoin" | "ethereum"

type CryptoCurrency = {
  type: CryptoCurrencyType
  walletId: string
  balance: number
  maxTransactionAmount: number
}

type UserId = string
type User = {
  id: UserId
  name: string
  description: string
  email: string
  currencies: Array<CryptoCurrency>
}

type TransactionId = string
type Transaction = {
  id: TransactionId
  amount: number
  type: CryptoCurrencyType
  sourceUserId: UserId
  targetUserId: UserId
  created: number
  processed: number | null
  state: "invalid" | "processed" | null
}

function App() {
  return <>Begin</>
}

export default App
