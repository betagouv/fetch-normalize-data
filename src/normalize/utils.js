import pluralize from 'pluralize'

export function getDefaultDatumIdKey() {
  return 'id'
}

export function getDefaultDatumIdValue(datum, index) {
  return datum.id || index
}

export function getDefaultActivityFrom() {
  return {}
}

export function hydratedActivityFrom(activity) {
  let stateKey = activity.stateKey
  if (!stateKey) {
    if (activity.tableName) {
      stateKey = pluralize(activity.tableName, 2)
    } else if (activity.modelName) {
      stateKey = pluralize(`${activity.modelName[0].toLowerCase()}${activity.modelName.slice(1)}`, 2)
    } else {
      console.warn(
        'Missing stateKey or tableName or modelName for that activity.'
      )
    }
  }
  return {
    ...activity,
    stateKey,
  }
}

export const merge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) {
      if (Array.isArray(source[key])) {
        target[key] = source[key].map((s, index) =>
          merge({...(target[key] && target[key][index])}, s))
      } else {
        target[key] = merge({ ...target[key] }, source[key])
      }
    } else {
      target[key] = source[key]
    }
  }
  return target
}
