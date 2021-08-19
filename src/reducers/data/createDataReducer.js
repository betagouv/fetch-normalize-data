import normalizedActivatedStateFrom, {
  mergedActivitiesFrom,
} from '../../normalize/getNormalizedActivatedState'
import getNormalizedDeletedState from '../../normalize/getNormalizedDeletedState'
import getNormalizedMergedState from '../../normalize/getNormalizedMergedState'
import {
  activitiesWithDeprecationInfoFrom,
  dateCreatedAndModifiedsByEntityIdentifierFrom,
  deletedActivityIdentifiersByStateKeyFrom,
  deprecatedActivitiesFrom,
  entitiesByActivityIdentifierFrom,
  notDeletedActivitiesFrom,
  sortedHydratedActivitiesFrom,
  stateWithoutDeletedEntitiesFrom,
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

export const createDataReducer = (initialState = {}) => {
  const reducer = (state = initialState, action) => {
    if (action.type === ACTIVATE_DATA) {
      //const sortedHydratedActivities = sortedHydratedActivitiesFrom(
      //  (state.__activities__ || []).concat(action.activities)
      //)
      const sortedHydratedActivities = sortedHydratedActivitiesFrom(
        action.activities
      )

      const deletedActivityIdentifiersByStateKey = deletedActivityIdentifiersByStateKeyFrom(
        state,
        sortedHydratedActivities
      )
      const notDeletedActivities = notDeletedActivitiesFrom(
        sortedHydratedActivities,
        deletedActivityIdentifiersByStateKey
      )

      const stateWithoutDeletedEntities = stateWithoutDeletedEntitiesFrom(
        state,
        deletedActivityIdentifiersByStateKey
      )

      const entitiesByActivityIdentifier = entitiesByActivityIdentifierFrom(
        state,
        sortedHydratedActivities
      )

      const {
        entityDateCreatedsByIdentifier,
        entityDateModifiedsByIdentifier,
      } = dateCreatedAndModifiedsByEntityIdentifierFrom(
        state,
        notDeletedActivities,
        entitiesByActivityIdentifier
      )

      /*
      const { __activities__: nextActivities } = getNormalizedMergedActivitiesState(state, sortedHydratedActivities)

      const nextState = nextActivities.length
        ? { ...state, __activities__: nextActivities }
        : state

      return getNormalizedActivatedState(
        nextState,
        { __activities__: nextState.__activities__ },
        { keepFromActivity }
      )
      */

      const activateState = normalizedActivatedStateFrom(
        stateWithoutDeletedEntities,
        notDeletedActivities,
        {
          entityDateCreatedsByIdentifier,
          entityDateModifiedsByIdentifier,
        }
      )
      activateState.__activities__ = mergedActivitiesFrom(
        state.__activities__,
        sortedHydratedActivities
      )

      return activateState
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

    if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      const successState = getSuccessState(state, action)
      let nextState = state

      if (Object.keys(successState).length) {
        nextState = { ...state, ...successState }

        if (state.__activities__) {
          const previousEntitiesByActivityIdentifier = entitiesByActivityIdentifierFrom(
            state,
            state.__activities__
          )

          const nextEntitiesByActivityIdentifier = entitiesByActivityIdentifierFrom(
            nextState,
            state.__activities__
          )

          nextState.__activities__ = activitiesWithDeprecationInfoFrom(
            state.__activities__,
            previousEntitiesByActivityIdentifier,
            nextEntitiesByActivityIdentifier
          )

          const notDeprecatedActivities = deprecatedActivitiesFrom(
            nextState.__activities__
          )

          const {
            entityDateCreatedsByIdentifier,
            entityDateModifiedsByIdentifier,
          } = dateCreatedAndModifiedsByEntityIdentifierFrom(
            state,
            notDeprecatedActivities,
            nextEntitiesByActivityIdentifier
          )

          nextState = normalizedActivatedStateFrom(
            nextState,
            notDeprecatedActivities,
            {
              entityDateCreatedsByIdentifier,
              entityDateModifiedsByIdentifier,
            }
          )
        }
      }

      if (action.config.deleteRequestedActivities) {
        const localIdentifiersOfActivitiesToBeDeleted = action.config.body.map(
          a => a.localIdentifier
        )
        nextState.__activities__ = nextState.__activities__.filter(
          a =>
            !localIdentifiersOfActivitiesToBeDeleted.includes(a.localIdentifier)
        )
      }

      return nextState
    }

    return state
  }
  return reducer
}

export default createDataReducer
