export function getDeletedPatchByActivityTags(patch, tags) {
  const deletedPatch = {}
  Object.keys(patch).forEach(key => {
    const filteredEntities = patch[key].filter(
      entity =>
        entity.__tags__ &&
        entity.__tags__.length > 0 &&
        entity.__tags__.every(tag =>
          tags.includes(tag)
        )
    )
    deletedPatch[key] = filteredEntities
  })
  return deletedPatch
}

export default getDeletedPatchByActivityTags
