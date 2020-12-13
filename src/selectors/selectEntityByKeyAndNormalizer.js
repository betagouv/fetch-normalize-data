import createCachedSelector from 're-reselect'

const mapArgsToCacheKey = (state, key, normalizer) =>
  `${key || ''}${normalizer.stateKey || ''}${normalizer.datumKey || ''}`

export const selectEntityByKeyAndNormalizer = createCachedSelector(
  (state, key) => state.data[key],
  (state, key, normalizer) => normalizer.stateKey,
  (state, key, normalizer) => normalizer.datumKey,
  (entities, stateKey, datumKey) =>
    (entities || []).find(entity => {
      if (!entity.__normalizers__) return
      return entity.__normalizers__.find(normalizer =>
              normalizer.stateKey === stateKey &&
              normalizer.datumKey === datumKey)
    })
)(mapArgsToCacheKey)

export default selectEntityByKeyAndNormalizer
