import createCachedSelector from 're-reselect'

function mapArgsToCacheKey(state, key, tags, strictness) {
  return `${key} ${tags.map(tag => tag).join(' ')} ${strictness}`
}

export default createCachedSelector(
  (state, key) => state.data[key],
  (state, key, tags) => tags,
  (state, key, strictness = 'equal') => strictness,
  (entities, tags, strictness) => {
    if (!entities) return
    const tagsLength = tags.length
    return entities.filter(entity => {
      if (strictness === 'equal' && tagsLength !== entity.__tags__.length) {
        return false
      }
      return tags.every(tag => entity.__tags__.includes(tag))
    })
  }
)(mapArgsToCacheKey)
