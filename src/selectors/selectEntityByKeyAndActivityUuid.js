import createCachedSelector from 're-reselect'

const mapArgsToCacheKey = (state, activityUuid) => activityUuid

export default createCachedSelector(
  (state, key) => state.data[key],
  (state, key, activityUuid) => activityUuid,
  (entities, activityUuid) =>
    (entities || []).find(entity => entity.activityUuid === activityUuid)
)(mapArgsToCacheKey)
