import * as React from "react"
import { CurrencyType } from "./CurrencyType"
import { UserRepresentation } from "./UserRepresentation"
import { TransactionList } from "./TransactionList"
import { Balance } from "./Balance"
import { Modal } from "./Modal"
import { User as UserType } from "../types"

export const UserList = ({ users }: { users: Array<UserType> }) => (
  <>
    {users.length > 0
      ? users.map((user) => (
          <div className="row" key={user.id}>
            <UserRow user={user} />
          </div>
        ))
      : "No users found..."}
  </>
)

const UserRow = ({ user }: { user: UserType }) => {
  const [showSummary, setShowSummary] = React.useState(false)
  const [showTransactions, setShowTransactions] = React.useState(false)
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <UserRepresentation id={user.id} />
        <div
          className="group"
          style={{ paddingTop: "0.1em", paddingBottom: "0.1em" }}
        >
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
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Currency</th>
                <th>Balance</th>
                <th>Transaction limit</th>
              </tr>
            </thead>
            <tbody>
              {user.currencies.map((currency) => (
                <tr key={currency.walletId} className="row">
                  <td>
                    <CurrencyType {...currency} />
                  </td>
                  <td align="right">
                    <Balance
                      userId={user.id}
                      currencyBalance={currency.balance}
                      currencyType={currency.type}
                      now={Date.now()}
                    />
                  </td>
                  <td align="right">{currency.maxTransactionAmount}</td>
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
