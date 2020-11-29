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
    it('should activate data', () => {
      // given
      const firstDateCreated = new Date().toISOString()
      const initialState = {
        activities: [
          {
            collectionName: 'foos',
            dateCreated: firstDateCreated,
            id: 'AE',
            patch: {
              fromFirstActivity: 1,
              fromFirstActivityChangedByThird: 1,
              nestedDatum: {
                fromFirstActivity: 1,
              }
            },
            uuid: 1
          }
        ],
        foos: [],
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
          collectionName: 'foos',
          dateCreated: secondDateCreated,
          patch: {
            fromSecondActivity: 2,
            nestedDatum: {
              fromSecondActivity: 2
            }
          },
          uuid: 1,
        },
        {
          collectionName: 'foos',
          dateCreated: secondDateCreated,
          patch: {
            otherActivity: 'foo',
          },
          uuid: 2,
        },
        {
          collectionName: 'foos',
          dateCreated: thirdDateCreated,
          patch: {
            fromFirstActivityChangedByThird: 3,
            fromThirdActivity: 3,
          },
          uuid: 1,
        }
      ]
      // when
      store.dispatch(activateData(activities))

      // then
      console.log(initialState.activities[0])
      expect(store.getState().data).toStrictEqual({
        activities: [
          initialState.activities[0],
          { ...activities[0], localIdentifier: `1/${activities[0].dateCreated}` },
          { ...activities[1], localIdentifier: `2/${activities[1].dateCreated}` },
          { ...activities[2], localIdentifier: `1/${activities[2].dateCreated}` },
        ],
        foos: [
          {
            activityUuid: 1,
            fromFirstActivity: 1,
            fromFirstActivityChangedByThird: 3,
            fromSecondActivity: 2,
            fromThirdActivity: 3,
            nestedDatum: {
              fromFirstActivity: 1,
              fromSecondActivity: 2,
            },
            firstDateCreated: initialState.activities[0].dateCreated,
            lastDateCreated: activities[2].dateCreated,
          },
          {
            activityUuid: 2,
            firstDateCreated: activities[1].dateCreated,
            lastDateCreated: activities[1].dateCreated,
            otherActivity: 'foo',
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
          __TAGS__: ['TO_BE_DELETED'],
        },
        {
          id: 'BF',
          __TAGS__: ['/bars'],
        },
      ]
      const foos = [
        {
          id: 'AE',
          __TAGS__: ['TO_BE_DELETED'],
        },
        {
          id: 'BF',
          __TAGS__: ['TO_BE_DELETED'],
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
            __TAGS__: ['/bars'],
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
      store.dispatch(assignData({
        bars: [{ id: 'FF' }],
        foos: [],
        totos: [{ id: 'DD1' }, { id: 'DD2' }],
      }))

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
      store.dispatch(successData(
        { data: foos, status: 200 },
        { apiPath: '/foos', method: 'GET' }
      ))

      // then
      const expectedFoos = foos.map(foo => ({
        ...foo,
        __TAGS__: ['/foos'],
      }))
      expect(store.getState().data).toStrictEqual({
        bars: [],
        foos: expectedFoos,
      })
    })

    it('should have pushed tag in the already existing __TAGS__', () => {
      // given
      const initialState = { bars: [] }
      const rootReducer = combineReducers({
        data: createDataReducer(initialState),
      })
      const store = createStore(rootReducer)
      const foos = [{ id: 'AE' }]
      store.dispatch(successData(
        { data: foos, status: 200 },
        { tag: '/foos-one', apiPath: '/foos', method: 'GET' }
      ))

      // when
      store.dispatch(successData(
        { data: foos, status: 200 },
        { tag: '/foos-two', apiPath: '/foos', method: 'GET' }
      ))

      // then
      const expectedFoos = foos.map(foo => ({
        ...foo,
        __TAGS__: ['/foos-one', '/foos-two'],
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
      store.dispatch(successData(
        { data: foos, status: 200 },
        { apiPath: '/foos', method: 'GET', stateKey: null }
      ))

      // then
      expect(store.getState().data).toStrictEqual({ bars: [] })
    })
  })
})
