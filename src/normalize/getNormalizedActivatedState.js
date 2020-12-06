import getNormalizedMergedState from './getNormalizedMergedState'
import { getDefaultActivityFrom, hydratedActivityFrom } from './utils'


export function getNormalizedActivatedState(state, patch, config={}) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom

  const { __activities__ } = patch
  const hydratedActivities = (__activities__ || []).map(hydratedActivityFrom)


  const stateWithoutDeletedEntitiesByActivities = { ...state }
  const deletedActivityIdentifiers = []
  const deletedActivityIdentifiersByStateKey = {}
  hydratedActivities
    .filter(activity => activity.verb === 'delete' ||
                       (activity.patch && activity.patch.isSoftDeleted))
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
  Object.keys(deletedActivityIdentifiersByStateKey)
        .forEach(stateKey => {
          if (!stateWithoutDeletedEntitiesByActivities[stateKey]) {
            return
          }
          stateWithoutDeletedEntitiesByActivities[stateKey] = stateWithoutDeletedEntitiesByActivities[stateKey].filter(entity =>
            !deletedActivityIdentifiersByStateKey[stateKey].includes(entity.activityIdentifier))
          if (!stateWithoutDeletedEntitiesByActivities[stateKey].length) {
            delete stateWithoutDeletedEntitiesByActivities[stateKey]
          }
        })


  const notDeletedActivities = hydratedActivities.filter(activity =>
    !deletedActivityIdentifiers.includes(activity.entityIdentifier))

  const sortedActivities = notDeletedActivities.sort((activity1, activity2) =>
      new Date(activity1.dateCreated) < new Date(activity2.dateCreated) ? -1 : 1)

  const firstDateCreatedsByIdentifier = {}
  sortedActivities.forEach(activity => {
    if (!firstDateCreatedsByIdentifier[activity.entityIdentifier]) {
      firstDateCreatedsByIdentifier[activity.entityIdentifier] =
        activity.dateCreated
    }
  })

  return sortedActivities.reduce(
    (aggregation, activity) => ({
      ...aggregation,
      ...getNormalizedMergedState(
        aggregation,
        {
          [activity.stateKey]: [
            {
              activityIdentifier: activity.entityIdentifier,
              firstDateCreated:
                firstDateCreatedsByIdentifier[activity.entityIdentifier],
              lastDateCreated: activity.dateCreated,
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
    { ...stateWithoutDeletedEntitiesByActivities, ...patch }
  )
}

export default getNormalizedActivatedState
