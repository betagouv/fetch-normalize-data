import pluralize from 'pluralize'

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

const localStateKeyFrom = activity => {
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
    localStateKey: localStateKeyFrom(activity),
    patch: { ...activity.patch },
  }
}

export const stateKeysByEntityIdentifierFrom = activities => {
  const stateKeysByEntityIdentifier = {}
  activities.forEach(activity => {
    stateKeysByEntityIdentifier[activity.entityIdentifier] = localStateKeyFrom(
      activity
    )
  })
  return stateKeysByEntityIdentifier
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
      const localStateKey = activity.localStateKey
      deletedActivityIdentifiers.push(activityIdentifier)
      if (!deletedActivityIdentifiersByStateKey[localStateKey]) {
        deletedActivityIdentifiersByStateKey[localStateKey] = [
          activityIdentifier,
        ]
      } else {
        deletedActivityIdentifiersByStateKey[localStateKey].push(
          activityIdentifier
        )
      }
    })

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

  const notDeletedActivities = activities.filter(
    activity => !deletedActivityIdentifiers.includes(activity.entityIdentifier)
  )

  return {
    notDeletedActivities,
    stateWithoutDeletedEntities,
  }
}

export const dateCreatedAndModifiedHelpersFrom = (state, activities) => {
  const entityDateCreatedsByIdentifier = {}
  const entityDateModifiedsByIdentifier = {}

  const entitiesByActivityIdentifier = {}

  activities.forEach(activity => {
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
  }
}
