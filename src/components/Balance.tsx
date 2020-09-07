import * as React from "react"
import { User as UserType, CryptoCurrency } from "../types"
import { getBalance, useTransactionsInvolvingUser } from "../utils"

export const Balance = ({
  userId,
  currencyBalance,
  currencyType,
  now,
}: {
  userId: UserType["id"]
  currencyBalance: CryptoCurrency["balance"]
  currencyType: CryptoCurrency["type"]
  now: number
}) => {
  const balance = useBalance(userId, currencyBalance, currencyType, now)
  return (
    <span
      style={{
        color: balance > 0 ? "#4a4" : balance === 0 ? undefined : "#a44",
      }}
    >
      {balance}
    </span>
  )
}

const useBalance = (
  userId: UserType["id"],
  currencyBalance: number,
  currencyType: CryptoCurrency["type"],
  now: number
) =>
  getBalance(
    useTransactionsInvolvingUser(userId) ?? [],
    userId,
    currencyBalance,
    currencyType,
    now
  )
