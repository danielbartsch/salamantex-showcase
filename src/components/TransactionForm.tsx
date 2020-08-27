import * as React from "react"
import Select from "react-select"
import { map, uniqueId } from "lodash"
import { Transaction, User, CryptoCurrency } from "../types"
import { DatabaseContext } from "../globals"
import { UserRepresentation } from "./UserRepresentation"
import { CurrencyType } from "./CurrencyType"
import { currencies } from "../constants"

export const TransactionForm = ({
  onApply,
}: {
  onApply: (transaction: Transaction) => void
}) => {
  const [users, setUsers] = React.useState<Array<User> | null>(null)
  const database = React.useContext(DatabaseContext)

  React.useEffect(() => {
    setUsers(map(database.users))
  }, [database.users])

  const [targetUserId, setTargetUserId] = React.useState<User["id"] | null>(
    null
  )
  const [sourceUserId, setSourceUserId] = React.useState<User["id"] | null>(
    null
  )

  const [amount, setAmount] = React.useState<number>(0)

  const [currency, setCurrency] = React.useState<CryptoCurrency["type"]>(
    currencies[0]
  )

  const userOptions = (users ?? []).map((user) => ({
    value: user.id,
    label: <UserRepresentation id={user.id} />,
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

const currencyOptions = currencies.map((currency) => ({
  value: currency,
  label: <CurrencyType type={currency} />,
}))