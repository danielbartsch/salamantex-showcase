import * as React from "react"
import { CryptoCurrency } from "../types"

export const CurrencyType = ({ type }: { type: CryptoCurrency["type"] }) => {
  switch (type) {
    case "ethereum":
      return <>Ethereum</>
    case "bitcoin":
      return <>Bitcoin</>
    default:
      return <>currency not found</>
  }
}
