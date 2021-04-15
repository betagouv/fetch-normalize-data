import { keyFromConfig } from '../../selectors/selectRequestByConfig'
import { DELETE_REQUESTS, REINITIALIZE_REQUESTS } from './actions'

const arrayErrorsToErrorsByName = errors =>
  Object.values(errors).reduce((acc, error) => ({ ...acc, ...error }), {})

const parseHeaders = headers =>
  headers && {
    hasMore: headers['has-more'] === 'False' ? false : true,
    page: headers['page'],
    totalDataCount: headers['total-data-count']
      ? parseInt(headers['total-data-count'], 10)
      : null,
  }

export const createRequestsReducer = (initialState = {}) => {
  const reducer = (state = initialState, action) => {
    const { config = {} } = action || {}
    const key = keyFromConfig(config)

    if (/FAIL_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      const nextState = {
        [key]: {
          ...state[key],
          date: new Date(Date.now()).toISOString(),
          errors: arrayErrorsToErrorsByName(action.payload.errors),
          headers: parseHeaders(action.payload.headers),
          isFail: true,
          isPending: false,
          isSuccess: false,
        },
      }
      return { ...state, ...nextState }
    }

    if (/REQUEST_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      const nextState = {
        [key]: {
          ...state[key],
          date: new Date(Date.now()).toISOString(),
          errors: null,
          isFail: false,
          isPending: true,
          isSuccess: false,
        },
      }
      return { ...state, ...nextState }
    }

    if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      const nextState = {
        [key]: {
          ...state[key],
          date: new Date(Date.now()).toISOString(),
          errors: null,
          headers: parseHeaders(action.payload.headers),
          isFail: false,
          isPending: false,
          isSuccess: true,
        },
      }
      return { ...state, ...nextState }
    }

    if (action.type === DELETE_REQUESTS) {
      const nextState = { [action.key]: undefined }
      return { ...state, ...nextState }
    }

    if (action.type === REINITIALIZE_REQUESTS) {
      return initialState
    }

    return state
  }
  return reducer
}

export default createRequestsReducer
