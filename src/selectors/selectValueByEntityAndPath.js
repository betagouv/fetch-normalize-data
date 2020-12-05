import pluralize from 'pluralize'
import createCachedSelector from 're-reselect'

import selectEntityByKeyAndActivityUuid from './selectEntityByKeyAndActivityUuid'
import selectEntityByKeyAndJoin from './selectEntityByKeyAndJoin'

const mapArgsToCacheKey = (state, key, id, path) => `${key || ' '} ${id || ' '} ${path || ' '}`


const valueFrom = (data, entity, path) => {
  if (path.includes('.')) {
    const chunks = path.split('.')
    const activityUuidKey = `${chunks[0]}ActivityUuid`
    const activityUuid= entity[activityUuidKey]
    const { modelName } = selectEntityByKeyAndJoin({ data },
                                                   'activities',
                                                   { key: 'uuid', value: activityUuid }) || {}
    if (!modelName) return
    const stateKey = pluralize(modelName.toLowerCase(), 2)
    const childEntity = selectEntityByKeyAndActivityUuid({ data }, stateKey, activityUuid)
    if (!childEntity) return
    return valueFrom(data, childEntity, chunks.slice(1).join('.'))
  }
  let value = entity[path]
  if (!value) {
    const activityUuidKey = `${path}ActivityUuid`
    const activityUuid = entity[activityUuidKey]
    const { modelName } = selectEntityByKeyAndJoin({ data },
                                                   'activities',
                                                   { key: 'uuid', value: activityUuid }) || {}
    if (modelName) {
      const stateKey = pluralize(modelName.toLowerCase(), 2)
      value = selectEntityByKeyAndActivityUuid({ data }, stateKey, activityUuid)
    }
  }
  return value
}


export default createCachedSelector(
  state => state.data,
  (state, entity) => entity,
  (state, entity, path) => path,
  (data, entity, path) => entity && valueFrom(data, entity, path)
)(mapArgsToCacheKey)
