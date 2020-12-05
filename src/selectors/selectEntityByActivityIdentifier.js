import pluralize from 'pluralize'
import createCachedSelector from 're-reselect'

import selectEntityByKeyAndJoin from './selectEntityByKeyAndJoin'

const mapArgsToCacheKey = (state, activityIdentifier) => activityIdentifier || ' '

export default createCachedSelector(
  state => state.data,
  (state, activityIdentifier) => activityIdentifier,
  (data, activityIdentifier) => {
    const __activities__ = data.__activities__
    const firstActivity = selectEntityByKeyAndJoin({ data: { __activities__ } },
                                                   '__activities__',
                                                   { key: 'identifier', value: activityIdentifier })
    if (firstActivity && firstActivity.modelName) {
      const key = pluralize(`${firstActivity.modelName[0].toLowerCase()}${firstActivity.modelName.slice(1)}`)
      return selectEntityByKeyAndJoin({ data: { [key]: data[key] } },
                                      key,
                                      { key: 'activityIdentifier', value: activityIdentifier })
    }

    let entityFoundByBruteSearch
    Object.keys(data).find(key => {
        entityFoundByBruteSearch = selectEntityByKeyAndJoin({ data: { [key]: data[key] } },
                                                            key,
                                                            { key: 'activityIdentifier', value: activityIdentifier })
        return entityFoundByBruteSearch
    })
    return entityFoundByBruteSearch
  }
)(mapArgsToCacheKey)
