import {
  ACTIVATE_DATA,
  ASSIGN_DATA,
  DELETE_DATA,
  MERGE_DATA,
  REINITIALIZE_DATA,
} from './actions'
import getSuccessState from './getSuccessState'
import getDeletedPatchByActivityTag from './getDeletedPatchByActivityTag'
import reinitializeState from './reinitializeState'

import getNormalizedActivatedState from '../../normalize/getNormalizedActivatedState'
import getNormalizedDeletedState from '../../normalize/getNormalizedDeletedState'
import getNormalizedMergedState from '../../normalize/getNormalizedMergedState'
import { getDefaultActivityFrom } from '../../normalize/utils'

export const createDataReducer = (initialState = {}, extraConfig = {}) => {
  const wrappedReducer = (state, action) => {
    const keepFromActivity =
      (action.config || {}).keepFromActivity ||
      extraConfig.keepFromActivity ||
      getDefaultActivityFrom

    if (action.type === ACTIVATE_DATA) {
      const { __ACTIVITIES__: nextActivities } = getNormalizedMergedState(
        state,
        { __ACTIVITIES__: action.activities },
        {
          getDatumIdKey: () => 'localIdentifier',
          getDatumIdValue: activity =>
            activity.id || `${activity.entityIdentifier}/${activity.dateCreated}`,
          isMergingDatum: true,
        }
      )
      return {
        ...state,
        __ACTIVITIES__: nextActivities
      }
    }

    if (action.type === ASSIGN_DATA) {
      return {
        ...state,
        ...action.patch,
      }
    }

    if (action.type === DELETE_DATA) {
      let patch = action.patch || state
      if (action.config.tags) {
        patch = getDeletedPatchByActivityTag(patch, action.config.tags)
      }
      return {
        ...state,
        ...getNormalizedDeletedState(state, patch, action.config),
      }
    }

    if (action.type === MERGE_DATA) {
      return {
        ...state,
        ...getNormalizedMergedState(state, action.patch, action.config),
      }
    }

    if (action.type === REINITIALIZE_DATA) {
      return reinitializeState(state, initialState, action.config)
    }

    if (
      action.type === 'persist/REHYDRATE' &&
      typeof action.payload !== 'undefined' &&
      typeof action.payload.__ACTIVITIES__ !== 'undefined'
    ) {
      return getNormalizedActivatedState(state,
                                         action.payload,
                                         { keepFromActivity })
    }

    if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      return {
        ...state,
        ...getSuccessState(state, action),
      }
    }

    return state
  }

  const reducer = (state = initialState, action) => {
    const keepFromActivity =
      (action.config || {}).keepFromActivity ||
      extraConfig.keepFromActivity ||
      getDefaultActivityFrom

    const nextState = wrappedReducer(state, action)
    if (state.__ACTIVITIES__ !== nextState.__ACTIVITIES__) {
      return getNormalizedActivatedState(nextState,
                                         { __ACTIVITIES__: nextState.__ACTIVITIES__ },
                                         { keepFromActivity })
    }
    return nextState
  }

  return reducer
}

export default createDataReducer
