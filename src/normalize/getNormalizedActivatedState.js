import getNormalizedMergedState from './getNormalizedMergedState'
import {
  dateCreatedAndModifiedHelpersFrom,
  deletionHelpersFrom,
  getDefaultActivityFrom,
  sortedHydratedActivitiesFrom,
} from './utils'

export function getNormalizedActivatedState(state, patch, config = {}) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom

  const sortedHydratedActivities = sortedHydratedActivitiesFrom(
    state,
    patch.__activities__
  )
  const hydratedPatch = { ...patch, __activities__: sortedHydratedActivities }

  const {
    notDeletedActivities,
    stateWithoutDeletedEntitiesByActivities,
  } = deletionHelpersFrom(state, sortedHydratedActivities)

  const {
    entityDateCreatedsByIdentifier,
    entityDateModifiedsByIdentifier,
  } = dateCreatedAndModifiedHelpersFrom(
    stateWithoutDeletedEntitiesByActivities,
    notDeletedActivities
  )

  return notDeletedActivities.reduce(
    (aggregation, activity) => ({
      ...aggregation,
      ...getNormalizedMergedState(
        aggregation,
        {
          [activity.stateKey]: [
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
    { ...stateWithoutDeletedEntitiesByActivities, ...hydratedPatch }
  )
}

export default getNormalizedActivatedState
