import { ASSIGN_DATA, MERGE_DATA, RESET_DATA } from './actions'
import { getSuccessState } from './getSuccessState'
import { getNormalizedMergedState } from '../normalize'

export const createDataReducer = (initialState = {}) => {
  const reducer = (
    state = initialState,
    action
  ) => {

    if (action.type === ASSIGN_DATA) {
      return Object.assign({}, state, action.patch)
    }

    if (action.type ===  MERGE_DATA) {
      const nextState = getNormalizedMergedState(state, action.patch, action.config)
      return Object.assign({}, state, nextState)
    }

    if (action.type === RESET_DATA) {
      return initialState
    }

    if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      const updatedState = getSuccessState(state, action)
      return Object.assign({}, state, updatedState)
    }

    return state
  }
  return reducer
}

export default createDataReducer
