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

  data = data.map(datum => ({
    __remote__: datum,
    ...datum,
  }))

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

  const normalizerConfig = Object.assign({ normalizer }, config)
  if (normalizer) {
    normalizerConfig.normalizer = {
      [stateKey]: {
        normalizer,
        stateKey,
      },
    }
  }

  if (method === 'DELETE') {
    return getNormalizedDeletedState(state, patch, normalizerConfig)
  }

  const nextState = getNormalizedMergedState(state, patch, normalizerConfig)

  return nextState
}

export default getSuccessState