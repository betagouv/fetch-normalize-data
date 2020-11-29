export function getDefaultDatumIdKey() {
  return 'id'
}

export function getDefaultDatumIdValue(datum, index) {
  return datum.id || index
}

export function getDefaultActivityFrom() {
  return {}
}

export const merge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) {
      target[key] = merge({ ...target[key] }, source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}
