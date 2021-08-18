import getNormalizedMergedState from './getNormalizedMergedState'
import {
  dateCreatedAndModifiedsByEntityIdentifierFrom,
  deletedActivityIdentifiersByStateKeyFrom,
  deprecatedAndNotDeprecatedActivitiesFrom,
  entitiesByActivityIdentifierFrom,
  getDefaultActivityFrom,
  notDeletedActivitiesFrom,
  stateKeysByEntityIdentifierFrom,
  stateWithoutDeletedEntitiesFrom,
} from './utils'

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

  const {
    deprecatedActivities,
    notDeprecatedActivities,
  } = deprecatedAndNotDeprecatedActivitiesFrom(
    notDeletedActivities,
    entitiesByActivityIdentifier
  )

  const {
    entityDateCreatedsByIdentifier,
    entityDateModifiedsByIdentifier,
  } = dateCreatedAndModifiedsByEntityIdentifierFrom(
    state,
    notDeprecatedActivities,
    entitiesByActivityIdentifier
  )

  const normalizedActivatedState = notDeprecatedActivities.reduce(
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

  if (deprecatedActivities.length > 0) {
    const deprecatedActivityLocalIdentifiers = deprecatedActivities.map(
      a => a.localIdentifier
    )
    normalizedActivatedState.__activities__ = normalizedActivatedState.__activities__.map(
      a => ({
        ...a,
        isDeprecated: deprecatedActivityLocalIdentifiers.includes(
          a.localIdentifier
        ),
      })
    )
  }

  return normalizedActivatedState
}

export default getNormalizedActivatedState
