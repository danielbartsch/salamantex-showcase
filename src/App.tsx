import React from "react"
import { map } from "lodash"
import { User as UserType } from "./types"
import { User } from "./components/User"
import { TransactionForm } from "./components/TransactionForm"
import { DatabaseContext, Database, initialDatabase } from "./globals"
import { useTransactionProcessor } from "./utils"

export const App = () => {
  const [currentDatabase, setDatabase] = React.useState<Database>(
    initialDatabase
  )

  const [users, setUsers] = React.useState<Array<UserType> | null>(null)

  React.useEffect(() => {
    setUsers(map(currentDatabase.users))
  }, [currentDatabase.users])

  useTransactionProcessor(currentDatabase, setDatabase)

  return (
    <DatabaseContext.Provider value={currentDatabase}>
      <h3>Users</h3>
      <div>
        {users === null
          ? "Loading..."
          : users.length > 0
          ? users.map((user) => <User key={user.id} user={user} />)
          : "No users saved"}
      </div>
      <div>
        <TransactionForm
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
    </DatabaseContext.Provider>
  )
}
