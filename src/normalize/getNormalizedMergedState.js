import getMergedData from './getMergedData'
import getUnifiedData from './getUnifiedData'
import normalize from './normalize'

export function getNormalizedMergedState(state, patch, config = {}) {
  const isMergingArray =
    typeof config.isMergingArray === 'undefined' ? true : config.isMergingArray

  const nextState = config.nextState || {}

  if (!patch) return nextState

  Object.keys(patch).forEach(patchKey => {
    let data = patch[patchKey]
    if (!data) return

    let nextData = getUnifiedData(data, config)

    function doWithNormalizedPatch(normalizedPatch, normalizerConfig) {
      const subNormalizedMergedState = getNormalizedMergedState(
        state,
        normalizedPatch,
        { nextState, ...normalizerConfig }
      )
      Object.assign(nextState, subNormalizedMergedState)
    }

    normalize({ [patchKey]: nextData }, { doWithNormalizedPatch, ...config })

    if (isMergingArray) {
      const previousData = state[patchKey]
      nextData = getMergedData(nextData, previousData, config)
    }

    nextState[patchKey] = getMergedData(nextData, nextState[patchKey], config)
  })

  return nextState
}

export default getNormalizedMergedState
