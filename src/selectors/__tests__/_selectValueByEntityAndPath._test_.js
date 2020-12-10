import selectValueByEntityAndPath from '../selectValueByEntityAndPath'

describe('selectValueByEntityAndPath', () => {
  describe('when datum is not here', () => {
    it('should return undefined', () => {
      // given
      const value = 3
      const foo = {
        childActivityIdentifier: 1,
        id: 'A',
      }
      const state = {
        data: {
          __activities__: [
            {
              entityIdentifier: 1,
              modelName: 'SubFoo'
            }
          ],
          foos: [
            foo
          ],
          subFoos: [
            {
              activityIdentifier: 1,
              subSubFooActivityIdentifier: 2
            }
          ],
          subSubFoos: [
            {
              activityIdentifier: 2,
              missedValue : value
            }
          ]
        },
      }

      // when
      const result = selectValueByEntityAndPath(state, foo, 'child.subSubFoo.value')

      // then
      expect(result).toBeUndefined()
    })
  })

  describe('when datum is here', () => {
    it('should return the datum', () => {
      // given
      const value = 3
      const foo = {
        id: 'A',
        subFooActivityIdentifier: 1
      }
      const state = {
        data: {
          __activities__: [
            {
              entityIdentifier: 1
            }
          ],
          foos: [
            foo
          ],
          subFoos: [
            {
              activityIdentifier: 1,
              subSubFooActivityIdentifier: 2
            }
          ],
          subSubFoos: [
            {
              activityIdentifier: 2,
              value
            }
          ]
        },
      }

      // when
      const result = selectValueByEntityAndPath(state, foo, 'subFoo.subSubFoo.value')

      // then
      expect(result).toStrictEqual(value)
    })
  })
})
