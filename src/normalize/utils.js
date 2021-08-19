export function getDefaultDatumIdKey() {
  return 'id'
}

export function getDefaultDatumIdValue(datum, index) {
  if (typeof datum.id !== 'undefined') return datum.id
  return index
}

export const merge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) {
      if (Array.isArray(source[key])) {
        if (source[key][0]) {
          if (
            !(source[key][0] instanceof Object) ||
            Array.isArray(source[key][0])
          ) {
            target[key] = source[key]
            continue
          }
        }
        target[key] = source[key].map((s, index) =>
          merge({ ...(target[key] && target[key][index]) }, s)
        )
      } else {
        target[key] = merge({ ...target[key] }, source[key])
      }
    } else {
      target[key] = source[key]
    }
  }
  return target
}

export const entitiesByActivityIdentifierFrom = (state, activities) => {
  const entitiesByActivityIdentifier = {}
  activities.forEach(activity => {
    const stateKey = activity.stateKey
    const entity = (state[stateKey] || []).find(
      e => e.activityIdentifier === activity.entityIdentifier
    )
    if (entity) {
      entitiesByActivityIdentifier[activity.entityIdentifier] = entity
    }
  })
  return entitiesByActivityIdentifier
}

export const dateCreatedAndModifiedsByEntityIdentifierFrom = (
  state,
  activities,
  entitiesByActivityIdentifier
) => {
  const entityDateCreatedsByIdentifier = {}
  const entityDateModifiedsByIdentifier = {}

  activities.forEach(activity => {
    const entity = entitiesByActivityIdentifier[activity.entityIdentifier]
    if (
      typeof entityDateCreatedsByIdentifier[activity.entityIdentifier] ===
      'undefined'
    ) {
      if (entity) {
        entityDateCreatedsByIdentifier[activity.entityIdentifier] =
          entity.dateCreated
      } else {
        entityDateCreatedsByIdentifier[activity.entityIdentifier] =
          activity.dateCreated
        return
      }
    }

    if (
      entityDateCreatedsByIdentifier[activity.entityIdentifier] !==
      activity.dateCreated
    ) {
      if (
        !entity ||
        !entity.dateModified ||
        new Date(activity.dateCreated) >= new Date(entity.dateModified)
      ) {
        entityDateModifiedsByIdentifier[activity.entityIdentifier] =
          activity.dateCreated
      } else {
        entityDateModifiedsByIdentifier[activity.entityIdentifier] =
          entity.dateModified
      }
    }
  })

  return {
    entityDateCreatedsByIdentifier,
    entityDateModifiedsByIdentifier,
  }
}
