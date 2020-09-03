import * as React from "react"
import { map, sortBy } from "lodash"
import { CurrencyType } from "./CurrencyType"
import { UserRepresentation } from "./UserRepresentation"
import { Modal } from "./Modal"
import {
  User as UserType,
  Transaction as TransactionType,
  CryptoCurrency,
} from "../types"
import { DatabaseContext } from "../globals"
import { getBalance } from "../utils"

export const User = ({ user }: { user: UserType }) => {
  const [showSummary, setShowSummary] = React.useState(false)
  const [showTransactions, setShowTransactions] = React.useState(false)
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <UserRepresentation id={user.id} />
        <div>
          <button onClick={() => setShowSummary((prev) => !prev)}>
            Summary
          </button>
          <button onClick={() => setShowTransactions((prev) => !prev)}>
            Transactions
          </button>
        </div>
      </div>
      {showSummary && (
        <Modal
          title={
            <>
              Summary of <UserRepresentation id={user.id} />
            </>
          }
          onClose={() => setShowSummary((prev) => !prev)}
        >
          <div style={{ textDecoration: "underline", marginBottom: "0.75em" }}>
            {user.description}
          </div>
          <table>
            <thead>
              <th>Currency</th>
              <th>Balance</th>
              <th>Transaction limit</th>
            </thead>
            <tbody>
              {user.currencies.map((currency) => (
                <tr key={currency.walletId}>
                  <td>
                    <CurrencyType {...currency} />
                  </td>
                  <td>
                    <Balance
                      userId={user.id}
                      currencyBalance={currency.balance}
                      currencyType={currency.type}
                      now={Date.now()}
                    />
                  </td>
                  <td>{currency.maxTransactionAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
      {showTransactions && (
        <Modal
          title={
            <>
              Transactions of <UserRepresentation id={user.id} />
            </>
          }
          onClose={() => setShowTransactions((prev) => !prev)}
        >
          <TransactionList user={user} />
        </Modal>
      )}
    </>
  )
}

const useTransactionsInvolvingUser = (userId: UserType["id"]) => {
  const [transactions, setTransactions] = React.useState<Array<
    TransactionType
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

const Balance = ({
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

const TransactionList = ({ user }: { user: UserType }) => {
  const transactions = useTransactionsInvolvingUser(user.id)

  if (transactions === null) {
    return <>Loading...</>
  }

  return (
    <>
      {transactions.length > 0 ? (
        <table>
          <thead>
            <th></th>
            <th></th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Recipient/Sender</th>
          </thead>
          <tbody>
            {sortBy(transactions, ({ created }) => -created).map(
              (transaction) => (
                <Transaction
                  key={transaction.id}
                  meId={user.id}
                  transaction={transaction}
                />
              )
            )}
          </tbody>
        </table>
      ) : (
        "No transactions found..."
      )}
    </>
  )
}

const Arrow = ({
  direction = "left",
  color,
}: {
  direction?: "left" | "right"
  color: string
}) => {
  const path = (
    <path d="m0,6 l6,6 l0,-2 l18,0 l0,-8 l-18,0 l0,-2z" fill={color} />
  )
  return (
    <svg viewBox="0 0 24 12" width="24" height="10">
      {direction === "left" ? (
        path
      ) : (
        <g transform="scale(-1) translate(-24,-12)">{path}</g>
      )}
    </svg>
  )
}

const TransactionState = ({ state }: { state: TransactionType["state"] }) => {
  switch (state) {
    case "processed":
      return (
        <td title="Successful transaction">
          <svg viewBox="0 0 12 12" width="12" height="12">
            <path d="m9,1 l2,2 l-7,7 l-4,-4 l2,-2 l2,2z" fill="#4a4" />
          </svg>
        </td>
      )
    case "invalid":
      return (
        <td title="Failed transaction">
          <svg viewBox="0 0 12 12" width="12" height="12">
            <path
              d="m2,0 l-2,2 l10,10 l2,-2 l-10,-10z M12,2 l-2,-2 l-10,10 l2,2 l-10,10z"
              fill="#a44"
            />
          </svg>
        </td>
      )
    default:
      return (
        <td title="Transaction to be processed">
          <svg viewBox="0 0 12 12" width="12" height="12" className="rotate">
            <circle r="2" cx="6" cy="2" fill="#aaa" />
            <circle r="2" cx="6" cy="10" fill="#aaa" />
          </svg>
        </td>
      )
  }
}

const Transaction = ({
  transaction,
  meId,
}: {
  transaction: TransactionType
  meId: UserType["id"]
}) => {
  return (
    <tr>
      <TransactionState state={transaction.state} />
      {meId === transaction.sourceUserId ? (
        <>
          <td title="sent">
            <Arrow direction="right" color="#a44" />
          </td>
          <td>{transaction.amount}</td>
          <td>
            <CurrencyType type={transaction.type} />
          </td>
          <td>
            <UserRepresentation id={transaction.targetUserId} />
          </td>
        </>
      ) : (
        <>
          <td title="received">
            <Arrow color="#4a4" />
          </td>
          <td>{transaction.amount}</td>
          <td>
            <CurrencyType type={transaction.type} />
          </td>
          <td>
            <UserRepresentation id={transaction.sourceUserId} />
          </td>
        </>
      )}
    </tr>
  )
}
