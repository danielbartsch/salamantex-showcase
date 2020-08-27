import React from "react"
import { map, uniqueId } from "lodash"
import Select from "react-select"
import {
  User as UserType,
  Transaction as TransactionType,
  CryptoCurrency,
} from "./types"
import { currencies } from "./constants"

type Users = {
  [key in UserType["id"]]: UserType
}
type Transactions = {
  [key in TransactionType["id"]]: TransactionType
}

type Database = { users: Users; transactions: Transactions }

const initialDatabase: Database = {
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

function App() {
  const [currentDatabase, setDatabase] = React.useState<Database>(
    initialDatabase
  )

  const [users, setUsers] = React.useState<Array<UserType> | null>(null)

  React.useEffect(() => {
    setUsers(map(currentDatabase.users))
  }, [currentDatabase.users])

  return (
    <>
      <h3>Users</h3>
      <div>
        {users === null ? (
          "Loading..."
        ) : users.length > 0 ? (
          <UserList users={users} database={currentDatabase} />
        ) : (
          "No users saved"
        )}
      </div>
      <div>
        <NewTransactionForm
          database={currentDatabase}
          onApply={(transaction) =>
            setDatabase((prev) => ({
              ...prev,
              transactions: {
                ...prev.transactions,
                [transaction.id]: transaction,
              },
            }))
          }
        />
      </div>
    </>
  )
}

const UserList = ({
  users,
  database,
}: {
  users: Array<UserType>
  database: Database
}) => (
  <>
    {users.map((user) => (
      <User user={user} database={database} />
    ))}
  </>
)

const User = ({ user, database }: { user: UserType; database: Database }) => {
  const [showDetails, setShowDetails] = React.useState(false)
  const [showTransactions, setShowTransactions] = React.useState(false)
  return (
    <div>
      <UserRepresentation id={user.id} database={database} />
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
              <div>
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
                    database={database}
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
      {showTransactions && <TransactionList user={user} database={database} />}
    </div>
  )
}

const Balance = ({
  userId,
  currencyBalance,
  currencyType,
  now,
  database,
}: {
  userId: UserType["id"]
  currencyBalance: CryptoCurrency["balance"]
  currencyType: CryptoCurrency["type"]
  now: number
  database: Database
}) => {
  const transactions = useTransactionsInvolvingUser(userId, database)

  const balance = transactions?.reduce(
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

  return <>{balance}</>
}

const CurrencyType = ({ type }: { type: CryptoCurrency["type"] }) => {
  switch (type) {
    case "ethereum":
      return <>Ethereum</>
    case "bitcoin":
      return <>Bitcoin</>
    default:
      return <>currency not found</>
  }
}

const currencyOptions = currencies.map((currency) => ({
  value: currency,
  label: <CurrencyType type={currency} />,
}))

const useTransactionsInvolvingUser = (
  userId: UserType["id"],
  database: Database
) => {
  const [transactions, setTransactions] = React.useState<Array<
    TransactionType
  > | null>(null)

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

const TransactionList = ({
  user,
  database,
}: {
  user: UserType
  database: Database
}) => {
  const transactions = useTransactionsInvolvingUser(user.id, database)

  if (transactions === null) {
    return <>Loading...</>
  }

  return (
    <>
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction) => (
            <Transaction transaction={transaction} database={database} />
          ))}
        </ul>
      ) : (
        "No transactions found..."
      )}
    </>
  )
}

const Transaction = ({
  transaction,
  database,
}: {
  transaction: TransactionType
  database: Database
}) => {
  return (
    <li>
      {transaction.state === "processed" ? "Successfull:" : null}
      {transaction.state === "invalid" ? "Failed:" : null}
      <UserRepresentation
        id={transaction.sourceUserId}
        database={database}
      />{" "}
      sent {transaction.amount} <CurrencyType type={transaction.type} /> to{" "}
      <UserRepresentation id={transaction.targetUserId} database={database} />
    </li>
  )
}

const UserRepresentation = ({
  id,
  database,
}: {
  id: UserType["id"]
  database: Database
}) => {
  const user = database.users[id]

  if (!user) {
    return <>user not found</>
  }
  return <span title={user.email}>{user.name}</span>
}

const NewTransactionForm = ({
  onApply,
  database,
}: {
  onApply: (transaction: TransactionType) => void
  database: Database
}) => {
  const [users, setUsers] = React.useState<Array<UserType> | null>(null)

  React.useEffect(() => {
    setUsers(map(database.users))
  }, [database.users])

  const [targetUserId, setTargetUserId] = React.useState<UserType["id"] | null>(
    null
  )
  const [sourceUserId, setSourceUserId] = React.useState<UserType["id"] | null>(
    null
  )

  const [amount, setAmount] = React.useState<number>(0)

  const [currency, setCurrency] = React.useState<CryptoCurrency["type"]>(
    currencies[0]
  )

  const userOptions = (users ?? []).map((user) => ({
    value: user.id,
    label: <UserRepresentation id={user.id} database={database} />,
  }))
  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          Source
          <Select
            options={userOptions}
            value={userOptions.find(({ value }) => sourceUserId === value)}
            onChange={(newValue: any) => {
              setSourceUserId(newValue?.value ?? null)
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          Target
          <Select
            options={userOptions}
            value={userOptions.find(({ value }) => targetUserId === value)}
            onChange={(newValue: any) => {
              setTargetUserId(newValue?.value ?? null)
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          Amount
          <input
            type="number"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.valueAsNumber)
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          Currency
          <Select
            options={currencyOptions}
            value={currencyOptions.find(({ value }) => currency === value)}
            onChange={(newValue: any) => {
              setCurrency(newValue?.value ?? null)
            }}
          />
        </div>
      </div>
      {sourceUserId !== null && targetUserId !== null && (
        <button
          type="button"
          onClick={() =>
            onApply({
              id: uniqueId(),
              amount,
              type: currency,
              sourceUserId,
              targetUserId,
              created: Date.now(),
              processed: null,
              state: null,
            })
          }
        >
          Apply
        </button>
      )}
    </>
  )
}

export default App
