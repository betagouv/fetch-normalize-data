import {
  ASSIGN_DATA,
  COMMIT_DATA,
  DELETE_DATA,
  MERGE_DATA,
  REINITIALIZE_DATA,
} from './actions'
import getSuccessState from './getSuccessState'
import getDeletedPatchByActivityTag from './getDeletedPatchByActivityTag'
import reinitializeState from './reinitializeState'

import getNormalizedCommittedState from '../../normalize/getNormalizedCommittedState'
import getNormalizedDeletedState from '../../normalize/getNormalizedDeletedState'
import getNormalizedMergedState from '../../normalize/getNormalizedMergedState'
import { getDefaultCommitFrom } from '../../normalize/utils'


export const createDataReducer = (initialState = {}) => {
  const wrappedReducer = (state = initialState, action) => {
    const getCommitFrom = action.config.getCommitFrom || getDefaultCommitFrom

    if (action.type === ASSIGN_DATA) {
      return {
        ...state,
        ...action.patch
      }
    }

    if (action.type === COMMIT_DATA) {
      const { commits: nextCommits } = getNormalizedMergedState(
        state,
        { commits: action.commits },
        {
          getDatumIdKey: () => 'localIdentifier',
          getDatumIdValue: commit => commit.id || `${commit.uuid}/${commit.dateCreated}`,
          isMergingDatum: true
        }
      )
      return getNormalizedCommittedState(state,
                                         { commits: nextCommits },
                                         { getCommitFrom })
    }

    if (action.type === DELETE_DATA) {
      let patch = action.patch || state
      if (action.config.activityTags) {
        patch = getDeletedPatchByActivityTag(patch,
                                             action.config.activityTags)
      }
      return {
        ...state,
        ...getNormalizedDeletedState(state,
                                     patch,
                                     action.config)
      }
    }

    if (action.type === MERGE_DATA) {
      return {
        ...state,
        ...getNormalizedMergedState(state,
                                    action.patch,
                                    action.config)
      }
    }

    if (action.type === REINITIALIZE_DATA) {
      return reinitializeState(state,
                               initialState,
                               action.config)
    }

    if (action.type === 'persist/REHYDRATE' &&
      typeof action.payload !== 'undefined' &&
      typeof action.payload.commits !== 'undefined') {
      return getNormalizedCommittedState(state,
                                         action.payload,
                                         { getCommitFrom })
    }

    if (/SUCCESS_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      return {
        ...state,
        ...getSuccessState(state, action)
      }
    }

    return state
  }

  const reducer = (state, action) => {
    const getCommitFrom = action.config.getCommitFrom || getDefaultCommitFrom
    const nextState = wrappedReducer(state, action)
    if (state.commits !== nextState.commits) {
      return getNormalizedCommittedState(nextState,
                                        { commits: nextState.commits },
                                        { getCommitFrom })
    }
    return nextState
  }

  return reducer
}

export default createDataReducer
