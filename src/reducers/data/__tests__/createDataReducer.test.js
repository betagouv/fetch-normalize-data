import { combineReducers, createStore } from 'redux'

import createDataReducer from '../createDataReducer'
import {
  activateData,
  assignData,
  deleteData,
  reinitializeData,
  successData,
} from '../actionCreators'

Date.now = jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)

describe('src | createDataReducer', () => {
  describe('when ACTIVATE_DATA', () => {
    it('should activate a created data', () => {
      // given
      const firstDateCreated = new Date().toISOString()
      const initialState = {
        __activities__: [
          {
            dateCreated: firstDateCreated,
            entityIdentifier: 1,
            id: 'AE',
            localIdentifier: `1/${firstDateCreated}`,
            patch: {
              fromFirstActivity: 1,
              fromFirstActivityChangedByThird: 1,
              nestedDatum: {
                fromFirstActivity: 1,
              },
            },
            tableName: 'foo',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated: firstDateCreated,
            dateModified: null,
            fromFirstActivity: 1,
            fromFirstActivityChangedByThird: 1,
            nestedDatum: {
              fromFirstActivity: 1,
            },
          },
        ],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)

      let secondDateCreated = new Date(firstDateCreated)
      secondDateCreated.setDate(secondDateCreated.getDate() + 1)
      secondDateCreated = secondDateCreated.toISOString()
      let thirdDateCreated = new Date(firstDateCreated)
      thirdDateCreated.setDate(thirdDateCreated.getDate() + 2)
      thirdDateCreated = thirdDateCreated.toISOString()
      const activities = [
        {
          dateCreated: secondDateCreated,
          entityIdentifier: 1,
          patch: {
            fromSecondActivity: 2,
            nestedDatum: {
              fromSecondActivity: 2,
            },
          },
          tableName: 'foo',
        },
        {
          dateCreated: secondDateCreated,
          entityIdentifier: 2,
          patch: {
            otherActivity: 'foo',
          },
          tableName: 'foos',
        },
        {
          dateCreated: thirdDateCreated,
          entityIdentifier: 1,
          patch: {
            fromFirstActivityChangedByThird: 3,
            fromThirdActivity: 3,
          },
          tableName: 'foos',
        },
      ]
      // when
      store.dispatch(activateData(activities))

      // then
      expect(store.getState().data).toStrictEqual({
        __activities__: [
          {
            ...initialState.__activities__[0],
          },
          {
            ...activities[0],
            localIdentifier: `1/${secondDateCreated}`,
          },
          {
            ...activities[1],
            localIdentifier: `2/${secondDateCreated}`,
          },
          {
            ...activities[2],
            localIdentifier: `1/${thirdDateCreated}`,
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated: firstDateCreated,
            dateModified: thirdDateCreated,
            fromFirstActivity: 1,
            fromFirstActivityChangedByThird: 3,
            fromSecondActivity: 2,
            fromThirdActivity: 3,
            nestedDatum: {
              fromFirstActivity: 1,
              fromSecondActivity: 2,
            },
          },
          {
            activityIdentifier: 2,
            dateCreated: secondDateCreated,
            dateModified: null,
            otherActivity: 'foo',
          },
        ],
      })
    })

    it('should force to not save activities with same dateCreated', () => {
      // given
      const entityIdentifier = 1
      const initialState = {
        foos: [],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)

      const firstDate = new Date()
      const firstDateCreated = firstDate.toISOString()
      const nextDateCreated = new Date(firstDate.getTime() + 1000).toISOString()
      const activities = [
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            textA: 'bar',
          },
        },
        {
          dateCreated: firstDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            textB: 'bir',
          },
        },
        {
          entityIdentifier,
          dateCreated: nextDateCreated,
          modelName: 'Foo',
          patch: {
            textC: 'bor',
          },
        },
      ]

      // when
      store.dispatch(activateData(activities))

      // then
      const secondDateCreated = new Date(firstDate.getTime() + 1).toISOString()
      const nextState = store.getState().data
      expect(nextState).toStrictEqual({
        __activities__: [
          {
            dateCreated: firstDateCreated,
            entityIdentifier,
            localIdentifier: `1/${firstDateCreated}`,
            modelName: 'Foo',
            patch: {
              textA: 'bar',
            },
          },
          {
            dateCreated: secondDateCreated,
            entityIdentifier,
            localIdentifier: `1/${secondDateCreated}`,
            modelName: 'Foo',
            patch: {
              textB: 'bir',
            },
          },
          {
            dateCreated: nextDateCreated,
            entityIdentifier,
            localIdentifier: `1/${nextDateCreated}`,
            modelName: 'Foo',
            patch: {
              textC: 'bor',
            },
          },
        ],
        foos: [
          {
            activityIdentifier: entityIdentifier,
            dateCreated: firstDateCreated,
            dateModified: nextDateCreated,
            textA: 'bar',
            textB: 'bir',
            textC: 'bor',
          },
        ],
      })
    })
  })

  describe('when ASSIGN_DATA', () => {
    it('should assign data', () => {
      // given
      const rootReducer = combineReducers({ data: createDataReducer({}) })
      const store = createStore(rootReducer)
      const foos = [{ id: 'AE' }]

      // when
      store.dispatch(assignData({ foos }))

      // then
      expect(store.getState().data.foos).toStrictEqual(foos)
    })
  })

  describe('when DELETE_DATA', () => {
    it('should delete data', () => {
      // given
      const bars = [
        {
          id: 'AE',
          __tags__: ['TO_BE_DELETED'],
        },
        {
          id: 'BF',
          __tags__: ['/bars'],
        },
      ]
      const foos = [
        {
          id: 'AE',
          __tags__: ['TO_BE_DELETED'],
        },
        {
          id: 'BF',
          __tags__: ['TO_BE_DELETED'],
        },
      ]
      const rootReducer = combineReducers({
        data: createDataReducer({
          bars,
          foos,
        }),
      })
      const store = createStore(rootReducer)

      // when
      store.dispatch(deleteData(null, { tags: ['TO_BE_DELETED'] }))

      // then
      const state = store.getState().data
      expect(state).toStrictEqual({
        bars: [
          {
            id: 'BF',
            __tags__: ['/bars'],
          },
        ],
        foos: [],
      })
    })
  })

  describe('when REINITIALIZE_DATA', () => {
    it('should reset data with no excludes', () => {
      // given
      const initialState = {
        bars: [{ id: 'FF' }],
        foos: [{ id: 'AE' }],
        totos: [{ id: 'DD' }],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)

      // when
      store.dispatch(reinitializeData())

      // then
      expect(store.getState().data).toStrictEqual(initialState)
    })

    it('should reset data with excludes', () => {
      // given
      const initialState = {
        bars: [],
        foos: [{ id: 'AE' }],
        totos: [{ id: 'DD1' }],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      store.dispatch(
        assignData({
          bars: [{ id: 'FF' }],
          foos: [],
          totos: [{ id: 'DD1' }, { id: 'DD2' }],
        })
      )

      // when
      store.dispatch(reinitializeData({ excludes: ['bars', 'totos'] }))

      // then
      expect(store.getState().data).toStrictEqual({
        bars: [{ id: 'FF' }],
        foos: [{ id: 'AE' }],
        totos: [{ id: 'DD1' }, { id: 'DD2' }],
      })
    })
  })

  describe('when SUCCESS_DATA', () => {
    it('should merge a patch inside the state with apiPath', () => {
      // given
      const initialState = { bars: [] }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const foos = [{ id: 'AE' }]

      // when
      store.dispatch(
        successData(
          { data: foos, status: 200 },
          { apiPath: '/foos', method: 'GET' }
        )
      )

      // then
      const expectedFoos = foos.map(foo => ({
        ...foo,
        __tags__: ['/foos'],
      }))
      expect(store.getState().data).toStrictEqual({
        bars: [],
        foos: expectedFoos,
      })
    })

    it('should have pushed tag in the already existing __tags__', () => {
      // given
      const initialState = { bars: [] }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const foos = [{ id: 'AE' }]
      store.dispatch(
        successData(
          { data: foos, status: 200 },
          { tag: '/foos-one', apiPath: '/foos', method: 'GET' }
        )
      )

      // when
      store.dispatch(
        successData(
          { data: foos, status: 200 },
          { tag: '/foos-two', apiPath: '/foos', method: 'GET' }
        )
      )

      // then
      const expectedFoos = foos.map(foo => ({
        ...foo,
        __tags__: ['/foos-one', '/foos-two'],
      }))
      expect(store.getState().data).toStrictEqual({
        bars: [],
        foos: expectedFoos,
      })
    })

    it('should not merge a patch when stateKey is null', () => {
      // given
      const initialState = { bars: [] }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const foos = [{ id: 'AE' }]

      // when
      store.dispatch(
        successData(
          { data: foos, status: 200 },
          { apiPath: '/foos', method: 'GET', stateKey: null }
        )
      )

      // then
      expect(store.getState().data).toStrictEqual({ bars: [] })
    })

    it('should merge appeared twice nested entities with their activities when we normalize', () => {
      // given
      const initialState = {}
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const firstDateCreated = new Date().toISOString()
      const foos = [
        {
          __activities__: [
            {
              dateCreated: firstDateCreated,
              entityIdentifier: 1,
              id: 1,
              modelName: 'Foo',
              patch: {
                id: 1,
                value: 'foo',
              },
            },
          ],
          activityIdentifier: 1,
          id: 1,
          subFoo: {
            __activities__: [
              {
                dateCreated: firstDateCreated,
                entityIdentifier: 2,
                id: 2,
                modelName: 'SubFoo',
                patch: {
                  id: 1,
                  subValue: 'fee',
                },
              },
            ],
            activityIdentifier: 2,
            id: 1,
            subValue: 'fee',
            subSubFoo: {
              __activities__: [
                {
                  dateCreated: firstDateCreated,
                  entityIdentifier: 3,
                  id: 3,
                  modelName: 'SubSubFoo',
                  patch: {
                    id: 1,
                    subSubValue: 'fuu',
                  },
                },
              ],
              activityIdentifier: 3,
              id: 1,
              subSubValue: 'fuu',
            },
          },
          sameSubFoo: {
            __activities__: [
              {
                dateCreated: firstDateCreated,
                entityIdentifier: 2,
                id: 2,
                modelName: 'SubFoo',
                patch: {
                  id: 1,
                  subValue: 'fee',
                },
              },
            ],
            activityIdentifier: 2,
            id: 1,
            subValue: 'fee',
            subSubFoo: {
              __activities__: [
                {
                  dateCreated: firstDateCreated,
                  entityIdentifier: 3,
                  id: 3,
                  modelName: 'SubSubFoo',
                  patch: {
                    id: 1,
                    subSubValue: 'fuu',
                  },
                },
              ],
              activityIdentifier: 3,
              id: 1,
              subSubValue: 'fuu',
            },
          },
          value: 'foo',
        },
      ]

      // when
      store.dispatch(
        successData(
          { data: foos, status: 200 },
          {
            apiPath: '/foos',
            method: 'GET',
            normalizer: {
              __activities__: '__activities__',
              subFoo: {
                normalizer: {
                  __activities__: '__activities__',
                  subSubFoo: {
                    normalizer: {
                      __activities__: '__activities__',
                    },
                    stateKey: 'subSubFoos',
                  },
                },
                stateKey: 'subFoos',
              },
              sameSubFoo: {
                normalizer: {
                  __activities__: '__activities__',
                  subSubFoo: {
                    normalizer: {
                      __activities__: '__activities__',
                    },
                    stateKey: 'subSubFoos',
                  },
                },
                stateKey: 'subFoos',
              },
            },
          }
        )
      )

      // then
      expect(store.getState().data).toStrictEqual({
        __activities__: [
          {
            dateCreated: firstDateCreated,
            entityIdentifier: 1,
            id: 1,
            modelName: 'Foo',
            patch: {
              id: 1,
              value: 'foo',
            },
            __normalizers__: [{ datumKey: '__activities__' }],
            __tags__: ['/foos'],
          },
          {
            dateCreated: firstDateCreated,
            entityIdentifier: 2,
            id: 2,
            modelName: 'SubFoo',
            patch: {
              id: 1,
              subValue: 'fee',
            },
            __normalizers__: [{ datumKey: '__activities__' }],
            __tags__: ['/foos'],
          },
          {
            dateCreated: firstDateCreated,
            entityIdentifier: 3,
            id: 3,
            modelName: 'SubSubFoo',
            patch: {
              id: 1,
              subSubValue: 'fuu',
            },
            __normalizers__: [{ datumKey: '__activities__' }],
            __tags__: ['/foos'],
          },
        ],
        foos: [
          {
            __activities__: {
              stateKey: '__activities__',
              type: '__normalizer__',
            },
            activityIdentifier: 1,
            id: 1,
            sameSubFoo: { stateKey: 'subFoos', type: '__normalizer__' },
            subFoo: { stateKey: 'subFoos', type: '__normalizer__' },
            value: 'foo',
            __tags__: ['/foos'],
          },
        ],
        subFoos: [
          {
            __activities__: {
              stateKey: '__activities__',
              type: '__normalizer__',
            },
            activityIdentifier: 2,
            id: 1,
            subSubFoo: { stateKey: 'subSubFoos', type: '__normalizer__' },
            subValue: 'fee',
            __normalizers__: [
              { datumKey: 'subFoo' },
              { datumKey: 'sameSubFoo' },
            ],
            __tags__: ['/foos'],
          },
        ],
        subSubFoos: [
          {
            __activities__: {
              stateKey: '__activities__',
              type: '__normalizer__',
            },
            activityIdentifier: 3,
            id: 1,
            subSubValue: 'fuu',
            __normalizers__: [{ datumKey: 'subSubFoo' }],
            __tags__: ['/foos'],
          },
        ],
      })
    })

    it('should overide the local __activities__ values', () => {
      // given
      const dateCreated = new Date().toISOString()
      const initialState = {
        __activities__: [
          {
            dateCreated,
            entityIdentifier: 1,
            id: 1,
            modelName: 'Foo',
            patch: {
              overridenValue: 'hello',
            },
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            id: 1,
            overridenValue: 'hello',
          },
        ],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const foos = [
        {
          activityIdentifier: 1,
          id: 1,
          moreValue: 1,
          overridenValue: 'I should be there',
        },
      ]

      // when
      store.dispatch(
        successData(
          { data: foos, status: 200 },
          { apiPath: '/foos', method: 'GET' }
        )
      )

      // then
      expect(store.getState().data).toStrictEqual({
        __activities__: [
          {
            dateCreated,
            entityIdentifier: 1,
            id: 1,
            modelName: 'Foo',
            patch: {
              overridenValue: 'hello',
            },
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            id: 1,
            moreValue: 1,
            overridenValue: 'I should be there',
            __tags__: ['/foos'],
          },
        ],
      })
    })

    it('should delete the local activity and replace it by the posted one when post activities', () => {
      // given
      const dateCreated = new Date().toISOString()
      const initialState = {
        __activities__: [
          {
            dateCreated,
            entityIdentifier: 1,
            localIdentifier: `1/${dateCreated}`,
            modelName: 'Foo',
            patch: {
              value: 'hello',
            },
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            dateModified: null,
            value: 'hello',
          },
        ],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const activities = [
        {
          dateCreated,
          entityIdentifier: 1,
          id: 1,
          modelName: 'Foo',
          patch: {
            value: 'hello',
          },
        },
      ]

      // when
      store.dispatch(
        successData(
          { data: activities, status: 201 },
          { apiPath: '/__activities__', method: 'POST' }
        )
      )

      // then
      expect(store.getState().data).toStrictEqual({
        __activities__: [
          {
            dateCreated,
            entityIdentifier: 1,
            id: 1,
            modelName: 'Foo',
            patch: {
              value: 'hello',
            },
            __tags__: ['/__activities__'],
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            dateModified: null,
            value: 'hello',
          },
        ],
      })
    })
  })
})
