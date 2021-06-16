import getNormalizedActivatedState from '../../normalize/getNormalizedActivatedState'
import getNormalizedDeletedState from '../../normalize/getNormalizedDeletedState'
import getNormalizedMergedState from '../../normalize/getNormalizedMergedState'
import {
  getDefaultActivityFrom,
  sortedHydratedActivitiesFrom,
} from '../../normalize/utils'
import {
  ACTIVATE_DATA,
  ASSIGN_DATA,
  DELETE_DATA,
  MERGE_DATA,
  REINITIALIZE_DATA,
} from './actions'
import getDeletedPatchByActivityTag from './getDeletedPatchByActivityTag'
import getSuccessState from './getSuccessState'
import reinitializeState from './reinitializeState'

export const createDataReducer = (initialState = {}, extraConfig = {}) => {
  const wrappedReducer = (state, action) => {
    const keepFromActivity =
      (action.config || {}).keepFromActivity ||
      extraConfig.keepFromActivity ||
      getDefaultActivityFrom

    if (action.type === ACTIVATE_DATA) {
      const sortedHydratedActivities = sortedHydratedActivitiesFrom(
        state,
        (state.__activities__ || []).concat(action.activities)
      )
      const { __activities__: nextActivities } = getNormalizedMergedState(
        state,
        { __activities__: sortedHydratedActivities },
        {
          getDatumIdKey: () => 'localIdentifier',
          getDatumIdValue: activity =>
            activity.id ||
            `${activity.entityIdentifier}/${activity.dateCreated}`,
          isMergingDatum: true,
        }
      )
      return nextActivities.length
        ? { ...state, __activities__: nextActivities }
        : state
    }

    if (action.type === ASSIGN_DATA) {
      return Object.keys(action.patch || {}).length
        ? { ...state, ...action.patch }
        : state
    }

    if (action.type === DELETE_DATA) {
      let patch = action.patch || state
      if (action.config.tags) {
        patch = getDeletedPatchByActivityTag(patch, action.config.tags)
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

    if (
      action.type === 'persist/REHYDRATE' &&
      typeof action.payload !== 'undefined' &&
      typeof action.payload.__activities__ !== 'undefined'
    ) {
      return getNormalizedActivatedState(state, action.payload, {
        keepFromActivity,
      })
    }

    if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      const successState = getSuccessState(state, action)
      return Object.keys(successState).length
        ? { ...state, ...successState }
        : state
    }

    return state
  }

  const reducer = (state = initialState, action) => {
    const keepFromActivity =
      (action.config || {}).keepFromActivity ||
      extraConfig.keepFromActivity ||
      getDefaultActivityFrom

    const nextState = wrappedReducer(state, action)
    if (
      state.__activities__ !== nextState.__activities__ ||
      (nextState.__activities__ &&
        nextState.__activities__.some(activity => activity.localIdentifier))
    ) {
      return getNormalizedActivatedState(
        nextState,
        { __activities__: nextState.__activities__ },
        { keepFromActivity }
      )
    }
    return nextState
  }

  return reducer
}

export default createDataReducer
