import createCachedSelector from 're-reselect'

import selectEntityByActivityIdentifier from './selectEntityByActivityIdentifier'
import selectEntityByKeyAndId from './selectEntityByKeyAndId'
// import selectEntityByKeyAndNormalizer from './selectEntityByKeyAndNormalizer'


const mapArgsToCacheKey = (state, walk) =>
  `${walk.topActivityIdentifier || ''}${walk.topKey || ''}${walk.topId || ''}${walk.path || ''}`


const entityFrom = (data, entity, key,
                    //config={}
                  ) => {
  // const { parentKey } = config
  const normalizer = entity[key]
  const stateKey = (normalizer || {}).type === '__normalizer__' &&
                   (normalizer || {}).stateKey
  if (!stateKey) return
  let childEntity
  const idKey = `${key}Id`
  const id = entity[idKey]
  if (id) {
    childEntity = selectEntityByKeyAndId({ data }, stateKey, id)
  }
  if (!childEntity) {
    const activityIdentifierKey = `${key}ActivityIdentifier`
    const activityIdentifier = entity[activityIdentifierKey]
    if (activityIdentifier) {
      childEntity = selectEntityByActivityIdentifier({ data }, activityIdentifier)
    }
  }
  if(!childEntity) {
    /*TODO*/
    //childEntity = selectEntityByKeyAndNormalizer({ data },
    //                                             stateKey,
    //                                             { datumKey: key, stateKey: parentKey })
  }
  return childEntity
}


const valueFrom = (data, entity, path, config={}) => {
  if (path.includes('.')) {
    const chunks = path.split('.')
    const key = chunks[0]
    const childEntity = entityFrom(data, entity, key, config)
    if (childEntity) {
      return valueFrom(data,
                       childEntity,
                       chunks.slice(1).join('.'),
                       { parentKey: childEntity.__parent__})
    }
  }
  let value = entity[path]
  if (!value) {
    value = entityFrom(data, entity, path)
  }
  return value
}


export const selectValueByWalk = createCachedSelector(
  state => state.data,
  (state, walk) => walk.topActivityIdentifier,
  (state, walk) => walk.topKey,
  (state, walk) => walk.topId,
  (state, walk) => walk.path,
  (data, topActivityIdentifier, topKey, topId, path) => {
    const entity = topActivityIdentifier
      ? selectEntityByActivityIdentifier({ data }, topActivityIdentifier)
      : selectEntityByKeyAndId({ data }, topKey, topId)
    if (entity) {
      return valueFrom(data, entity, path, { parentKey: topKey })
    }
  }
)(mapArgsToCacheKey)


export default selectValueByWalk
