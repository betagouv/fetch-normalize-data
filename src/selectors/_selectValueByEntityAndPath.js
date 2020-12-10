import createCachedSelector from 're-reselect'

import selectEntityByActivityIdentifier from './selectEntityByActivityIdentifier'

const mapArgsToCacheKey = (state, entity, path) => `${(entity || {}).activityIdentifier ||
                                                      (entity || {}).id ||
                                                      ' '}
                                                    ${path || ' '}`

const valueFrom = (data, entity, path) => {
  if (path.includes('.')) {
    const chunks = path.split('.')
    const activityIdentifierKey = `${chunks[0]}ActivityIdentifier`
    const activityIdentifier= entity[activityIdentifierKey]
    if (!activityIdentifier) return
    const childEntity = selectEntityByActivityIdentifier({ data }, activityIdentifier)
    if (!childEntity) return
    return valueFrom(data, childEntity, chunks.slice(1).join('.'))
  }
  let value = entity[path]
  if (!value) {
    const activityIdentifierKey = `${path}ActivityIdentifier`
    const activityIdentifier = entity[activityIdentifierKey]
    if (!activityIdentifier) return
    value = selectEntityByActivityIdentifier({ data }, activityIdentifier)
  }
  return value
}


export const selectValueByEntityAndPath = createCachedSelector(
  state => state.data,
  (state, entity) => entity,
  (state, entity, path) => path,
  (data, entity, path) => entity && valueFrom(data, entity, path)
)(mapArgsToCacheKey)


export default selectValueByEntityAndPath
