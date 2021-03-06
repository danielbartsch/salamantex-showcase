import * as React from "react"
import { flatMap, map, sortBy } from "lodash"
import { Transaction, User, CryptoCurrency } from "./types"
import { Database, DatabaseContext } from "./globals"

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

export const getCurrencyString = (type: CryptoCurrency["type"]) => {
  switch (type) {
    case "ethereum":
      return "Ethereum"
    case "bitcoin":
      return "Bitcoin"
    default:
      return "currency not found"
  }
}

export const useTransactionsInvolvingUser = (userId: User["id"]) => {
  const [transactions, setTransactions] = React.useState<Array<
    Transaction
  > | null>(null)

  const database = React.useContext(DatabaseContext)

  React.useEffect(() => {
    const transactionsInvolvingUser = map(
      database.transactions
    ).filter(({ sourceUserId, targetUserId }) =>
      [sourceUserId, targetUserId].includes(userId)
    )
    setTransactions(transactionsInvolvingUser)
  }, [database.transactions, userId])

  return transactions
}

export const isValidTransaction = (
  transactionAmount: number,
  sourceUserBalance: number,
  sourceUserMaxTransactionAmount: number | undefined
): boolean =>
  transactionAmount > 0 &&
  sourceUserBalance >= transactionAmount &&
  (sourceUserMaxTransactionAmount === undefined ||
    transactionAmount <= sourceUserMaxTransactionAmount)

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
              state: isValidTransaction(
                prev.transactions[processingTransaction.id].amount,
                currentBalance,
                currencyInfo?.maxTransactionAmount
              )
                ? "processed"
                : "invalid",
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
