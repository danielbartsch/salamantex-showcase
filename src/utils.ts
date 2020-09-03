import * as React from "react"
import { flatMap, map, sortBy } from "lodash"
import { Transaction, User, CryptoCurrency } from "./types"
import { Database } from "./globals"

export const getBalance = (
  transactions: Array<Transaction>,
  userId: User["id"],
  currencyBalance: number,
  currencyType: CryptoCurrency["type"],
  now: number
) =>
  transactions?.reduce(
    (sum, { type, amount, sourceUserId, processed, state }) => {
      if (
        type === currencyType &&
        state === "processed" &&
        processed !== null &&
        processed < now
      ) {
        return sum + (sourceUserId === userId ? -amount : amount)
      }

      return sum
    },
    currencyBalance ?? 0
  )

export const getCurrencyString = ({
  type,
}: {
  type: CryptoCurrency["type"]
}) => {
  switch (type) {
    case "ethereum":
      return "Ethereum"
    case "bitcoin":
      return "Bitcoin"
    default:
      return "currency not found"
  }
}

export const useTransactionProcessor = (
  currentDatabase: Database,
  setDatabase: (setter: (state: Database) => Database) => void
) => {
  React.useEffect(() => {
    const interval = setInterval(() => {
      const allTransactions = map(currentDatabase.transactions)
      const [processingTransaction] = sortBy(
        flatMap(allTransactions, (transaction) =>
          transaction.processed === null ? [transaction] : []
        ),
        ({ created }) => created
      )

      if (processingTransaction) {
        const now = Date.now()

        const currencyInfo = currentDatabase.users[
          processingTransaction.sourceUserId
        ].currencies.find(({ type }) => type === processingTransaction.type)

        const initialBalance = currencyInfo?.balance ?? 0
        const currentBalance = getBalance(
          allTransactions,
          processingTransaction.sourceUserId,
          initialBalance,
          processingTransaction.type,
          now
        )

        setDatabase((prev) => ({
          ...prev,
          transactions: {
            ...prev.transactions,
            [processingTransaction.id]: {
              ...prev.transactions[processingTransaction.id],
              processed: now,
              state:
                currentBalance <
                  prev.transactions[processingTransaction.id].amount &&
                currencyInfo?.maxTransactionAmount !== undefined &&
                prev.transactions[processingTransaction.id].amount <=
                  currencyInfo?.maxTransactionAmount
                  ? "invalid"
                  : "processed",
            },
          },
        }))
      }
    }, 1000 * 3)
    return () => {
      clearInterval(interval)
    }
  })
}
