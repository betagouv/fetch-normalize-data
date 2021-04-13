import getNormalizedMergedState from './getNormalizedMergedState'
import { getDefaultActivityFrom, sortedHydratedActivitiesFrom } from './utils'

export function getNormalizedActivatedState(state, patch, config = {}) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom

  const sortedHydratedActivities = sortedHydratedActivitiesFrom(
    state,
    patch.__activities__
  )
  const hydratedPatch = { ...patch, __activities__: sortedHydratedActivities }

  const stateWithoutDeletedEntitiesByActivities = { ...state }
  const deletedActivityIdentifiers = []
  const deletedActivityIdentifiersByStateKey = {}
  sortedHydratedActivities
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

  const notDeletedActivities = sortedHydratedActivities.filter(
    activity => !deletedActivityIdentifiers.includes(activity.entityIdentifier)
  )

  const entityDateCreatedsByIdentifier = {}
  const entityDateModifiedsByIdentifier = {}
  notDeletedActivities.forEach(activity => {
    const alreadyCreatedEntity = (
      stateWithoutDeletedEntitiesByActivities[activity.stateKey] || []
    ).find(entity => entity.activityIdentifier === activity.entityIdentifier)
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
      }
    } else if (
      alreadyCreatedEntity &&
      (!alreadyCreatedEntity.dateModified ||
        new Date(activity.dateCreated) >
          new Date(alreadyCreatedEntity.dateCreated))
    ) {
      entityDateModifiedsByIdentifier[activity.entityIdentifier] =
        activity.dateCreated
    }
  })

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
