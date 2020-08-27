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
        <ul>
          {transactions.map((transaction) => (
            <Transaction key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      ) : (
        "No transactions found..."
      )}
    </>
  )
}

const Transaction = ({ transaction }: { transaction: TransactionType }) => {
  return (
    <li>
      {transaction.state === "processed" ? "Successfull:" : null}
      {transaction.state === "invalid" ? "Failed:" : null}
      <UserRepresentation id={transaction.sourceUserId} /> sent{" "}
      {transaction.amount} <CurrencyType type={transaction.type} /> to{" "}
      <UserRepresentation id={transaction.targetUserId} />
    </li>
  )
}
