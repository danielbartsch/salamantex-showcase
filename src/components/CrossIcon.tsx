import * as React from "react"

export const CrossIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 12 12" width="12" height="12">
    <path
      d="m2,0 l-2,2 l10,10 l2,-2 l-10,-10z M12,2 l-2,-2 l-10,10 l2,2 l-10,10z"
      fill={color}
    />
  </svg>
)
