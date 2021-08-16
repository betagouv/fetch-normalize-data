import getNormalizedMergedState from './getNormalizedMergedState'
import {
  dateCreatedAndModifiedsByEntityIdentifierFrom,
  deletedActivityIdentifiersByStateKeyFrom,
  entitiesByActivityIdentifierFrom,
  getDefaultActivityFrom,
  notDeletedActivitiesFrom,
  notDeprecatedActivitiesFrom,
  stateKeysByEntityIdentifierFrom,
  stateWithoutDeletedEntitiesFrom,
} from './utils'

export function getNormalizedActivatedState(state, patch, config = {}) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom
  const onDeprecatedActivities = config.onDeprecatedActivities

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

  const notDeprecatedActivities = notDeprecatedActivitiesFrom(
    notDeletedActivities,
    entitiesByActivityIdentifier
  )

  if (
    onDeprecatedActivities &&
    notDeletedActivities.length > notDeprecatedActivities.length
  ) {
    onDeprecatedActivities(state, patch, {
      notDeprecatedActivities,
      notDeletedActivities,
    })
  }

  const {
    entityDateCreatedsByIdentifier,
    entityDateModifiedsByIdentifier,
  } = dateCreatedAndModifiedsByEntityIdentifierFrom(
    state,
    notDeprecatedActivities,
    entitiesByActivityIdentifier
  )

  return notDeprecatedActivities.reduce(
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
}

export default getNormalizedActivatedState
