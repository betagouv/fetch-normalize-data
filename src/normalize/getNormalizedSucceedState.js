import getActivateState, {
  dateCreatedAndModifiedsByEntityIdentifierFrom,
  entitiesByActivityIdentifierFrom,
} from './getActivateState'
import getSuccessState from './getSuccessState'

export const deprecatedActivitiesFrom = activities =>
  activities.filter(
    activity =>
      !activity.deprecation || Object.keys(activity.deprecation).length === 0
  )

function intersect(a, b) {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  return Array.from(intersection)
}

export const remoteDiffFrom = (previousEntity, nextEntity) => {
  const remoteDiff = {}
  const previousEntityRemote = previousEntity.__remote__ || {}
  const nextEntityRemote = nextEntity.__remote__ || {}
  const sharedKeys = intersect(
    Object.keys(previousEntityRemote),
    Object.keys(nextEntityRemote)
  )
  sharedKeys.forEach(key => {
    if (['__remote__', 'dateModified'].includes(key)) return
    const previousRemoteValue = previousEntityRemote[key]
    const nextRemoteValue = nextEntityRemote[key]
    if (previousRemoteValue !== nextRemoteValue) {
      remoteDiff[key] = { previous: previousRemoteValue, next: nextRemoteValue }
    }
  })
  return remoteDiff
}

export const activitiesWithDeprecationInfoFrom = (
  activities,
  previousEntitiesByActivityIdentifier,
  nextEntitiesByActivityIdentifier
) =>
  activities.map(activity => {
    const activityWithDeprecationInfo = {
      deprecation: null,
      bothLocalAndRemoteEntityHaveBeenModified: false,
      ...activity,
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
      activityWithDeprecationInfo.bothLocalAndRemoteEntityHaveBeenModified = true
      const remoteDiff = remoteDiffFrom(previousEntity, nextEntity)
      const deprecation = {}
      Object.keys(activity.patch).forEach(key => {
        if (remoteDiff[key]) {
          deprecation[key] = remoteDiff[key]
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

      nextState = getActivateState(nextState, notDeprecatedActivities, {
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
