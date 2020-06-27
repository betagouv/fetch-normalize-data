import {
  ASSIGN_DATA,
  DELETE_DATA,
  MERGE_DATA,
  REINITIALIZE_DATA,
} from './actions'
import reinitializeState from './reinitializeState'
import getSuccessState from './getSuccessState'
import getDeletedPatchByActivityTag from './getDeletedPatchByActivityTag'

import getNormalizedDeletedState from '../../normalize/getNormalizedDeletedState'
import getNormalizedMergedState from '../../normalize/getNormalizedMergedState'

export const createDataReducer = (initialState = {}) => {
  const reducer = (state = initialState, action) => {
    if (action.type === ASSIGN_DATA) {
      return Object.assign({}, state, action.patch)
    }

    if (action.type === DELETE_DATA) {
      let patch = action.patch || state
      if (action.config.activityTags) {
        patch = getDeletedPatchByActivityTag(patch, action.config.activityTags)
      }
      const nextState = getNormalizedDeletedState(state, patch, action.config)
      return Object.assign({}, state, nextState)
    }

    if (action.type === MERGE_DATA) {
      const nextState = getNormalizedMergedState(
        state,
        action.patch,
        action.config
      )
      return Object.assign({}, state, nextState)
    }

    if (action.type === REINITIALIZE_DATA) {
      return reinitializeState(state, initialState, action.config)
    }

    if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      const nextState = getSuccessState(state, action)
      return Object.assign({}, state, nextState)
    }

    return state
  }
  return reducer
}

export default createDataReducer