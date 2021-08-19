import pluralize from 'pluralize'

import getActivatedState, { mergedActivitiesFrom } from './getActivatedState'
import {
  dateCreatedAndModifiedsByEntityIdentifierFrom,
  entitiesByActivityIdentifierFrom,
} from './utils'

const stateKeyFrom = activity => {
  let localStateKey = activity.localStateKey
  if (!localStateKey) {
    if (activity.tableName) {
      localStateKey = pluralize(activity.tableName, 2)
    } else if (activity.modelName) {
      localStateKey = pluralize(
        `${activity.modelName[0].toLowerCase()}${activity.modelName.slice(1)}`,
        2
      )
    } else {
      console.warn(
        'Missing localStateKey or tableName or modelName for that activity.'
      )
    }
  }
  return localStateKey
}

export function hydratedActivityFrom(activity) {
  return {
    ...activity,
    dateCreated: activity.dateCreated || new Date().toISOString(),
    deprecation: null,
    entityHasBeenModified: false,
    patch: { ...activity.patch },
    stateKey: stateKeyFrom(activity),
  }
}

export const forceActivitiesWithStrictIncreasingDateCreated = activities => {
  const lastDateCreatedByIdentifier = {}
  activities.forEach(activity => {
    const lastDateCreated =
      lastDateCreatedByIdentifier[activity.entityIdentifier]
    if (lastDateCreated >= activity.dateCreated) {
      const dateTimePlusOneMillisecond = new Date(lastDateCreated).getTime() + 1
      activity.dateCreated = new Date(dateTimePlusOneMillisecond).toISOString()
    }
    lastDateCreatedByIdentifier[activity.entityIdentifier] =
      activity.dateCreated
  })
}

export const sortedHydratedActivitiesFrom = activities => {
  const hydratedSortedActivities = (activities || []).map(hydratedActivityFrom)
  hydratedSortedActivities.sort((activity1, activity2) =>
    new Date(activity1.dateCreated) < new Date(activity2.dateCreated) ? -1 : 1
  )
  forceActivitiesWithStrictIncreasingDateCreated(hydratedSortedActivities)
  return hydratedSortedActivities
}

export const notDeletedActivitiesFrom = (
  activities,
  deletedActivityIdentifiersByStateKey
) => {
  const deletedActivityIdentifiers = Object.values(
    deletedActivityIdentifiersByStateKey
  ).reduce((agg, list) => agg.concat(list), [])
  return activities.filter(
    activity => !deletedActivityIdentifiers.includes(activity.entityIdentifier)
  )
}

export const deletedActivityIdentifiersByStateKeyFrom = (state, activities) => {
  const deletedActivityIdentifiersByStateKey = {}
  activities
    .filter(
      activity =>
        activity.verb === 'delete' ||
        (activity.patch && activity.patch.isSoftDeleted)
    )
    .forEach(activity => {
      const activityIdentifier = activity.entityIdentifier
      const stateKey = activity.stateKey
      if (!deletedActivityIdentifiersByStateKey[stateKey]) {
        deletedActivityIdentifiersByStateKey[stateKey] = [activityIdentifier]
      } else {
        deletedActivityIdentifiersByStateKey[stateKey].push(activityIdentifier)
      }
    })
  return deletedActivityIdentifiersByStateKey
}

export const stateWithoutDeletedEntitiesFrom = (
  state,
  deletedActivityIdentifiersByStateKey
) => {
  const stateWithoutDeletedEntities = { ...state }
  Object.keys(deletedActivityIdentifiersByStateKey).forEach(localStateKey => {
    if (!stateWithoutDeletedEntities[localStateKey]) {
      return
    }
    stateWithoutDeletedEntities[localStateKey] = stateWithoutDeletedEntities[
      localStateKey
    ].filter(
      entity =>
        !deletedActivityIdentifiersByStateKey[localStateKey].includes(
          entity.activityIdentifier
        )
    )
    if (!stateWithoutDeletedEntities[localStateKey].length) {
      delete stateWithoutDeletedEntities[localStateKey]
    }
  })

  return stateWithoutDeletedEntities
}

export function getNormalizedActivatedState(state, activities) {
  const sortedHydratedActivities = sortedHydratedActivitiesFrom(activities)

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

  const activateState = getActivatedState(
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

export default getNormalizedActivatedState
