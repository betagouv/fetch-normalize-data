import selectEntityByActivityIdentifier from '../selectEntityByActivityIdentifier'

describe('selectEntityByActivityIdentifier', () => {
  describe('when datum is not here', () => {
    it('should return undefined', () => {
      // given
      const state = {
        data: {
          __activities__: [
            {
              entityIdentifier: 1
            }
          ],
          foos: [
            {
              activityIdentifier: 1,
              id: 'A',
              selectedFoo: true
            },
            {
              activityIdentifier: 2,
              id: 'B',
              selectedFoo: false
            },
          ],
        },
      }

      // when
      const result = selectEntityByActivityIdentifier(state, 3)

      // then
      expect(result).toBeUndefined()
    })
  })

  describe('when datum is here', () => {
    it('should return the datum through the activities search', () => {
      // given
      const selectedFoo = {
        activityIdentifier: 1,
        id: 'A',
        selectedFoo: true
      }
      const state = {
        data: {
          __activities__: [
            {
              entityIdentifier: 1
            }
          ],
          foos: [
            selectedFoo,
            {
              activityIdentifier: 2,
              id: 'B',
              selectedFoo: false
            },
          ],
        },
      }

      // when
      const result = selectEntityByActivityIdentifier(state, 1)

      // then
      expect(result).toStrictEqual(selectedFoo)
    })
    it('should return the datum through the brute search into data', () => {
      // given
      const selectedFoo = {
        activityIdentifier: 1,
        id: 'A',
        selectedFoo: true
      }
      const state = {
        data: {
          __activities__: [
            {
              entityIdentifier: 2
            }
          ],
          foos: [
            selectedFoo,
            {
              activityIdentifier: 2,
              id: 'B',
              selectedFoo: false
            },
          ],
        },
      }

      // when
      const result = selectEntityByActivityIdentifier(state, 1)

      // then
      expect(result).toStrictEqual(selectedFoo)
    })
  })
})
