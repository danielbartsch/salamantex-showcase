import * as React from "react"
import { User } from "../types"
import { DatabaseContext } from "../globals"

export const UserRepresentation = ({ id }: { id: User["id"] }) => {
  const database = React.useContext(DatabaseContext)

  const user = database.users[id]

  if (!user) {
    return <>user not found</>
  }
  return <span title={user.email}>{user.name}</span>
}
