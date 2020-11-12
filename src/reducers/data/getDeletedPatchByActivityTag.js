const getDeletedPatchByActivityTags = (patch, tags) => {
  const deletedPatch = {}
  Object.keys(patch).forEach(key => {
    const filteredEntities = patch[key].filter(
      entity =>
        entity.__TAGS__ &&
        entity.__TAGS__.length > 0 &&
        entity.__TAGS__.every(tag =>
          tags.includes(tag)
        )
    )
    deletedPatch[key] = filteredEntities
  })
  return deletedPatch
}

export default getDeletedPatchByActivityTags
