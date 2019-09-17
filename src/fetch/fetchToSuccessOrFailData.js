import { handleApiError, handleServerError } from "./errors"
import { fetchData } from "./fetchData"
import getConfigWithDefaultValues from "./getConfigWithDefaultValues"
import getUrlFromConfig from "./getUrlFromConfig"
import handleApiSuccess from "./handleApiSuccess"
import { isSuccessStatus } from "./status"

export async function fetchToSuccessOrFailData(
  reducer,
  configWithoutDefaultValues
) {
  const config = getConfigWithDefaultValues(configWithoutDefaultValues)

  const url = getUrlFromConfig(config)

  const fetchDataMethod = config.fetchData || fetchData

  try {
    const result = await fetchDataMethod(url, config)

    const isSuccess = isSuccessStatus(result.status)
    if (isSuccess) {
      handleApiSuccess(reducer, result, config)
      return
    }

    if (result.payload.errors) {
      handleApiError(reducer, result, config)
    }
  } catch (error) {
    handleServerError(reducer, error, config)
  }
}

export default fetchToSuccessOrFailData
