import {
  getStateKeyFromConfig,
  successStatusCodesWithDataOrDatum
} from '../fetch'
import {
  getNormalizedDeletedState,
  getNormalizedMergedState
} from '../normalize'


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
  const { method, normalizer, status } = config

  const stateKey = getStateKeyFromConfig(config)

  if (!successStatusCodesWithDataOrDatum.includes(status)) {
    return Object.assign({}, state)
  }

  const patch = getPatchFromStateKeyAndPayload(stateKey, payload)

  const normalizerConfig = Object.assign({ normalizer }, config)
  if (normalizer) {
    normalizerConfig.normalizer = {
      [stateKey]: {
        normalizer,
        stateKey
      }
    }
  }

  const nextState = method === 'DELETE'
      ? getNormalizedDeletedState(state, patch, normalizerConfig)
      : getNormalizedMergedState(state, patch, normalizerConfig)

  return nextState
}

export default getSuccessState
