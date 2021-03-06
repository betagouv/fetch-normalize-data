import { combineReducers, createStore } from 'redux'

import { failData, requestData, successData } from '../../data/actionCreators'

import createRequestsReducer from '../createRequestsReducer'
import { deleteRequests } from '../actionCreators'

const mockNowDate = 1487076708000
Date.now = jest.spyOn(Date, 'now').mockImplementation(() => mockNowDate)

describe('src | createRequestsReducer', () => {
  describe('when REQUEST_DATA', () => {
    it('should assign a pending request object', () => {
      // given
      const rootReducer = combineReducers({ requests: createRequestsReducer() })
      const store = createStore(rootReducer)

      // when
      store.dispatch(requestData({ apiPath: '/foos' }))

      // then
      expect(store.getState().requests['/foos']).toStrictEqual({
        date: new Date(mockNowDate).toISOString(),
        errors: null,
        isFail: false,
        isPending: true,
        isSuccess: false,
      })
    })
  })
  describe('when SUCCESS_DATA', () => {
    it('should assign a success request object', () => {
      // given
      const rootReducer = combineReducers({ requests: createRequestsReducer() })
      const store = createStore(rootReducer)

      // when
      store.dispatch(
        successData({ data: [{ foo: 'AE' }] }, { apiPath: '/foos' })
      )

      // then
      expect(store.getState().requests['/foos']).toStrictEqual({
        date: new Date(mockNowDate).toISOString(),
        errors: null,
        headers: undefined,
        isFail: false,
        isPending: false,
        isSuccess: true,
      })
    })
  })
  describe('when FAIL_DATA', () => {
    it('should assign a fail request object', () => {
      // given
      const rootReducer = combineReducers({ requests: createRequestsReducer() })
      const store = createStore(rootReducer)

      // when
      store.dispatch(
        failData(
          { errors: [{ foo: 'missing something' }] },
          { apiPath: '/foos' }
        )
      )

      // then
      expect(store.getState().requests['/foos']).toStrictEqual({
        date: new Date(mockNowDate).toISOString(),
        errors: { foo: 'missing something' },
        headers: undefined,
        isFail: true,
        isPending: false,
        isSuccess: false,
      })
    })
  })
  describe('when DELETE_REQUEST', () => {
    it('should delete a specific request object', () => {
      // given
      const rootReducer = combineReducers({
        requests: createRequestsReducer({
          '/foos': {
            date: new Date(mockNowDate).toISOString(),
            errors: null,
            headers: undefined,
            isFail: false,
            isPending: false,
            isSuccess: true,
          },
        }),
      })
      const store = createStore(rootReducer)

      // when
      store.dispatch(deleteRequests('/foos'))

      // then
      expect(store.getState().requests['/foos']).toBeUndefined()
    })
  })
})
