// no-param-reassign is done on purpose
/* eslint-disable no-param-reassign */
import { getReshapedNormalizer } from './getReshapedNormalizer'

// MUTATING FUNCTION
export function normalizeDataAtItem (data, datumKey, stateKey, config) {
  const { doWithNormalizedPatch } = config

  let normalizedData = []

  data.forEach(datum => {

    const normalizedValue = datum[datumKey]

    if (Array.isArray(normalizedValue)) {

      normalizedData = normalizedData.concat(normalizedValue)
      delete datum[datumKey]

    } else if (normalizedValue) {

      normalizedData.push(datum[datumKey])
      delete datum[datumKey]

    }
  })

  if (normalizedData.length) {
    if (doWithNormalizedPatch) {
      const singletonPatch = { [stateKey]: normalizedData }
      doWithNormalizedPatch(singletonPatch, config)
    }
  }
}

// MUTATING FUNCTION
export function normalizeData (data, config) {
  const { isMergingDatum, isMutatingDatum, normalizer } = config

  const reshapedNormalizer = getReshapedNormalizer(normalizer)

  Object.keys(normalizer)
        .forEach(datumKey => {
          const { stateKey } = reshapedNormalizer[datumKey]
          const subNormalizer = reshapedNormalizer[datumKey].normalizer || {}

          const subConfig = Object.assign(
            {},
            config,
            {
              isMergingDatum:
                typeof subNormalizer.isMergingDatum !== 'undefined'
                  ? subNormalizer.isMergingDatum
                  : isMergingDatum,
              isMutatingDatum:
                typeof subNormalizer.isMutatingDatum !== 'undefined'
                  ? subNormalizer.isMutatingDatum
                  : isMutatingDatum,
              normalizer: { [stateKey]: { normalizer: subNormalizer, stateKey } }
            }
          )

          normalizeDataAtItem(data, datumKey, stateKey, subConfig)

        })
}

// MUTATING FUNCTION
export function normalize (obj, config) {
  const { normalizer } = config
  if (normalizer) {

    const reshapedNormalizer = getReshapedNormalizer(normalizer)

    Object.keys(reshapedNormalizer).forEach(datumKey => {

      const data = obj[datumKey]

      const subNormalizer = reshapedNormalizer[datumKey].normalizer
      if (!subNormalizer) {
        return
      }

      const subConfig = Object.assign(
        {},
        config,
        { normalizer: subNormalizer }
      )

      normalizeData(data, subConfig)
    })

  }
}

export default normalize
