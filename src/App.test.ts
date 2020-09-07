import { isValidTransaction } from "./utils"

describe("isValidTransaction", () => {
  it("shouldn't allow any amount if the source user has no money", () => {
    expect(isValidTransaction(10, 0, 10)).toEqual(false)
  })
  it("shouldn't allow negative transaction amounts whatsoever", () => {
    expect(isValidTransaction(-10, 0, undefined)).toEqual(false)
  })
  it("shouldn't allow transaction amounts over the maximum transaction amount", () => {
    expect(isValidTransaction(15, 0, 10)).toEqual(false)
  })
  it("should allow any transaction amount, if there is no maximum transaction amount", () => {
    expect(isValidTransaction(10000, 10000, undefined)).toEqual(true)
  })
})
