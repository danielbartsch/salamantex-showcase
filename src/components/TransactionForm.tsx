import * as React from "react"
import { map, uniqueId } from "lodash"
import { Transaction, User, CryptoCurrency } from "../types"
import { DatabaseContext } from "../globals"
import { currencies } from "../constants"
import { getCurrencyString } from "../utils"

const Select = ({
  value,
  onChange,
  options,
}: {
  value: string | undefined
  onChange: (value: string) => void
  options: Array<{ value: string; label: React.ReactNode }>
}) => (
  <select onChange={(event) => onChange(event.target.value)} value={value}>
    {options.map((option) => (
      <option value={option.value} key={String(option.value)}>
        {option.label}
      </option>
    ))}
  </select>
)

const InputBox = ({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) => (
  <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
    <div>{label}</div>
    {children}
  </div>
)

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
    label: user.name,
  }))
  return (
    <>
      <div style={{ display: "flex" }}>
        <InputBox label="Source">
          <Select
            options={
              targetUserId
                ? userOptions.filter(({ value }) => value !== targetUserId)
                : userOptions
            }
            value={sourceUserId ?? undefined}
            onChange={(newValue: any) => {
              setSourceUserId(newValue)
            }}
          />
        </InputBox>
        <InputBox label="Target">
          <Select
            options={
              sourceUserId
                ? userOptions.filter(({ value }) => value !== sourceUserId)
                : userOptions
            }
            value={targetUserId ?? undefined}
            onChange={(newValue: any) => {
              setTargetUserId(newValue)
            }}
          />
        </InputBox>
        <InputBox label="Amount">
          <input
            type="number"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.valueAsNumber)
            }}
            min={0}
          />
        </InputBox>
        <InputBox label="Currency">
          <Select
            options={currencyOptions}
            value={currency}
            onChange={(newValue: any) => {
              setCurrency(newValue)
            }}
          />
        </InputBox>
      </div>
      {sourceUserId !== null && targetUserId !== null && amount !== 0 && (
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
          style={{ marginTop: "1em" }}
        >
          Apply
        </button>
      )}
    </>
  )
}

const currencyOptions = currencies.map((currency) => ({
  value: currency,
  label: getCurrencyString({ type: currency }),
}))
