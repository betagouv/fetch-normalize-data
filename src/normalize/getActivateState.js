import getNormalizedMergedState from './getNormalizedMergedState'

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
