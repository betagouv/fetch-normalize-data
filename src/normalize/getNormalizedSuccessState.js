import uniq from 'lodash.uniq'

import getActivatedState from './getActivatedState'
import getSuccessState from './getSuccessState'
import {
  dateCreatedAndModifiedsByEntityIdentifierFrom,
  entitiesByActivityIdentifierFrom,
} from './utils'

export const deprecatedActivitiesFrom = activities =>
  activities.filter(
    activity =>
      !activity.deprecation || Object.keys(activity.deprecation).length === 0
  )

export const diffFrom = (previousEntity, nextEntity) => {
  const diff = {}
  const sharedKeys = uniq(
    Object.keys(previousEntity).concat(Object.keys(nextEntity))
  )
  sharedKeys.forEach(key => {
    if (['__remote__', 'dateModified', '__tags__'].includes(key)) return
    const previousRemoteValue = previousEntity.__remote__[key]
    const nextRemoteValue = nextEntity.__remote__[key]
    if (previousRemoteValue !== nextRemoteValue) {
      diff[key] = { previous: previousRemoteValue, next: nextRemoteValue }
    }
  })
  return diff
}

export const activitiesWithDeprecationInfoFrom = (
  activities,
  previousEntitiesByActivityIdentifier,
  nextEntitiesByActivityIdentifier
) =>
  activities.map(activity => {
    const activityWithDeprecationInfo = {
      ...activity,
      deprecation: null,
      entityHasBeenModified: false,
    }
    const previousEntity =
      previousEntitiesByActivityIdentifier[activity.entityIdentifier]
    const nextEntity =
      nextEntitiesByActivityIdentifier[activity.entityIdentifier]

    if (
      nextEntity &&
      nextEntity.__remote__ &&
      nextEntity.__remote__.dateModified &&
      nextEntity.__remote__.dateModified > activity.dateCreated
    ) {
      activityWithDeprecationInfo.entityHasBeenModified = true
      const diff = diffFrom(previousEntity, nextEntity)
      const deprecation = {}
      Object.keys(activity.patch).forEach(key => {
        if (diff[key]) {
          deprecation[key] = diff[key]
        }
      })
      if (Object.keys(deprecation).length > 0) {
        activityWithDeprecationInfo.deprecation = deprecation
      }
    }
    return activityWithDeprecationInfo
  })

export function getNormalizedSuccessState(state, action) {
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

      nextState = getActivatedState(nextState, notDeprecatedActivities, {
        entityDateCreatedsByIdentifier,
        entityDateModifiedsByIdentifier,
      })
    }
  }

  if (action.config.deleteRequestedActivities) {
    const localIdentifiersOfActivitiesToBeDeleted = action.config.body.map(
      a => a.localIdentifier
    )
    nextState.__activities__ = nextState.__activities__.filter(
      a => !localIdentifiersOfActivitiesToBeDeleted.includes(a.localIdentifier)
    )
  }

  return nextState
}

export default getNormalizedSuccessState
