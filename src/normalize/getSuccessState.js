import getStateKeyFromConfig from '../fetch/stateKey/getStateKeyFromConfig'
import { successStatusCodesWithDataOrDatum } from '../fetch/status'
import getNormalizedDeletedState from './getNormalizedDeletedState'
import getNormalizedMergedState from './getNormalizedMergedState'

export function getPatchFromStateKeyAndPayload(stateKey, payload) {
  const { datum } = payload
  let { data } = payload
  if (!data) {
    if (datum) {
      data = [datum]
    } else {
      data = []
    }
  }

  const patch = { [stateKey]: data }

  return patch
}

export const getSuccessState = (state, action) => {
  const { config, payload } = action
  const { status } = payload
  const { method, normalizer } = config

  const stateKey = getStateKeyFromConfig(config)

  if (!stateKey || !successStatusCodesWithDataOrDatum.includes(status))
    return {}

  const patch = getPatchFromStateKeyAndPayload(stateKey, payload)

  const deleteOrMergeConfig = Object.assign(
    {
      cacheKey: '__remote__',
      normalizer,
    },
    config
  )

  if (normalizer) {
    deleteOrMergeConfig.normalizer = {
      [stateKey]: {
        normalizer,
        stateKey,
      },
    }
  }

  if (method === 'DELETE') {
    return getNormalizedDeletedState(state, patch, deleteOrMergeConfig)
  }

  const nextState = getNormalizedMergedState(state, patch, deleteOrMergeConfig)

  return nextState
}

export default getSuccessState
