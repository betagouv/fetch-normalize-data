import uniq from 'lodash.uniq'
import pluralize from 'pluralize'

export function getDefaultDatumIdKey() {
  return 'id'
}

export function getDefaultDatumIdValue(datum, index) {
  if (typeof datum.id !== 'undefined') return datum.id
  return index
}

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

export const stateKeysByEntityIdentifierFrom = activities => {
  const stateKeysByEntityIdentifier = {}
  activities.forEach(activity => {
    stateKeysByEntityIdentifier[activity.entityIdentifier] = stateKeyFrom(
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

export const entitiesByActivityIdentifierFrom = (state, activities) => {
  const entitiesByActivityIdentifier = {}
  activities.forEach(activity => {
    const stateKey = activity.stateKey
    const entity = (state[stateKey] || []).find(
      e => e.activityIdentifier === activity.entityIdentifier
    )
    if (entity) {
      entitiesByActivityIdentifier[activity.entityIdentifier] = entity
    }
  })
  return entitiesByActivityIdentifier
}

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

export const dateCreatedAndModifiedsByEntityIdentifierFrom = (
  state,
  activities,
  entitiesByActivityIdentifier
) => {
  const entityDateCreatedsByIdentifier = {}
  const entityDateModifiedsByIdentifier = {}

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
      if (
        !entity ||
        !entity.dateModified ||
        new Date(activity.dateCreated) >= new Date(entity.dateModified)
      ) {
        entityDateModifiedsByIdentifier[activity.entityIdentifier] =
          activity.dateCreated
      } else {
        entityDateModifiedsByIdentifier[activity.entityIdentifier] =
          entity.dateModified
      }
    }
  })

  return {
    entityDateCreatedsByIdentifier,
    entityDateModifiedsByIdentifier,
  }
}

export const deprecatedActivitiesFrom = activities =>
  activities.filter(
    activity =>
      !activity.deprecation || Object.keys(activity.deprecation).length === 0
  )
