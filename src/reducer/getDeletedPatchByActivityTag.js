const getDeletedPatchByActivityTags = (patch, tags) => {
  const deletedPatch = {}
  Object.keys(patch).forEach(key => {
    const filteredEntities = patch[key].filter(
      entity =>
        entity.__ACTIVITIES__ &&
        entity.__ACTIVITIES__.length > 0 &&
        entity.__ACTIVITIES__.every(activity => tags.includes(activity.tag))
    )
    deletedPatch[key] = filteredEntities
  })
  return deletedPatch
}

export default getDeletedPatchByActivityTags
