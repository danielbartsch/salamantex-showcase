import * as React from "react"
import { sortBy } from "lodash"
import { CurrencyType } from "./CurrencyType"
import { UserRepresentation } from "./UserRepresentation"
import { CrossIcon } from "./CrossIcon"
import { User as UserType, Transaction as TransactionType } from "../types"
import { useTransactionsInvolvingUser } from "../utils"

export const TransactionList = ({ user }: { user: UserType }) => {
  const transactions = useTransactionsInvolvingUser(user.id)

  if (transactions === null) {
    return <>Loading...</>
  }

  return (
    <>
      {transactions.length > 0 ? (
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Recipient/Sender</th>
            </tr>
          </thead>
          <tbody>
            {sortBy(transactions, ({ created }) => -created).map(
              (transaction) => (
                <tr key={transaction.id} className="row">
                  <TransactionRow meId={user.id} transaction={transaction} />
                </tr>
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

const TransactionRow = ({
  transaction,
  meId,
}: {
  transaction: TransactionType
  meId: UserType["id"]
}) => (
  <>
    <TransactionState state={transaction.state} />
    {meId === transaction.sourceUserId ? (
      <td title="sent">
        <Arrow direction="right" color="#a44" />
      </td>
    ) : (
      <td title="received">
        <Arrow color="#4a4" />
      </td>
    )}
    <td align="right">{transaction.amount}</td>
    <td>
      <CurrencyType type={transaction.type} />
    </td>
    <td>
      <UserRepresentation
        id={
          meId === transaction.sourceUserId
            ? transaction.targetUserId
            : transaction.sourceUserId
        }
      />
    </td>
  </>
)

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
          <CrossIcon color="#a44" />
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
