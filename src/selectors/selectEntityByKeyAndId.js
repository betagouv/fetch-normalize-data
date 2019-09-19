import createCachedSelector from 're-reselect'

const mapArgsToCacheKey = (state, key, id) => `${key || ''}${id || ''}`

export const selectEntityByKeyAndId = createCachedSelector(
  (state, key) => state.data[key],
  (state, key, id) => id,
  (entities, id) => entities.find(entity => entity.id === id)
)(mapArgsToCacheKey)

export default selectEntityByKeyAndId
