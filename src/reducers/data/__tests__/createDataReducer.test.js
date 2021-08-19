import { combineReducers, createStore } from 'redux'

import {
  activateData,
  assignData,
  deleteData,
  reinitializeData,
  successData,
} from '../actionCreators'
import createDataReducer from '../createDataReducer'

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
            deprecation: [],
            entityHasBeenModified: false,
            localIdentifier: `1/${firstDateCreated}`,
            patch: {
              fromFirstActivity: 1,
              fromFirstActivityChangedByThird: 1,
              nestedDatum: {
                fromFirstActivity: 1,
              },
            },
            stateKey: 'foos',
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
          initialState.__activities__[0],
          {
            ...activities[0],
            deprecation: null,
            entityHasBeenModified: false,
            localIdentifier: `1/${secondDateCreated}`,
            stateKey: 'foos',
          },
          {
            ...activities[1],
            deprecation: null,
            entityHasBeenModified: false,
            localIdentifier: `2/${secondDateCreated}`,
            stateKey: 'foos',
          },
          {
            ...activities[2],
            deprecation: null,
            entityHasBeenModified: false,
            localIdentifier: `1/${thirdDateCreated}`,
            stateKey: 'foos',
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
          dateCreated: nextDateCreated,
          entityIdentifier,
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
            deprecation: null,
            entityHasBeenModified: false,
            localIdentifier: `1/${firstDateCreated}`,
            modelName: 'Foo',
            patch: {
              textA: 'bar',
            },
            stateKey: 'foos',
          },
          {
            dateCreated: secondDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `1/${secondDateCreated}`,
            modelName: 'Foo',
            patch: {
              textB: 'bir',
            },
            stateKey: 'foos',
          },
          {
            dateCreated: nextDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `1/${nextDateCreated}`,
            modelName: 'Foo',
            patch: {
              textC: 'bor',
            },
            stateKey: 'foos',
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

    it('should keep items of the entity not related to activity and the entity dateCreated but change dateModified', () => {
      // given
      const entityIdentifier = 1
      const entityDateCreated = new Date().toISOString()
      const initialState = {
        foos: [
          {
            activityIdentifier: entityIdentifier,
            dateCreated: entityDateCreated,
            dateModified: null,
            notDisappearedValue: 'hello',
            value: 2,
          },
        ],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const activityDateCreated = new Date(
        new Date(entityDateCreated).getTime() + 1000
      ).toISOString()
      const activities = [
        {
          dateCreated: activityDateCreated,
          entityIdentifier,
          modelName: 'Foo',
          patch: {
            value: 1,
          },
        },
      ]

      // when
      store.dispatch(activateData(activities))

      // then
      const nextState = store.getState().data
      expect(nextState).toStrictEqual({
        __activities__: [
          {
            dateCreated: activityDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `${entityIdentifier}/${activityDateCreated}`,
            modelName: 'Foo',
            patch: {
              value: 1,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: entityIdentifier,
            dateCreated: entityDateCreated,
            dateModified: activityDateCreated,
            notDisappearedValue: 'hello',
            value: 1,
          },
        ],
      })
    })

    it('should overide an array of numeric', () => {
      // given
      const entityIdentifier = 1
      const firstDateCreated = new Date().toISOString()
      const initialState = {
        __activities__: [
          {
            dateCreated: firstDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `0/${firstDateCreated}`,
            modelName: 'Foo',
            patch: {
              positions: [
                [0.1, 0.2],
                [0.3, 0.4],
              ],
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: entityIdentifier,
            dateCreated: firstDateCreated,
            dateModified: null,
          },
        ],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const secondDateCreated = new Date(
        new Date(firstDateCreated).getTime() + 1
      ).toISOString()
      const activities = [
        {
          dateCreated: secondDateCreated,
          entityIdentifier,
          localIdentifier: `0/${secondDateCreated}`,
          modelName: 'Foo',
          patch: {
            positions: [
              [0.9, 0.8],
              [0.7, 0.6],
            ],
          },
        },
      ]

      // when
      store.dispatch(activateData(activities))

      // then
      const nextState = store.getState().data
      expect(nextState).toStrictEqual({
        __activities__: [
          {
            dateCreated: firstDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `0/${firstDateCreated}`,
            modelName: 'Foo',
            patch: {
              positions: [
                [0.1, 0.2],
                [0.3, 0.4],
              ],
            },
            stateKey: 'foos',
          },
          {
            dateCreated: secondDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `0/${secondDateCreated}`,
            modelName: 'Foo',
            patch: {
              positions: [
                [0.9, 0.8],
                [0.7, 0.6],
              ],
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: entityIdentifier,
            dateCreated: firstDateCreated,
            dateModified: secondDateCreated,
            positions: [
              [0.9, 0.8],
              [0.7, 0.6],
            ],
          },
        ],
      })
    })

    it('should delete an entity with a delete activity', () => {
      // given
      const entityIdentifier = 1
      const firstDateCreated = new Date().toISOString()
      const initialState = {
        __activities__: [
          {
            dateCreated: firstDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `0/${firstDateCreated}`,
            modelName: 'Foo',
            patch: {
              positions: [
                [0.1, 0.2],
                [0.3, 0.4],
              ],
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: entityIdentifier,
            dateCreated: firstDateCreated,
            dateModified: null,
          },
        ],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const secondDateCreated = new Date(
        new Date(firstDateCreated).getTime() + 1
      ).toISOString()
      const activities = [
        {
          dateCreated: secondDateCreated,
          entityIdentifier,
          localIdentifier: `0/${secondDateCreated}`,
          modelName: 'Foo',
          verb: 'delete',
        },
      ]

      // when
      store.dispatch(activateData(activities))

      // then
      const nextState = store.getState().data
      expect(nextState).toStrictEqual({
        __activities__: [
          {
            dateCreated: firstDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `0/${firstDateCreated}`,
            modelName: 'Foo',
            patch: {
              positions: [
                [0.1, 0.2],
                [0.3, 0.4],
              ],
            },
            stateKey: 'foos',
          },
          {
            dateCreated: secondDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `0/${secondDateCreated}`,
            modelName: 'Foo',
            patch: {},
            stateKey: 'foos',
            verb: 'delete',
          },
        ],
      })
    })

    it('should delete an entity with isSoftDeleted activity', () => {
      // given
      const entityIdentifier = 1
      const firstDateCreated = new Date().toISOString()
      const initialState = {
        __activities__: [
          {
            dateCreated: firstDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `0/${firstDateCreated}`,
            modelName: 'Foo',
            patch: {
              positions: [
                [0.1, 0.2],
                [0.3, 0.4],
              ],
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: entityIdentifier,
            dateCreated: firstDateCreated,
            dateModified: null,
          },
        ],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const secondDateCreated = new Date(
        new Date(firstDateCreated).getTime() + 1
      ).toISOString()
      const activities = [
        {
          dateCreated: secondDateCreated,
          entityIdentifier,
          localIdentifier: `0/${secondDateCreated}`,
          modelName: 'Foo',
          patch: {
            isSoftDeleted: true,
          },
        },
      ]

      // when
      store.dispatch(activateData(activities))

      // then
      const nextState = store.getState().data
      expect(nextState).toStrictEqual({
        __activities__: [
          {
            dateCreated: firstDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `0/${firstDateCreated}`,
            modelName: 'Foo',
            patch: {
              positions: [
                [0.1, 0.2],
                [0.3, 0.4],
              ],
            },
            stateKey: 'foos',
          },
          {
            dateCreated: secondDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier,
            localIdentifier: `0/${secondDateCreated}`,
            modelName: 'Foo',
            patch: {
              isSoftDeleted: true,
            },
            stateKey: 'foos',
          },
        ],
      })
    })

    it('should not deprecate previous activities', () => {
      // given
      const fooDateCreated = new Date().toISOString()
      const fromFirstActivityDateCreated = fooDateCreated
      const fromSecondActivityDateCreated = new Date(
        new Date(fooDateCreated).getTime() + 2
      ).toISOString()
      const fromThirdActivityDateCreated = new Date(
        new Date(fooDateCreated).getTime() + 3
      ).toISOString()
      const fromFirstActivityValue = 1
      const fromSecondActivityValue = 2
      const fromThirdActivityValue = 3
      const initialState = {
        __activities__: [
          {
            dateCreated: fromFirstActivityDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            localIdentifier: `1/${fromFirstActivityDateCreated}`,
            modelName: 'Foo',
            patch: {
              value: fromFirstActivityValue,
            },
            stateKey: 'foos',
          },
          {
            dateCreated: fromSecondActivityDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            localIdentifier: `1/${fromSecondActivityDateCreated}`,
            modelName: 'Foo',
            patch: {
              value: fromSecondActivityValue,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated: fromFirstActivityDateCreated,
            dateModified: fromSecondActivityDateCreated,
            id: 1,
            value: fromFirstActivityValue,
          },
        ],
      }

      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const activities = [
        {
          dateCreated: fromThirdActivityDateCreated,
          entityIdentifier: 1,
          localIdentifier: `1/${fromThirdActivityDateCreated}`,
          modelName: 'Foo',
          patch: {
            value: fromThirdActivityValue,
          },
        },
      ]

      // when
      store.dispatch(activateData(activities))

      // then
      expect(store.getState().data).toStrictEqual({
        __activities__: [
          {
            dateCreated: fromFirstActivityDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            localIdentifier: `1/${fromFirstActivityDateCreated}`,
            modelName: 'Foo',
            patch: {
              value: fromFirstActivityValue,
            },
            stateKey: 'foos',
          },
          {
            dateCreated: fromSecondActivityDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            localIdentifier: `1/${fromSecondActivityDateCreated}`,
            modelName: 'Foo',
            patch: {
              value: fromSecondActivityValue,
            },
            stateKey: 'foos',
          },
          {
            dateCreated: fromThirdActivityDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            localIdentifier: `1/${fromThirdActivityDateCreated}`,
            modelName: 'Foo',
            patch: {
              value: fromThirdActivityValue,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated: fooDateCreated,
            dateModified: fromThirdActivityDateCreated,
            id: 1,
            value: fromThirdActivityValue,
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
        __remote__: foo,
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
        __remote__: foo,
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

    it('should not overide the local activity for entity.dateModified undefined', () => {
      // given
      const dateCreated = new Date().toISOString()
      const dateModified = new Date(
        new Date(dateCreated).getTime() + 1
      ).toISOString()

      const valueModifiedByActivityThatShouldStayInPlace = 'hello'
      const valueFromRemoteThatShouldNotBeConsidered = 'byebye'

      const initialState = {
        __activities__: [
          {
            dateCreated: dateModified,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            id: 1,
            localIdentifier: `1/${dateModified}`,
            modelName: 'Foo',
            patch: {
              value: valueModifiedByActivityThatShouldStayInPlace,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            dateModified: null,
            id: 1,
            value: valueModifiedByActivityThatShouldStayInPlace,
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
          dateCreated,
          id: 1,
          moreValue: 1,
          value: valueFromRemoteThatShouldNotBeConsidered,
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
            dateCreated: dateModified,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            id: 1,
            localIdentifier: `1/${dateModified}`,
            modelName: 'Foo',
            patch: {
              value: valueModifiedByActivityThatShouldStayInPlace,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            dateModified,
            id: 1,
            moreValue: 1,
            value: valueModifiedByActivityThatShouldStayInPlace,
            __remote__: foos[0],
            __tags__: ['/foos'],
          },
        ],
      })
    })

    it('should not overide the local activity for entity.__remote__.dateModified smaller than max of activity.dateCreated', () => {
      // given
      const dateCreated = new Date().toISOString()
      const dateModifiedFromRemote = new Date(
        new Date(dateCreated).getTime() + 1
      ).toISOString()
      const dateModifiedFromLocal = new Date(
        new Date(dateCreated).getTime() + 2
      ).toISOString()

      const valueModifiedByActivityThatShouldStayInPlace = 'hello'
      const valueFromRemoteThatShouldNotBeConsidered = 'byebye'

      const initialState = {
        __activities__: [
          {
            dateCreated: dateModifiedFromLocal,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            id: 1,
            localIdentifier: `1/${dateModifiedFromLocal}`,
            modelName: 'Foo',
            patch: {
              value: valueModifiedByActivityThatShouldStayInPlace,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            id: 1,
            value: valueModifiedByActivityThatShouldStayInPlace,
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
          dateCreated,
          dateModified: dateModifiedFromRemote,
          id: 1,
          moreValue: 1,
          value: valueFromRemoteThatShouldNotBeConsidered,
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
            dateCreated: dateModifiedFromLocal,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            id: 1,
            localIdentifier: `1/${dateModifiedFromLocal}`,
            modelName: 'Foo',
            patch: {
              value: valueModifiedByActivityThatShouldStayInPlace,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            dateModified: dateModifiedFromLocal,
            id: 1,
            moreValue: 1,
            value: valueModifiedByActivityThatShouldStayInPlace,
            __remote__: foos[0],
            __tags__: ['/foos'],
          },
        ],
      })
    })

    it('should overide the local activity for entity.__remote__.dateModified greater than max of activity.dateCreated and items in patch that are different from previous entity', () => {
      // given
      const dateCreated = new Date().toISOString()
      const dateModifiedFromLocal = new Date(
        new Date(dateCreated).getTime() + 1
      ).toISOString()
      const dateModifiedFromRemote = new Date(
        new Date(dateCreated).getTime() + 2
      ).toISOString()

      const initialValueFromPreviousRemote = 'euh'
      const valueModifiedByActivityThatShouldNotStayInPlace = 'hello'
      const valueFromRemoteThatShouldBeConsidered = 'byebye'

      const initialState = {
        __activities__: [
          {
            dateCreated: dateModifiedFromLocal,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            id: 1,
            localIdentifier: `1/${dateModifiedFromLocal}`,
            modelName: 'Foo',
            patch: {
              value: valueModifiedByActivityThatShouldNotStayInPlace,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            dateModified: dateModifiedFromLocal,
            id: 1,
            value: valueModifiedByActivityThatShouldNotStayInPlace,
            __remote__: {
              activityIdentifier: 1,
              dateCreated,
              dateModified: null,
              id: 1,
              value: initialValueFromPreviousRemote,
            },
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
          dateCreated,
          dateModified: dateModifiedFromRemote,
          id: 1,
          moreValue: 1,
          value: valueFromRemoteThatShouldBeConsidered,
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
            dateCreated: dateModifiedFromLocal,
            deprecation: {
              value: {
                previous: initialValueFromPreviousRemote,
                next: valueFromRemoteThatShouldBeConsidered,
              },
            },
            entityHasBeenModified: true,
            entityIdentifier: 1,
            id: 1,
            localIdentifier: `1/${dateModifiedFromLocal}`,
            modelName: 'Foo',
            patch: {
              value: valueModifiedByActivityThatShouldNotStayInPlace,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            dateModified: dateModifiedFromRemote,
            id: 1,
            moreValue: 1,
            value: valueFromRemoteThatShouldBeConsidered,
            __remote__: foos[0],
            __tags__: ['/foos'],
          },
        ],
      })
    })

    it('should not overide the local activity for entity.__remote__.dateModified greater than max of activity.dateCreated and items in patch that are not different from previous entity', () => {
      // given
      const dateCreated = new Date().toISOString()
      const dateModifiedFromLocal = new Date(
        new Date(dateCreated).getTime() + 1
      ).toISOString()
      const dateModifiedFromRemote = new Date(
        new Date(dateCreated).getTime() + 2
      ).toISOString()

      const valueFromRemoteThatShouldNotCreateDeprecation = 'byebye'

      const oldValueReturnedByRemote = 'old hello'
      const valueModifiedByActivityThatShouldStayInPlace = 'hello'

      const initialState = {
        __activities__: [
          {
            dateCreated: dateModifiedFromLocal,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            id: 1,
            localIdentifier: `1/${dateModifiedFromLocal}`,
            modelName: 'Foo',
            patch: {
              value: valueModifiedByActivityThatShouldStayInPlace,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            dateModified: dateModifiedFromLocal,
            id: 1,
            value: valueModifiedByActivityThatShouldStayInPlace,
            __remote__: {
              activityIdentifier: 1,
              dateCreated,
              dateModified: null,
              id: 1,
              value: oldValueReturnedByRemote,
            },
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
          dateCreated,
          dateModified: dateModifiedFromRemote,
          id: 1,
          moreValue: valueFromRemoteThatShouldNotCreateDeprecation,
          value: oldValueReturnedByRemote,
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
            dateCreated: dateModifiedFromLocal,
            deprecation: null,
            entityHasBeenModified: true,
            entityIdentifier: 1,
            id: 1,
            localIdentifier: `1/${dateModifiedFromLocal}`,
            modelName: 'Foo',
            patch: {
              value: valueModifiedByActivityThatShouldStayInPlace,
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated,
            dateModified: dateModifiedFromRemote,
            id: 1,
            moreValue: valueFromRemoteThatShouldNotCreateDeprecation,
            value: valueModifiedByActivityThatShouldStayInPlace,
            __remote__: foos[0],
            __tags__: ['/foos'],
          },
        ],
      })
    })

    it('should delete the local activities', () => {
      // given
      const firstDateCreated = new Date().toISOString()
      const secondDateCreated = new Date(
        new Date(firstDateCreated).getTime() + 1
      ).toISOString()
      const initialState = {
        __activities__: [
          {
            dateCreated: firstDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            localIdentifier: `1/${firstDateCreated}`,
            modelName: 'Foo',
            patch: {
              value: 'hello',
            },
            stateKey: 'foos',
          },
          {
            dateCreated: secondDateCreated,
            deprecation: null,
            entityHasBeenModified: false,
            entityIdentifier: 1,
            localIdentifier: `1/${secondDateCreated}`,
            modelName: 'Foo',
            patch: {
              value: 'rehello',
            },
            stateKey: 'foos',
          },
        ],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated: firstDateCreated,
            dateModified: secondDateCreated,
            value: 'rehello',
          },
        ],
      }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)

      // when
      store.dispatch(
        successData(
          { data: [], status: 201 },
          {
            apiPath: '/__activities__',
            body: initialState.__activities__,
            deleteRequestedActivities: true,
            method: 'POST',
          }
        )
      )

      // then
      expect(store.getState().data).toStrictEqual({
        __activities__: [],
        foos: [
          {
            activityIdentifier: 1,
            dateCreated: firstDateCreated,
            dateModified: secondDateCreated,
            value: 'rehello',
          },
        ],
      })
    })
  })
})
