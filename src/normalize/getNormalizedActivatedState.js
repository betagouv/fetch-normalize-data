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

const defaultOnDeprecatedActivities = () =>
  console.debug(
    'The local state found some deprecated activities, by default the application will not anymore consider them.'
  )

export function getNormalizedActivatedState(state, patch, config = {}) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom
  const onDeprecatedActivites =
    config.onDeprecatedActivites || defaultOnDeprecatedActivities

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

  if (notDeletedActivities.length > notDeprecatedActivities.length) {
    onDeprecatedActivites(state, patch, {
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
