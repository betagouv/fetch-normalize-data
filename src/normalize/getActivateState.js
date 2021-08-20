import getNormalizedMergedState from './getNormalizedMergedState'

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

export const localIdentifierFrom = activity =>
  `${activity.entityIdentifier}/${activity.dateCreated}`

export const mergedActivitiesFrom = (stateActivities, patchActivities) =>
  getNormalizedMergedState(
    { __activities__: stateActivities },
    { __activities__: patchActivities },
    {
      getDatumIdKey: () => 'localIdentifier',
      getDatumIdValue: activity => activity.id || localIdentifierFrom(activity),
      isMergingDatum: true,
    }
  ).__activities__

const activatedEntityFrom = (activity, config = {}) => {
  const {
    entityDateCreatedsByIdentifier,
    entityDateModifiedsByIdentifier,
  } = config

  const activatedEntity = {
    activityIdentifier: activity.entityIdentifier,
    ...activity.patch,
  }

  if (entityDateCreatedsByIdentifier) {
    activatedEntity.dateCreated =
      entityDateCreatedsByIdentifier[activity.entityIdentifier]
  }

  if (entityDateModifiedsByIdentifier) {
    activatedEntity.dateModified =
      entityDateModifiedsByIdentifier[activity.entityIdentifier] || null
  }

  return activatedEntity
}

export function getActivateState(state, activities, config = {}) {
  return activities.reduce(
    (aggregation, activity) => ({
      ...aggregation,
      ...getNormalizedMergedState(
        aggregation,
        {
          [activity.stateKey]: [activatedEntityFrom(activity, config)],
        },
        {
          getDatumIdKey: () => 'activityIdentifier',
          getDatumIdValue: entity => entity.activityIdentifier,
          isMergingDatum: true,
        }
      ),
    }),
    state
  )
}

export default getActivateState
