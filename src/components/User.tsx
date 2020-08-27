import * as React from "react"
import { map } from "lodash"
import { CurrencyType } from "./CurrencyType"
import { UserRepresentation } from "./UserRepresentation"
import {
  User as UserType,
  Transaction as TransactionType,
  CryptoCurrency,
} from "../types"
import { DatabaseContext } from "../globals"
import { getBalance } from "../utils"

export const User = ({ user }: { user: UserType }) => {
  const [showDetails, setShowDetails] = React.useState(false)
  const [showTransactions, setShowTransactions] = React.useState(false)
  return (
    <div>
      <UserRepresentation id={user.id} />
      <button onClick={() => setShowDetails((prev) => !prev)}>
        Show details
      </button>
      <button onClick={() => setShowTransactions((prev) => !prev)}>
        Show transactions
      </button>
      {showDetails && (
        <div>
          <div>{user.description}</div>
          <div>
            {user.currencies.map((currency) => (
              <div key={currency.walletId}>
                <div>
                  <CurrencyType {...currency} />
                </div>
                <div>
                  Balance:{" "}
                  <Balance
                    userId={user.id}
                    currencyBalance={currency.balance}
                    currencyType={currency.type}
                    now={Date.now()}
                  />
                </div>
                <div>
                  Maximum amount in a single transaction:{" "}
                  {currency.maxTransactionAmount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showTransactions && <TransactionList user={user} />}
    </div>
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
  return <>{useBalance(userId, currencyBalance, currencyType, now)}</>
}

const TransactionList = ({ user }: { user: UserType }) => {
  const transactions = useTransactionsInvolvingUser(user.id)

  if (transactions === null) {
    return <>Loading...</>
  }

  return (
    <>
      {transactions.length > 0 ? (
        <div
          style={{
            backgroundColor: "#fefeff",
            borderTop: "4px solid #eef",
            borderRight: "1px solid #dde",
            borderLeft: "1px solid #dde",
            borderBottom: "1px solid #eef",
            borderRadius: 2,
            boxShadow: "0px 1px 5px #0013",
            padding: 4,
          }}
        >
          {transactions.map((transaction) => (
            <Transaction
              key={transaction.id}
              meId={user.id}
              transaction={transaction}
            />
          ))}
        </div>
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
        <svg viewBox="0 0 12 12" width="12" height="12">
          <path d="m9,1 l2,2 l-7,7 l-4,-4 l2,-2 l2,2z" fill="#4a4" />
        </svg>
      )
    case "invalid":
      return (
        <svg viewBox="0 0 12 12" width="12" height="12">
          <path
            d="m2,0 l-2,2 l10,10 l2,-2 l-10,-10z M12,2 l-2,-2 l-10,10 l2,2 l-10,10z"
            fill="#a44"
          />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 12 12" width="12" height="12" className="rotate">
          <circle r="2" cx="6" cy="2" fill="#aaa" />
          <circle r="2" cx="6" cy="10" fill="#aaa" />
        </svg>
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
    <div>
      <TransactionState state={transaction.state} />
      {meId === transaction.sourceUserId ? (
        <>
          <Arrow direction="right" color="#a44" /> {transaction.amount}{" "}
          <CurrencyType type={transaction.type} />{" "}
          <UserRepresentation id={transaction.targetUserId} />
        </>
      ) : (
        <>
          <Arrow color="#4a4" /> {transaction.amount}{" "}
          <CurrencyType type={transaction.type} />{" "}
          <UserRepresentation id={transaction.sourceUserId} />
        </>
      )}
    </div>
  )
}
