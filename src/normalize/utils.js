import pluralize from 'pluralize'

import { ACTIVATE_DATA } from '../reducers/data/actions'

export function getDefaultDatumIdKey() {
  return 'id'
}

export function getDefaultDatumIdValue(datum, index) {
  if (typeof datum.id !== 'undefined') return datum.id
  return index
}

export function getDefaultActivityFrom() {
  return {}
}

export function hydratedActivityFrom(activity) {
  let stateKey = activity.stateKey
  if (!stateKey) {
    if (activity.tableName) {
      stateKey = pluralize(activity.tableName, 2)
    } else if (activity.modelName) {
      stateKey = pluralize(
        `${activity.modelName[0].toLowerCase()}${activity.modelName.slice(1)}`,
        2
      )
    } else {
      console.warn(
        'Missing stateKey or tableName or modelName for that activity.'
      )
    }
  }
  return {
    ...activity,
    dateCreated: activity.dateCreated || new Date().toISOString(),
    patch: { ...activity.patch },
    stateKey,
  }
}

export const merge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) {
      if (Array.isArray(source[key])) {
        if (source[key][0]) {
          if (
            !(source[key][0] instanceof Object) ||
            Array.isArray(source[key][0])
          ) {
            target[key] = source[key]
            continue
          }
        }
        target[key] = source[key].map((s, index) =>
          merge({ ...(target[key] && target[key][index]) }, s)
        )
      } else {
        target[key] = merge({ ...target[key] }, source[key])
      }
    } else {
      target[key] = source[key]
    }
  }
  return target
}

export const forceLocalActivitiesWithStrictIncreasingDateCreated = (
  state,
  activities,
  config = {}
) => {
  const takeInAccountEntity =
    config && config.action && config.action.type === ACTIVATE_DATA
  const lastDateCreatedByIdentifier = {}
  activities.forEach(activity => {
    let lastDateCreated = lastDateCreatedByIdentifier[activity.entityIdentifier]
    if (!lastDateCreated && takeInAccountEntity) {
      const entity = (state[activity.stateKey] || []).find(
        entity => entity.activityIdentifier === activity.entityIdentifier
      )
      if (entity) {
        lastDateCreated = entity.dateModified || entity.dateCreated
      }
    }
    if (
      lastDateCreated >= activity.dateCreated &&
      typeof activity.id === 'undefined'
    ) {
      const dateTimePlusOneMillisecond = new Date(lastDateCreated).getTime() + 1
      activity.dateCreated = new Date(dateTimePlusOneMillisecond).toISOString()
    }
    lastDateCreatedByIdentifier[activity.entityIdentifier] =
      activity.dateCreated
  })
}

export const sortedHydratedActivitiesFrom = (state, activities, config) => {
  const hydratedSortedActivities = (activities || []).map(hydratedActivityFrom)
  hydratedSortedActivities.sort((activity1, activity2) =>
    new Date(activity1.dateCreated) < new Date(activity2.dateCreated) ? -1 : 1
  )
  forceLocalActivitiesWithStrictIncreasingDateCreated(
    state,
    hydratedSortedActivities,
    config
  )
  return hydratedSortedActivities
}

export const deletionHelpersFrom = (state, activities) => {
  const deletedActivityIdentifiers = []
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
      deletedActivityIdentifiers.push(activityIdentifier)
      if (!deletedActivityIdentifiersByStateKey[stateKey]) {
        deletedActivityIdentifiersByStateKey[stateKey] = [activityIdentifier]
      } else {
        deletedActivityIdentifiersByStateKey[stateKey].push(activityIdentifier)
      }
    })

  const stateWithoutDeletedEntitiesByActivities = { ...state }
  Object.keys(deletedActivityIdentifiersByStateKey).forEach(stateKey => {
    if (!stateWithoutDeletedEntitiesByActivities[stateKey]) {
      return
    }
    stateWithoutDeletedEntitiesByActivities[
      stateKey
    ] = stateWithoutDeletedEntitiesByActivities[stateKey].filter(
      entity =>
        !deletedActivityIdentifiersByStateKey[stateKey].includes(
          entity.activityIdentifier
        )
    )
    if (!stateWithoutDeletedEntitiesByActivities[stateKey].length) {
      delete stateWithoutDeletedEntitiesByActivities[stateKey]
    }
  })

  const notDeletedActivities = activities.filter(
    activity => !deletedActivityIdentifiers.includes(activity.entityIdentifier)
  )

  return {
    notDeletedActivities,
    stateWithoutDeletedEntitiesByActivities,
  }
}

export const dateCreatedAndModifiedHelpersFrom = (state, activities) => {
  const entityDateCreatedsByIdentifier = {}
  const entityDateModifiedsByIdentifier = {}

  const entitiesByActivityIdentifier = {}

  const notDeprecatedActivities = activities.filter(activity => {
    let entity = entitiesByActivityIdentifier[activity.entityIdentifier]
    if (!entity) {
      entity = (state[activity.stateKey] || []).find(
        entity => entity.activityIdentifier === activity.entityIdentifier
      )
    }
    if (!entity) return true
    entitiesByActivityIdentifier[activity.entityIdentifier] = entity
    if (!entity.dateModified) return true
    return new Date(activity.dateCreated) > new Date(entity.dateModified)
  })

  notDeprecatedActivities.forEach(activity => {
    const entity = entitiesByActivityIdentifier[activity.entityIdentifier]
    if (
      typeof entityDateCreatedsByIdentifier[activity.entityIdentifier] ===
      'undefined'
    ) {
      if (entity) {
        entityDateCreatedsByIdentifier[activity.entityIdentifier] =
          entity.dateCreated
      } else {
        entityDateCreatedsByIdentifier[activity.entityIdentifier] =
          activity.dateCreated
        return
      }
    }
    if (
      entityDateCreatedsByIdentifier[activity.entityIdentifier] !==
      activity.dateCreated
    ) {
      if (entity) {
        entityDateModifiedsByIdentifier[activity.entityIdentifier] =
          activity.dateCreated
        return
      }
      entityDateModifiedsByIdentifier[activity.entityIdentifier] =
        activity.dateCreated
    }
  })

  return {
    entityDateCreatedsByIdentifier,
    entityDateModifiedsByIdentifier,
    notDeprecatedActivities,
  }
}
