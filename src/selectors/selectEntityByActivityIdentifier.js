import pluralize from 'pluralize'
import createCachedSelector from 're-reselect'

import selectEntityByKeyAndJoin from './selectEntityByKeyAndJoin'

const mapArgsToCacheKey = (state, activityIdentifier) => activityIdentifier || ' '

export default createCachedSelector(
  state => state.data,
  (state, activityIdentifier) => activityIdentifier,
  (data, activityIdentifier) => {
    const __ACTIVITIES__ = data.__ACTIVITIES__
    const firstActivity = selectEntityByKeyAndJoin({ data: { __ACTIVITIES__ } },
                                                   '__ACTIVITIES__',
                                                   { key: 'identifier', value: activityIdentifier })
    if (firstActivity) {
      const key = pluralize(firstActivity.modelName.toLowerCase())
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
