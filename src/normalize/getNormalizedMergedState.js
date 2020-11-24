import getMergedData from './getMergedData'
import getUnifiedData from './getUnifiedData'
import normalize from './normalize'

export function getNormalizedMergedState(state, patch, config = {}) {
  const isMergingArray =
    typeof config.isMergingArray === 'undefined' ? true : config.isMergingArray

  const nextState = config.nextState || {}

  if (!patch) return state

  Object.keys(patch).forEach(patchKey => {
    let data = patch[patchKey]
    if (!data) return

    let nextData = getUnifiedData(data, config)

    function doWithNormalizedPatch(normalizedPatch, normalizerConfig) {
      const subNormalizedMergedState = getNormalizedMergedState(
        state,
        normalizedPatch,
        Object.assign({ nextState }, normalizerConfig)
      )
      Object.assign(nextState, subNormalizedMergedState)
    }
    const normalizeConfig = Object.assign({ doWithNormalizedPatch }, config)
    normalize({ [patchKey]: nextData }, normalizeConfig)

    if (isMergingArray) {
      const previousData = state[patchKey]
      nextData = getMergedData(nextData, previousData, config)
    }

    nextState[patchKey] = nextData
  })

  return nextState
}

export default getNormalizedMergedState
