import { combineReducers, createStore } from 'redux'

import createDataReducer from '../createDataReducer'
import { assignData, deleteData, reinitializeData } from '../actionCreators'

Date.now = jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)

describe('src | createDataReducer', () => {
  describe('when RESET_DATA', () => {
    it('should reset data with no excludes', () => {
      // given
      const initialState = { bars: [{ id: 'FF' }], foos: [{ id: 'AE' }], totos: [{ id: 'DD' }]}
      const rootReducer = combineReducers({ data: createDataReducer(initialState) })
      const store = createStore(rootReducer)

      // when
      store.dispatch(reinitializeData())

      // then
      expect(store.getState().data).toStrictEqual(initialState)
    })

    it('should reset data with excludes', () => {
      // given
      const initialState = { bars: [], foos: [{ id: 'AE' }], totos: [{ id: 'DD1' }]}
      const rootReducer = combineReducers({ data: createDataReducer(initialState) })
      const store = createStore(rootReducer)
      store.dispatch(assignData({ bars: [{ id: 'FF' }], foos: [], totos: [{ id: 'DD1' }, { id: 'DD2' }]}))

      // when
      store.dispatch(reinitializeData({ excludes: ['bars', 'totos'] }))

      // then
      expect(store.getState().data).toStrictEqual({ bars: [{ id: 'FF' }], foos: [{ id: 'AE' }], totos: [{ id: 'DD1' }, { id: 'DD2' }]})
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
          __ACTIVITIES__: ['TO_BE_DELETED'],
        },
        {
          id: 'BF',
          __ACTIVITIES__: ['/bars'],
        },
      ]
      const foos = [
        {
          id: 'AE',
          __ACTIVITIES__: ['TO_BE_DELETED'],
        },
        {
          id: 'BF',
          __ACTIVITIES__: ['TO_BE_DELETED'],
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
            __ACTIVITIES__: ['/bars'],
          },
        ],
        foos: [],
      })
    })
  })
})
