import uniqBy from 'lodash.uniqby'

import { getDefaultDatumIdKey, getDefaultDatumIdValue } from '../normalize/utils'

export function getUnifiedDatum(datum, index, config) {
  const { apiPath } = config
  const activityTag = config.activityTag || apiPath
  const getDatumIdKey = config.getDatumIdKey || getDefaultDatumIdKey
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue

  let unifiedDatum = {
    [getDatumIdKey(datum)]: getDatumIdValue(datum, index),
    ...datum
  }

  if (activityTag) {
    if (!unifiedDatum.__ACTIVITIES__) {
      unifiedDatum.__ACTIVITIES__ = [activityTag]
    } else {
      unifiedDatum.__ACTIVITIES__.push(activityTag)
    }
  }

  return unifiedDatum
}

export function getUnifiedData(data, config) {
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue
  const unifyConfig = Object.assign({ data }, config)

  const unifiedData = data.map((datum, index) =>
    getUnifiedDatum(datum, index, unifyConfig))

  return uniqBy(unifiedData, getDatumIdValue)
}

export default getUnifiedData
