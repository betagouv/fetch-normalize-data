export function getReshapedNormalizer (normalizer) {
  const reshapedNormalizer = {}
  Object.keys(normalizer)
        .forEach(datumKey => {
          const stateKeyOrObj = normalizer[datumKey]
          reshapedNormalizer[datumKey] = {}

          if (typeof stateKeyOrObj !== 'string') {

            if (!stateKeyOrObj.normalizer) {
              throw Error(`Sub normalizer object does not exist in the normalizer object at ${datumKey}.`)
            }
            reshapedNormalizer[datumKey].normalizer = stateKeyOrObj.normalizer

            reshapedNormalizer[datumKey].stateKey = stateKeyOrObj.stateKey
              ? stateKeyOrObj.stateKey
              : datumKey

          } else {

            reshapedNormalizer[datumKey].stateKey = stateKeyOrObj

          }
        })

  return reshapedNormalizer
}

export default getReshapedNormalizer
