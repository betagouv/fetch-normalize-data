import {
  successStatusCodesWithDataOrDatum,
  successStatusCodesWithoutDataAndDatum
} from "./status"

export const GLOBAL_RESULT_ERROR =
  "Result returned by the server is not at the good json format"

export async function getFetchDataResult(fetchResult, config) {
  const globalResultError = config.globalResultError || GLOBAL_RESULT_ERROR
  const { ok, status } = fetchResult

  const headers = {}
  fetchResult.headers.forEach((value, key) => {
    headers[key] = value
  })

  const fetchDataResult = {
    headers,
    ok,
    payload: {},
    status
  }

  if (successStatusCodesWithDataOrDatum.includes(status)) {
    if (!fetchResult.json) {
      fetchDataResult.payload.errors = [
        {
          global: [globalResultError]
        }
      ]
      return fetchDataResult
    }

    const dataOrDatum = await fetchResult.json()
    if (Array.isArray(dataOrDatum)) {
      fetchDataResult.payload.data = dataOrDatum
    } else if (typeof dataOrDatum === "object") {
      fetchDataResult.payload.datum = dataOrDatum
    }

    return fetchDataResult
  }

  if (successStatusCodesWithoutDataAndDatum.includes(status)) {
    return fetchDataResult
  }

  if (!fetchResult.json) {
    fetchDataResult.payload.errors = [
      {
        global: [globalResultError]
      }
    ]
    return fetchDataResult
  }

  fetchDataResult.payload.errors = await fetchResult.json()
  return fetchDataResult
}

export default getFetchDataResult
