import selectValueByEntityAndPathAndNormalizer from '../selectValueByEntityAndPathAndNormalizer'

describe('selectValueByEntityAndPathAndNormalizer', () => {
  describe('when datum is not here', () => {
    it('should return undefined', () => {
      // given
      const foo = {
        childId: 1,
        id: 1,
      }
      const state = {
        data: {
          foos: [
            foo
          ],
          subFoos: [
            {
              id: 1,
              subSubFooId: 1
            }
          ],
          subSubFoos: [
            {
              id: 1
            }
          ]
        },
      }
      const normalizer = {
        child: {
          normalizer: {
            subSubFoo: 'subSubFoos'
          },
          stateKey: 'subFoos'
        }
      }

      // when
      const result = selectValueByEntityAndPathAndNormalizer(state,
                                                             foo,
                                                             'child.subSubFoo.value',
                                                             normalizer)

      // then
      expect(result).toBeUndefined()
    })
  })

  describe('when datum is here', () => {
    it.only('should return the datum for . path', () => {
      // given
      const value = 3
      const foo = {
        childId: 1,
        id: 1,
      }
      const state = {
        data: {
          foos: [
            foo
          ],
          subFoos: [
            {
              id: 1,
              subSubFooId: 1
            }
          ],
          subSubFoos: [
            {
              id: 1,
              value
            }
          ]
        },
      }
      const normalizer = {
        child: {
          normalizer: {
            subSubFoo: 'subSubFoos'
          },
          stateKey: 'subFoos'
        }
      }

      // when
      const result = selectValueByEntityAndPathAndNormalizer(state,
                                                             foo,
                                                             'child.subSubFoo.value',
                                                             normalizer)

      // then
      expect(result).toStrictEqual(value)
    })
    it.only('should return the datum for [] path', () => {
      // given
      const value = 3
      const foo = {
        childrenIds: [1],
        id: 1,
      }
      const state = {
        data: {
          foos: [
            foo
          ],
          subFoos: [
            {
              id: 1,
              subSubFooId: 1
            }
          ],
          subSubFoos: [
            {
              id: 1,
              value
            }
          ]
        },
      }
      const normalizer = {
        child: {
          normalizer: {
            subSubFoo: 'subSubFoos'
          },
          stateKey: 'subFoos'
        }
      }

      // when
      const result = selectValueByEntityAndPathAndNormalizer(state,
                                                             foo,
                                                             'children[0].subSubFoo.value',
                                                             normalizer)

      // then
      expect(result).toStrictEqual(value)
    })
  })
})
