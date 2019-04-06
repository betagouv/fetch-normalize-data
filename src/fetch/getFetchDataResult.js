import {
  successStatusCodesWithDataOrDatum,
  successStatusCodesWithoutDataAndDatum
} from './status'

export async function getFetchDataResult (fetchResult) {
  const { ok, status } = fetchResult
  const fetchDataResult = {
    ok,
    payload: {},
    status,
  }

  if (successStatusCodesWithDataOrDatum.includes(status)) {

    if (window.cordova) {
      window.cordova.plugins.CookieManagementPlugin.flush()
    }

    // warn
    if (!fetchResult.json) {
      console.warn(
        `fetch is a success but expected a json format for the fetchResult of ${url}`
      )
      fetchDataResult.payload.errors = [
        {
          global: ['Le serveur ne renvoit pas de la donnée au bon format'],
        },
      ]
      return fetchDataResult
    }

    const dataOrDatum = await fetchResult.json()
    if (Array.isArray(dataOrDatum)) {
      fetchDataResult.payload.data = dataOrDatum
    } else if (typeof dataOrDatum === 'object') {
      fetchDataResult.payload.datum = dataOrDatum
    }

    return fetchDataResult
  }

  if (successStatusCodesWithoutDataAndDatum.includes(status)) {
    return fetchDataResult
  }

  if (!fetchResult.json) {
    console.warn(
      `fetch returns ${status} but we still expected a json format for the fetchResult of ${url}`
    )
    fetchDataResult.payload.errors = [
      {
        global: ['Le serveur ne renvoit pas de la donnée au bon format'],
      },
    ]
    return fetchDataResult
  }

  fetchDataResult.payload.errors = await fetchResult.json()
  return fetchDataResult
}

export default getFetchDataResult
