import getNormalizedActivatedState from '../../normalize/getNormalizedActivatedState'
import getNormalizedDeletedState from '../../normalize/getNormalizedDeletedState'
import getNormalizedMergedState from '../../normalize/getNormalizedMergedState'
import getNormalizedSucceedState from '../../normalize/getNormalizedSucceedState'

import {
  ACTIVATE_DATA,
  ASSIGN_DATA,
  DELETE_DATA,
  MERGE_DATA,
  REINITIALIZE_DATA,
} from './actions'
import getDeletedPatchByActivityTags from './getDeletedPatchByActivityTags'
import reinitializeState from './reinitializeState'

export const createDataReducer = (initialState = {}) => {
  const reducer = (state = initialState, action) => {
    if (action.type === ACTIVATE_DATA) {
      return getNormalizedActivatedState(state, action.activities)
    }

    if (action.type === ASSIGN_DATA) {
      return Object.keys(action.patch || {}).length
        ? { ...state, ...action.patch }
        : state
    }

    if (action.type === DELETE_DATA) {
      let patch = action.patch || state
      if (action.config.tags) {
        patch = getDeletedPatchByActivityTags(patch, action.config.tags)
      }
      const deleteState = getNormalizedDeletedState(state, patch, action.config)
      return Object.keys(deleteState).length
        ? { ...state, ...deleteState }
        : state
    }

    if (action.type === MERGE_DATA) {
      const mergeState = getNormalizedMergedState(
        state,
        action.patch,
        action.config
      )
      return Object.keys(mergeState).length
        ? { ...state, ...mergeState }
        : state
    }

    if (action.type === REINITIALIZE_DATA) {
      return reinitializeState(state, initialState, action.config)
    }

    if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      return getNormalizedSucceedState(state, action)
    }

    return state
  }
  return reducer
}

export default createDataReducer
