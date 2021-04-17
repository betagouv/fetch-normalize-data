import getNormalizedMergedState from './getNormalizedMergedState'
import { localIdentifierFrom } from './utils'

export function getNormalizedSuccessActivitiesAskedState(state, action) {
  let nextState = { ...state }
  action.payload.data.forEach(payloadActivity => {
    const payloadLocalIdentifier = localIdentifierFrom(payloadActivity)
    const storedActivities = []
    const otherActivities = []
    if (state.__activities__) {
      state.__activities__.forEach(activity => {
        if (payloadLocalIdentifier === activity.localIdentifier) {
          storedActivities.push(activity)
        } else {
          otherActivities.push(activity)
        }
      })
    }
    if (storedActivities.length > 1) {
      console.warn('Weird...')
    } else if (storedActivities.length) {
      const patch = {
        [storedActivities[0].localStateKey]: [payloadActivity.entity],
      }
      nextState = {
        ...nextState,
        ...getNormalizedMergedState(nextState, patch, action.config),
        __activities__: otherActivities,
      }
    }
  })
  return nextState
}

export default getNormalizedSuccessActivitiesAskedState
