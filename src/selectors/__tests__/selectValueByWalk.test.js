import selectValueByWalk from '../selectValueByWalk'

describe('selectValueByWalk', () => {
  describe('when datum is not here', () => {
    it('should return undefined', () => {
      // given
      const foo = {
        child: { stateKey: 'subFoos', type: '__normalizer__' },
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
              subSubFoo: { stateKey: 'subSubFoos', type: '__normalizer__' },
              subSubFooId: 1,
              __normalizers__: [{ datumKey: 'child' }]
            }
          ],
          subSubFoos: [
            {
              id: 1,
              __normalizers__: [{ datumKey: 'subSubFoo' }]
            }
          ]
        },
      }

      // when
      const result = selectValueByWalk(state,
                                       {
                                         topKey: 'foos',
                                         topId: 1,
                                         path: 'child.subSubFoo.value'
                                       })

      // then
      expect(result).toBeUndefined()
    })
  })

  describe('when datum is here', () => {
    it('should return the datum for path with dots', () => {
      // given
      const value = 3
      const foo = {
        child: { stateKey: 'subFoos', type: '__normalizer__' },
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
              subSubFoo: { stateKey: 'subSubFoos', type: '__normalizer__' },
              subSubFooId: 1,
              __normalizers__: [{ datumKey: 'child' }]
            }
          ],
          subSubFoos: [
            {
              id: 1,
              value,
              __normalizers__: [{ datumKey: 'subSubFoo' }]
            }
          ]
        },
      }

      // when
      const result = selectValueByWalk(state,
                                       {
                                         topKey: 'foos',
                                         topId: 1,
                                         path: 'child.subSubFoo.value'
                                       })

      // then
      expect(result).toStrictEqual(value)
    })

    /*
    it.only('should return the datum for path with []', () => {
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
      const result = selectValueByWalk(state,
                                                             foo,
                                                             'children[0].subSubFoo.value',
                                                             normalizer)

      // then
      expect(result).toStrictEqual(value)
    })
    */
  })
})
