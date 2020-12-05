import createCachedSelector from 're-reselect'

const mapArgsToCacheKey = (state, key, join) =>
  `${key || ''}${join.key || ''}${join.value || ''}`

export const selectEntityByKeyAndJoin = createCachedSelector(
  (state, key) => state.data[key],
  (state, key, join) => join.key,
  (state, key, join) => join.value,
  (entities, key, value) =>
    (entities || []).find(entity => {
      const entityValue = Array.isArray(key)
        ? key.reduce((subObj, subKey) => (subObj || {})[subKey], entity)
        : entity[key]
      return entityValue === value
    })
)(mapArgsToCacheKey)

export default selectEntityByKeyAndJoin
