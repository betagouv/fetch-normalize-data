import {
  handleApiError,
  handleResultError,
  handleServerError
} from './errors'
import { fetchData } from './fetchData'
import { getConfigWithDefaultValues } from './getConfigWithDefaultValues'
import { getUrlFromConfig } from './getUrlFromConfig'
import { handleApiSuccess } from './handleApiSuccess'
import { isSuccessStatus } from './status'
import { failData, successData } from '../normalize'

export async function fetchToSuccessOrFailData(
  reducer,
  configWithoutDefaultValues
) {
  const config = getConfigWithDefaultValues(configWithoutDefaultValues)

  const url = getUrlFromConfig(config)

  const fetchDataMethod = config.fetchData || fetchData

  try {

    const fetchResult = await fetchDataMethod(url, config)

    if (!fetchResult) {
      handleResultError(reducer, config)
    }

    const { ok, payload, status } = fetchResult
    Object.assign(config, { ok, status })

    const isSuccess = isSuccessStatus(status)
    if (isSuccess) {
      handleApiSuccess(reducer, payload, config)
      return
    }

    if (payload.errors) {
      handleApiError(reducer, payload, config)
    }

  } catch (error) {
    Object.assign(config, { ok: false, status: 500 })
    
    handleServerError(reducer, error, config)
  }
}

export default fetchToSuccessOrFailData
