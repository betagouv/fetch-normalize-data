export function getReshapedNormalizer(normalizer) {
  const reshapedNormalizer = {}
  Object.keys(normalizer).forEach(datumKey => {
    const stateKeyOrObj = normalizer[datumKey]
    reshapedNormalizer[datumKey] = {}

    if (typeof stateKeyOrObj !== "string") {
      reshapedNormalizer[datumKey].apiPath = stateKeyOrObj.apiPath
      reshapedNormalizer[datumKey].method = stateKeyOrObj.method

      reshapedNormalizer[datumKey].normalizer = stateKeyOrObj.normalizer

      reshapedNormalizer[datumKey].isMergingArray = stateKeyOrObj.isMergingArray
      reshapedNormalizer[datumKey].isMutatingDatum =
        stateKeyOrObj.isMutatingDatum
      reshapedNormalizer[datumKey].isMergingDatum = stateKeyOrObj.isMergingDatum
      reshapedNormalizer[datumKey].isMutatingDatum =
        stateKeyOrObj.isMutatingDatum

      reshapedNormalizer[datumKey].resolve = stateKeyOrObj.resolve

      reshapedNormalizer[datumKey].stateKey = stateKeyOrObj.stateKey
        ? stateKeyOrObj.stateKey
        : datumKey

      reshapedNormalizer[datumKey].tag = stateKeyOrObj.tag
    } else {
      reshapedNormalizer[datumKey].stateKey = stateKeyOrObj
    }
  })

  return reshapedNormalizer
}

export default getReshapedNormalizer
