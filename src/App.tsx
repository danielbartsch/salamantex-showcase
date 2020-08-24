import React from "react"
import { map } from "lodash"

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

type Users = {
  [key in UserId]: User
}
type Transactions = {
  [key in TransactionId]: Transaction
}

const database: { users: Users; transactions: Transactions } = {
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
  const [users, setUsers] = React.useState<Array<User> | null>(null)

  React.useEffect(() => {
    setUsers(map(database.users))
  }, [])

  return (
    <>
      <h3>Users</h3>
      <div>
        {users === null ? (
          "Loading..."
        ) : users.length > 0 ? (
          <UserList users={users} />
        ) : (
          "No users saved"
        )}
      </div>
    </>
  )
}

const UserList = ({ users }: { users: Array<User> }) => (
  <>
    {users.map((user) => (
      <User user={user} />
    ))}
  </>
)

const User = ({ user }: { user: User }) => {
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
              <div>
                <div>
                  <CurrencyType {...currency} />
                </div>
                <div>Balance: {currency.balance}</div>
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

const TransactionList = ({ user }: { user: User }) => {
  const [transactions, setTransactions] = React.useState<Array<
    Transaction
  > | null>(null)

  React.useEffect(() => {
    const transactionsInvolvingUser = map(
      database.transactions
    ).filter(({ sourceUserId, targetUserId }) =>
      [sourceUserId, targetUserId].includes(user.id)
    )
    setTransactions(transactionsInvolvingUser)
  }, [user])

  if (transactions === null) {
    return <>Loading...</>
  }

  return (
    <>
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction) => (
            <Transaction transaction={transaction} />
          ))}
        </ul>
      ) : (
        "No transactions found..."
      )}
    </>
  )
}

const Transaction = ({ transaction }: { transaction: Transaction }) => {
  return (
    <li>
      <UserRepresentation id={transaction.sourceUserId} /> sent{" "}
      {transaction.amount} <CurrencyType type={transaction.type} /> to{" "}
      <UserRepresentation id={transaction.targetUserId} />
    </li>
  )
}

const UserRepresentation = ({ id }: { id: UserId }) => {
  const user = database.users[id]

  if (!user) {
    return <>user not found</>
  }
  return <span title={user.email}>{user.name}</span>
}

export default App
