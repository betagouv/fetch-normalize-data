import getNormalizedMergedState from './getNormalizedMergedState'
import {
  dateCreatedAndModifiedHelpersFrom,
  deletionHelpersFrom,
  getDefaultActivityFrom,
  stateKeysByEntityIdentifierFrom,
} from './utils'

export function getNormalizedActivatedState(state, patch, config = {}) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom

  const stateKeysByEntityIdentifier = stateKeysByEntityIdentifierFrom(
    patch.__activities__
  )

  const {
    notDeletedActivities,
    stateWithoutDeletedEntities,
  } = deletionHelpersFrom(state, patch.__activities__)

  const {
    entityDateCreatedsByIdentifier,
    entityDateModifiedsByIdentifier,
  } = dateCreatedAndModifiedHelpersFrom(
    stateWithoutDeletedEntities,
    notDeletedActivities
  )

  return notDeletedActivities.reduce(
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
