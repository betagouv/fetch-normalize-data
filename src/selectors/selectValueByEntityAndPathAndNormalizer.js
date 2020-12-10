import createCachedSelector from 're-reselect'

import getReshapedNormalizer from '../normalize/getReshapedNormalizer'

import selectEntityByKeyAndId from './selectEntityByKeyAndId'

const mapArgsToCacheKey = (state, entity, path) => `${(entity || {}).activityIdentifier ||
                                                      (entity || {}).id ||
                                                      ' '}
                                                    ${path || ' '}`


const valueFrom = (data, entity, path, normalizer) => {
  if (path.includes('.')) {
    const chunks = path.split('.')
    const key = chunks[0]
    const stateKey = normalizer[key].stateKey
    const idKey = `${key}Id`
    const id = entity[idKey]
    const childEntity = selectEntityByKeyAndId({ data },
                                               stateKey,
                                               id)
    if (!childEntity) return
    return valueFrom(data,
                     childEntity,
                     chunks.slice(1).join('.'),
                     getReshapedNormalizer(normalizer[key].normalizer || {}))
  }
  let value = entity[path]
  if (!value) {
    const stateKey = normalizer[path].stateKey
    const idKey = `${path}Id`
    const id = entity[idKey]
    value = selectEntityByKeyAndId({ data },
                                   stateKey,
                                   id)
  }
  return value
}


export const selectValueByEntityAndPath = createCachedSelector(
  state => state.data,
  (state, entity) => entity,
  (state, entity, path) => path,
  (state, entity, path, normalizer) => normalizer,
  (data, entity, path, normalizer) => entity && valueFrom(data,
                                              entity,
                                              path,
                                              getReshapedNormalizer(normalizer))
)(mapArgsToCacheKey)


export default selectValueByEntityAndPath
