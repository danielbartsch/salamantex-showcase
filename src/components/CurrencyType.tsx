import * as React from "react"
import { CryptoCurrency } from "../types"
import { getCurrencyString } from "../utils"

export const CurrencyType = ({ type }: { type: CryptoCurrency["type"] }) => (
  <>{getCurrencyString(type)}</>
)
