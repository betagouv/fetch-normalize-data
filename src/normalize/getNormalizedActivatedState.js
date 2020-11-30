import uniq from 'lodash.uniq'

import getNormalizedMergedState from './getNormalizedMergedState'
import { getDefaultActivityFrom, hydratedActivityFrom } from './utils'

export function getNormalizedActivatedState(state, patch, config) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom

  const stateWithPossibleDeletedKeys = { ...state }
  const { activities } = patch

  const hydratedActivities = (activities || []).map(hydratedActivityFrom)

  const deletedActivityUuids = hydratedActivities
    .filter(activity => activity.isRemoved)
    .map(activity => activity.uuid)

  const notSoftDeletedActivities = hydratedActivities.filter(
    activity => !deletedActivityUuids.includes(activity.uuid)
  )

  const sortedActivities = notSoftDeletedActivities.sort(
    (activity1, activity2) =>
      new Date(activity1.dateCreated) < new Date(activity2.dateCreated) ? -1 : 1
  )

  const firstDateCreatedsByUuid = {}
  sortedActivities.forEach(activity => {
    if (!firstDateCreatedsByUuid[activity.uuid]) {
      firstDateCreatedsByUuid[activity.uuid] = activity.dateCreated
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
              activityUuid: activity.uuid,
              firstDateCreated: firstDateCreatedsByUuid[activity.uuid],
              lastDateCreated: activity.dateCreated,
              ...activity.patch,
              ...keepFromActivity(activity),
            },
          ],
        },
        {
          getDatumIdKey: () => 'activityUuid',
          getDatumIdValue: entity => entity.activityUuid,
          isMergingDatum: true,
        }
      ),
    }),
    { ...stateWithPossibleDeletedKeys, ...patch }
  )
}

export default getNormalizedActivatedState
