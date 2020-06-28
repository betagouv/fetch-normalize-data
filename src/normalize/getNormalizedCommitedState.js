import uniq from 'lodash.uniq'

import getNormalizedMergedState from './getNormalizedMergedState'
import { getDefaultCommitFrom } from './utils'


export function getNormalizedCommitedState(state, patch, config) {
  const getCommitFrom = config.getCommitFrom || getDefaultCommitFrom
  const nextState = config.nextState || {}
  const { __COMMITS__ } = patch

  const deletedCommitUuids = __COMMITS__.filter(commit =>
    commit.isRemoved).map(commit => commit.uuid)

  const notSoftDeletedCommits = __COMMITS__.filter(commit =>
    !deletedCommitUuids.includes(commit.uuid))

  const sortedCommits = notSoftDeletedCommits.sort(
    (commit1, commit2) =>
      new Date(commit1.dateCreated) < new Date(commit2.dateCreated)
      ? -1
      : 1
  )

  const firstDateCreatedsByUuid = {}
  sortedCommits.forEach(commit => {
    if (!firstDateCreatedsByUuid[commit.uuid]) {
      firstDateCreatedsByUuid[commit.uuid] = commit.dateCreated
    }
  })

  const collectionNames = uniq((state.__COMMITS__ || [])
                          .map(commit => commit.collectionName))
  collectionNames.forEach(collectionName => { delete nextState[collectionName] })


  return sortedCommits.reduce((aggregation, commit) => ({
      ...aggregation,
      ...getNormalizedMergedState(
          aggregation,
          {
            [commit.collectionName]: [
              {
                firstDateCreated: firstDateCreatedsByUuid[commit.uuid],
                lastDateCreated: commit.dateCreated,
                uuid: commit.uuid,
                ...commit.patch,
                ...getCommitFrom(commit)
              }
            ]
          },
          {
            getDatumIdKey: () => 'uuid',
            getDatumIdValue: commit => commit.uuid,
            isMergingDatum: true
          }
      )
    }), {})
}


export default getNormalizedCommitedState
