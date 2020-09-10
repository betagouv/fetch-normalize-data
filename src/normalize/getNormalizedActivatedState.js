import uniq from 'lodash.uniq'

import getNormalizedMergedState from './getNormalizedMergedState'
import { getDefaultActivityFrom } from './utils'

export function getNormalizedActivatedState(state, patch, config) {
  const keepFromActivity = config.keepFromActivity || getDefaultActivityFrom

  const stateWithPossibleDeletedCollections = { ...state }
  const { activities } = patch

  const deletedActivityUuids = (activities || [])
    .filter(activity => activity.isRemoved)
    .map(activity => activity.uuid)

  const notSoftDeletedActivities = (activities || []).filter(
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

  const collectionNames = uniq(
    (activities || []).map(activity => activity.collectionName)
  )
  collectionNames.forEach(collectionName => {
    delete stateWithPossibleDeletedCollections[collectionName]
  })

  return sortedActivities.reduce(
    (aggregation, activity) => ({
      ...aggregation,
      ...getNormalizedMergedState(
        aggregation,
        {
          [activity.collectionName]: [
            {
              firstDateCreated: firstDateCreatedsByUuid[activity.uuid],
              lastDateCreated: activity.dateCreated,
              uuid: activity.uuid,
              ...activity.patch,
              ...keepFromActivity(activity),
            },
          ],
        },
        {
          getDatumIdKey: () => 'uuid',
          getDatumIdValue: activity => activity.uuid,
          isMergingDatum: true,
        }
      ),
    }),
    { ...stateWithPossibleDeletedCollections, ...patch }
  )
}

export default getNormalizedActivatedState
