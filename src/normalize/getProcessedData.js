import uniqBy from "lodash.uniqby"

import { getDefaultDatumIdKey, getDefaultDatumIdValue } from "./utils"

export function getProcessedDatum(datum, index, config) {
  const { apiPath, data, resolve, tag } = config
  const getDatumIdKey = config.getDatumIdKey || getDefaultDatumIdKey
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue

  let processedDatum = Object.assign(
    { [getDatumIdKey(datum)]: getDatumIdValue(datum, index) },
    datum
  )

  if (apiPath) {
    const now = new Date(Date.now()).toISOString()
    if (!processedDatum.__ACTIVITIES__) {
      processedDatum.__ACTIVITIES__ = [
        {
          apiPath,
          createdAt: now,
          tag
        }
      ]
    } else {
      processedDatum.__ACTIVITIES__.push({
        apiPath,
        modifiedAt: now,
        tag
      })
    }
  }

  if (resolve) {
    processedDatum = config.resolve(processedDatum, data, config)
  }

  return processedDatum
}

export function getProcessedData(data, config) {
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue
  const unifyConfig = Object.assign({ data }, config)

  const processedData = data.map((datum, index) =>
    getProcessedDatum(datum, index, unifyConfig)
  )

  return uniqBy(processedData, getDatumIdValue)
}

export default getProcessedData
