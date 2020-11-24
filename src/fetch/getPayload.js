import getProcessedData from './getProcessedData'
import {
  errorTimeoutStatusCode,
  successStatusCodesWithDataOrDatum,
  successStatusCodesWithoutDataAndDatum,
} from './status'

export const GLOBAL_RESULT_ERROR =
  'Result returned by the server is not at the good json format'

export const TIMEOUT_RESULT_ERROR =
  'Server did not respond within the specified timeout interval'

export async function getPayload(result, config) {
  const globalResultError = config.globalResultError || GLOBAL_RESULT_ERROR
  const timeoutResultError = config.timeoutResultError || TIMEOUT_RESULT_ERROR
  const { ok, status } = result
  const headers = {}
  result.headers.forEach((value, key) => {
    headers[key] = value
  })

  const payload = { headers, ok, status }

  if (errorTimeoutStatusCode === status) {
    payload.errors = [
      {
        global: [globalResultError],
      },
      {
        timeout: [timeoutResultError],
      },
    ]
    return payload
  }

  if (successStatusCodesWithDataOrDatum.includes(status)) {
    if (!result.json) {
      payload.errors = [
        {
          global: [globalResultError],
        },
      ]
      return payload
    }

    const dataOrDatum = await result.json()
    const isArray = Array.isArray(dataOrDatum)
    const data = isArray ? dataOrDatum : [dataOrDatum]
    const processedData = await getProcessedData(data, config)
    const payloadKey = isArray ? 'data' : 'datum'
    payload[payloadKey] = isArray ? processedData : processedData[0]

    return payload
  }

  if (successStatusCodesWithoutDataAndDatum.includes(status)) {
    return payload
  }

  if (!result.json) {
    payload.errors = [
      {
        global: [globalResultError],
      },
    ]
    return payload
  }

  payload.errors = await result.json()
  return payload
}

export default getPayload
