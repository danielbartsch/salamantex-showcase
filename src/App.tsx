import React from "react"
import { map } from "lodash"
import { User as UserType } from "./types"
import { User } from "./components/User"
import { TransactionForm } from "./components/TransactionForm"
import { Modal } from "./components/Modal"
import { DatabaseContext, Database, initialDatabase } from "./globals"
import { useTransactionProcessor } from "./utils"

export const App = () => {
  const [currentDatabase, setDatabase] = React.useState<Database>(
    initialDatabase
  )

  const [users, setUsers] = React.useState<Array<UserType> | null>(null)
  const [showTransactionForm, setShowTransactionForm] = React.useState(false)

  React.useEffect(() => {
    setUsers(map(currentDatabase.users))
  }, [currentDatabase.users])

  useTransactionProcessor(currentDatabase, setDatabase)

  return (
    <DatabaseContext.Provider value={currentDatabase}>
      <div style={{ paddingLeft: "2em", paddingRight: "2em" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3>Users</h3>
          <button onClick={() => setShowTransactionForm(true)}>
            + Transaction
          </button>
        </div>
        <div>
          {users === null
            ? "Loading..."
            : users.length > 0
            ? users.map((user) => <User key={user.id} user={user} />)
            : "No users saved"}
        </div>

        {showTransactionForm && (
          <Modal
            title="Create a new Transaction"
            onClose={() => setShowTransactionForm((prev) => !prev)}
          >
            <TransactionForm
              onApply={(transaction) => {
                setDatabase((prev) => ({
                  ...prev,
                  transactions: {
                    ...prev.transactions,
                    [transaction.id]: transaction,
                  },
                }))
                setShowTransactionForm(false)
              }}
            />
          </Modal>
        )}
      </div>
    </DatabaseContext.Provider>
  )
}
