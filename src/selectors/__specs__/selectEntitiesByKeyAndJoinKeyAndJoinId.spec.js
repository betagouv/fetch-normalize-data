import selectEntitiesByKeyAndJoinKeyAndJoinId from "../selectEntitiesByKeyAndJoinKeyAndJoinId"

describe("selectEntitiesByKeyAndJoinKeyAndJoinId", () => {
  describe("when datum is not here", () => {
    it("should return empty list", () => {
      // given
      const state = {
        data: {
          bars: [],
          foos: []
        }
      }

      // when
      const result = selectEntitiesByKeyAndJoinKeyAndJoinId(
        state,
        "foos",
        "barId",
        "CG"
      )

      // then
      expect(result).toStrictEqual([])
    })
  })

  describe("when datum is here", () => {
    it("should return the datum", () => {
      // given
      const selectedFoos = [
        {
          barId: "CG",
          id: "AE"
        },
        {
          barId: "CG",
          id: "BF"
        }
      ]
      const state = {
        data: {
          bars: [{ id: "CG" }],
          foos: [
            ...selectedFoos,
            {
              id: "JK"
            }
          ]
        }
      }

      // when
      const result = selectEntitiesByKeyAndJoinKeyAndJoinId(
        state,
        "foos",
        "barId",
        "CG"
      )

      // then
      expect(result).toStrictEqual(selectedFoos)
    })
  })
})
