// no-param-reassign is done on purpose
/* eslint-disable no-param-reassign */
import getReshapedNormalizer from './getReshapedNormalizer'

// MUTATING FUNCTION
export function normalizeDataAtItem(data, datumKey, stateKey, config) {
  const { doWithNormalizedPatch } = config

  let normalizedData = []

  data.forEach(datum => {
    let normalizedValue = datum[datumKey]

    if (Array.isArray(normalizedValue)) {
      normalizedValue = normalizedValue.map(entity => ({
        ...entity,
        __normalizers__: [{ datumKey }],
      }))
      normalizedData = normalizedData.concat(normalizedValue)
    } else if (normalizedValue) {
      normalizedValue = {
        ...normalizedValue,
        __normalizers__: [{ datumKey }],
      }
      normalizedData.push(normalizedValue)
    }
    datum[datumKey] = { stateKey, type: '__normalizer__' }
  })

  if (normalizedData.length) {
    if (doWithNormalizedPatch) {
      const singletonPatch = { [stateKey]: normalizedData }
      doWithNormalizedPatch(singletonPatch, config)
    }
  }
}

// MUTATING FUNCTION
export function normalizeData(data, config) {
  const {
    cacheKey: globalCacheKey,
    isMergingDatum: globalIsMergingDatum,
    isMutatingDatum: globalIsMutatingDatum,
    normalizer,
  } = config

  const reshapedNormalizer = getReshapedNormalizer(normalizer)

  Object.keys(normalizer).forEach(datumKey => {
    const {
      cacheKey,
      isMergingDatum,
      isMutatingDatum,
      process,
      resolve,
      stateKey,
    } = reshapedNormalizer[datumKey]

    const subNormalizer = reshapedNormalizer[datumKey].normalizer || {}

    const subConfig = Object.assign({}, config, {
      cacheKey: typeof cacheKey !== 'undefined' ? cacheKey : globalCacheKey,
      isMergingDatum:
        typeof isMergingDatum !== 'undefined'
          ? isMergingDatum
          : globalIsMergingDatum,
      isMutatingDatum:
        typeof isMutatingDatum !== 'undefined'
          ? isMutatingDatum
          : globalIsMutatingDatum,
      normalizer: { [stateKey]: { normalizer: subNormalizer, stateKey } },
      process,
      resolve,
    })

    normalizeDataAtItem(data, datumKey, stateKey, subConfig)
  })
}

// MUTATING FUNCTION
export function normalize(obj, config) {
  const { normalizer } = config
  if (normalizer) {
    const reshapedNormalizer = getReshapedNormalizer(normalizer)

    Object.keys(reshapedNormalizer).forEach(datumKey => {
      const data = obj[datumKey]

      const subNormalizer = reshapedNormalizer[datumKey].normalizer
      if (!subNormalizer) {
        return
      }

      const subConfig = Object.assign({}, config, { normalizer: subNormalizer })

      normalizeData(data, subConfig)
    })
  }
}

export default normalize
