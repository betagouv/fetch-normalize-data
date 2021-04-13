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
  activities
) => {
  const lastDateCreatedByIdentifier = {}
  activities.forEach(activity => {
    let lastDateCreated = lastDateCreatedByIdentifier[activity.entityIdentifier]
    if (!lastDateCreated) {
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

export const sortedHydratedActivitiesFrom = (state, activities) => {
  const hydratedSortedActivities = (activities || []).map(hydratedActivityFrom)
  hydratedSortedActivities.sort((activity1, activity2) =>
    new Date(activity1.dateCreated) < new Date(activity2.dateCreated) ? -1 : 1
  )
  forceLocalActivitiesWithStrictIncreasingDateCreated(
    state,
    hydratedSortedActivities
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

  activities.forEach(activity => {
    const alreadyCreatedEntity = (state[activity.stateKey] || []).find(
      entity => entity.activityIdentifier === activity.entityIdentifier
    )

    if (
      typeof entityDateCreatedsByIdentifier[activity.entityIdentifier] ===
      'undefined'
    ) {
      if (alreadyCreatedEntity) {
        entityDateCreatedsByIdentifier[activity.entityIdentifier] =
          alreadyCreatedEntity.dateCreated
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
      if (alreadyCreatedEntity) {
        const activityIsNew =
          !alreadyCreatedEntity.dateModified ||
          new Date(activity.dateCreated) >
            new Date(alreadyCreatedEntity.dateModified)
        if (activityIsNew) {
          entityDateModifiedsByIdentifier[activity.entityIdentifier] =
            activity.dateCreated
          return
        }
        entityDateModifiedsByIdentifier[activity.entityIdentifier] =
          alreadyCreatedEntity.dateModified
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
