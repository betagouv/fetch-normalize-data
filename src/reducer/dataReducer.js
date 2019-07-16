import { ASSIGN_DATA, MERGE_DATA, RESET_DATA, SET_DATA } from './actions'
import { getSuccessState } from './getSuccessState'
import { getNormalizedMergedState } from '../normalize/getNormalizedMergedState'

export const dataReducer = (
  state = {},
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
    return {}
  }

  if (action.type === SET_DATA) {
    return action.patch
  }

  if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
    const nextState = getSuccessState(state, action)
    return Object.assign({}, state, nextState)
  }

  return state
}

export default dataReducer