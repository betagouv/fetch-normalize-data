import createCachedSelector from "re-reselect"

const mapArgsToCacheKey = (state, key, id) => `${key || ""}${id || ""}`

export const selectEntitiesByKeyAndJoinKeyAndJoinId = createCachedSelector(
  (state, key) => state.data[key],
  (state, key, joinKey) => joinKey,
  (state, key, joinKey, joinId) => joinId,
  (entities, joinKey, joinId) =>
    entities.filter(entity => entity[joinKey] === joinId)
)(mapArgsToCacheKey)

export default selectEntitiesByKeyAndJoinKeyAndJoinId
