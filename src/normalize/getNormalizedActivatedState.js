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

/*
export function getNormalizedActivatedState(state, patch, config = {}) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom

  const stateKeysByEntityIdentifier = stateKeysByEntityIdentifierFrom(
    patch.__activities__
  )

  const deletedActivityIdentifiersByStateKey = deletedActivityIdentifiersByStateKeyFrom(
    state,
    patch.__activities__,
    stateKeysByEntityIdentifier
  )
  const notDeletedActivities = notDeletedActivitiesFrom(
    patch.__activities__,
    deletedActivityIdentifiersByStateKey
  )

  const stateWithoutDeletedEntities = stateWithoutDeletedEntitiesFrom(
    state,
    deletedActivityIdentifiersByStateKey
  )

  const entitiesByActivityIdentifier = entitiesByActivityIdentifierFrom(
    state,
    patch.__activities__,
    stateKeysByEntityIdentifier
  )

  const activitiesWithDeprecationInfo = activitiesWithDeprecationInfoFrom(
    notDeletedActivities,
    entitiesByActivityIdentifier
  )

  const notDeprecatedActivities = activitiesWithDeprecationInfo.filter(a =>
    a.deprecatedKeys && a.deprecatedKeys.length > 0)

  const {
    entityDateCreatedsByIdentifier,
    entityDateModifiedsByIdentifier,
  } = dateCreatedAndModifiedsByEntityIdentifierFrom(
    state,
    notDeprecatedActivities,
    entitiesByActivityIdentifier
  )

  let normalizedActivatedState = notDeprecatedActivities.reduce(
    (aggregation, activity) => ({
      ...aggregation,
      ...getNormalizedMergedState(
        aggregation,
        {
          [stateKeysByEntityIdentifier[activity.entityIdentifier]]: [
            {
              activityIdentifier: activity.entityIdentifier,
              dateCreated:
                entityDateCreatedsByIdentifier[activity.entityIdentifier],
              dateModified:
                entityDateModifiedsByIdentifier[activity.entityIdentifier] ||
                null,
              ...activity.patch,
              ...keepFromActivity(activity),
            },
          ],
        },
        {
          getDatumIdKey: () => 'activityIdentifier',
          getDatumIdValue: entity => entity.activityIdentifier,
          isMergingDatum: true,
        }
      ),
    }),
    { ...stateWithoutDeletedEntities, ...patch }
  )


  //normalizedActivatedState = getNormalizedMergedActivitiesState(
  //  normalizedActivatedState,
  //  activitiesWithDeprecationInfo)

  return normalizedActivatedState
}
*/

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

export function normalizedActivatedStateFrom(state, activities, config = {}) {
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

export default normalizedActivatedStateFrom
