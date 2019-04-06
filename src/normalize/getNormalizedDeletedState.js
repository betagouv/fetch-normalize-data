import { getClonedResolvedDataWithUniqIds } from './getClonedResolvedDataWithUniqIds'
import { getDefaultDatumIdValue } from './utils'

export function getNormalizedDeletedState (state, patch, config) {
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue
  const nextState = config.nextState || {}

  Object.keys(patch).forEach(patchKey => {

    // SKIP
    const data = patch[patchKey]
    if (!data) {
      return
    }

    // CLONE RESOLVE UNIQFY
    const nextData = getClonedResolvedDataWithUniqIds(data, config)

    // SKIP
    const previousData = state[patchKey]
    if (!previousData) {
      nextState[patchKey] = nextData
      return
    }

    // DELETE
    const nextDataIds = nextData.map(getDatumIdValue)
    const resolvedData = previousData.filter(
      previousDatum => !nextDataIds.includes(getDatumIdValue(previousDatum))
    )
    nextState[patchKey] = resolvedData
  })

  return nextState
}

export default getNormalizedDeletedState
