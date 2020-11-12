import uniqBy from 'lodash.uniqby'

import { getDefaultDatumIdKey, getDefaultDatumIdValue } from '../normalize/utils'

export function getUnifiedDatum(datum, index, config) {
  const { apiPath } = config
  const tag = config.tag || apiPath
  const getDatumIdKey = config.getDatumIdKey || getDefaultDatumIdKey
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue

  let unifiedDatum = {
    [getDatumIdKey(datum)]: getDatumIdValue(datum, index),
    ...datum
  }

  if (tag) {
    if (!unifiedDatum.__TAGS__) {
      unifiedDatum.__TAGS__ = [tag]
    } else {
      unifiedDatum.__TAGS__.push(tag)
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
