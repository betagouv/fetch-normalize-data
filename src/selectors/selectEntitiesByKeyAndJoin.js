import createCachedSelector from 're-reselect'

const mapArgsToCacheKey = (state, key, join) =>
  `${key || ''}${join.key || ''}${join.value || ''}`

export const selectEntitiesByKeyAndJoin = createCachedSelector(
  (state, key) => state.data[key],
  (state, key, join) => join.key,
  (state, key, join) => join.value,
  (entities, key, value) => entities.filter(entity => entity[key] === value)
)(mapArgsToCacheKey)

export default selectEntitiesByKeyAndJoin
