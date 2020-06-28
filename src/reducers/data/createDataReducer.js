import {
  ASSIGN_DATA,
  COMMIT_DATA,
  DELETE_DATA,
  MERGE_DATA,
  REINITIALIZE_DATA,
} from './actions'
import reinitializeState from './reinitializeState'
import getSuccessState from './getSuccessState'
import getDeletedPatchByActivityTag from './getDeletedPatchByActivityTag'

import getNormalizedCommitedState from '../../normalize/getNormalizedCommitedState'
import getNormalizedDeletedState from '../../normalize/getNormalizedDeletedState'
import getNormalizedMergedState from '../../normalize/getNormalizedMergedState'

export const createDataReducer = (initialState = {}) => {
  const reducer = (state = initialState, action) => {
    if (action.type === ASSIGN_DATA) {
      return { ...state, ...action.patch }
    }

    if (action.type === COMMIT_DATA) {
      const nextState = getNormalizedMergedState(
        nextState,
        { __COMMITS__: action.commits },
        {
          getDatumIdKey: () => '__COMMIT_IDENTIFIER__',
          getDatumIdValue: commit => commit.id || `${commit.uuid}/${commit.dateCreated}`,
          isMergingDatum: true
        })
      return { ...state, ...nextState }
    }

    if (action.type === DELETE_DATA) {
      let patch = action.patch || state
      if (action.config.activityTags) {
        patch = getDeletedPatchByActivityTag(patch, action.config.activityTags)
      }
      const nextState = getNormalizedDeletedState(state, patch, action.config)
      return { ...state, ...nextState }
    }

    if (action.type === MERGE_DATA) {
      const nextState = getNormalizedMergedState(
        state,
        action.patch,
        action.config
      )
      return { ...state, ...nextState }
    }

    if (action.type === REINITIALIZE_DATA) {
      return reinitializeState(state, initialState, action.config)
    }

    if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      const nextState = getSuccessState(state, action)
      return { ...state, ...nextState }
    }


    let nextState = state
    let needsToUpdateCommitCollectionsBecauseChange
    if (action.type === 'persist/REHYDRATE') {
      needsToUpdateCommitCollectionsBecauseChange =
        typeof action.payload !== 'undefined' &&
        typeof action.payload.__COMMITS__ !== 'undefined'
      nextState = action.payload
    } else {
      needsToUpdateCommitCollectionsBecauseChange =
      typeof nextState.commits !== 'undefined' &&
      state.__COMMITS__ !== nextState.__COMMITS__
    }
    if (needsToUpdateCommitCollectionsBecauseChange) {
      const patch = { __COMMITS__: nextState.__COMMITS__ }
      const nextState = getNormalizedCommitedState(state, patch, action.config)
      return { ...state, ...nextState }
    }


    return state
  }
  return reducer
}

export default createDataReducer
