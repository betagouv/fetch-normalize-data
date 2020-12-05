import uniq from 'lodash.uniq'

import getNormalizedMergedState from './getNormalizedMergedState'
import { getDefaultActivityFrom, hydratedActivityFrom } from './utils'

export function getNormalizedActivatedState(state, patch, config) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom

  const stateWithPossibleDeletedKeys = { ...state }
  const { __activities__ } = patch

  const hydratedActivities = (__activities__ || []).map(hydratedActivityFrom)

  const deletedActivityIdentifiers = hydratedActivities
    .filter(activity => activity.isRemoved)
    .map(activity => activity.entityIdentifier)

  const notSoftDeletedActivities = hydratedActivities.filter(
    activity => !deletedActivityIdentifiers.includes(activity.entityIdentifier)
  )

  const sortedActivities = notSoftDeletedActivities.sort(
    (activity1, activity2) =>
      new Date(activity1.dateCreated) < new Date(activity2.dateCreated) ? -1 : 1
  )

  const firstDateCreatedsByIdentifier = {}
  sortedActivities.forEach(activity => {
    if (!firstDateCreatedsByIdentifier[activity.entityIdentifier]) {
      firstDateCreatedsByIdentifier[activity.entityIdentifier] =
        activity.dateCreated
    }
  })

  const stateKeys = uniq(hydratedActivities.map(activity => activity.stateKey))

  stateKeys.forEach(stateKey => {
    delete stateWithPossibleDeletedKeys[stateKey]
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
    { ...stateWithPossibleDeletedKeys, ...patch }
  )
}

export default getNormalizedActivatedState
