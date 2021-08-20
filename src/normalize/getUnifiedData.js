import uniqBy from 'lodash.uniqby'

export function getDefaultDatumIdKey() {
  return 'id'
}

export function getDefaultDatumIdValue(datum, index) {
  if (typeof datum.id !== 'undefined') return datum.id
  return index
}

export function getUnifiedDatum(datum, index, config) {
  const { apiPath } = config
  const tag = config.tag || apiPath
  const getDatumIdKey = config.getDatumIdKey || getDefaultDatumIdKey
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue

  let unifiedDatum = {
    [getDatumIdKey(datum)]: getDatumIdValue(datum, index),
    ...datum,
  }

  if (tag) {
    if (!unifiedDatum.__tags__) {
      unifiedDatum.__tags__ = [tag]
    } else {
      unifiedDatum.__tags__.push(tag)
    }
  }

  return unifiedDatum
}

export function getUnifiedData(data, config) {
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue
  const unifyConfig = Object.assign({ data }, config)

  const unifiedData = data.map((datum, index) =>
    getUnifiedDatum(datum, index, unifyConfig)
  )

  return uniqBy(unifiedData, getDatumIdValue)
}

export default getUnifiedData
