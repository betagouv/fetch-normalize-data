import { errorTimeoutStatusCode } from './errors/error_codes'
import getInit from './getInit'
import getPayload from './getPayload'

export async function fetchData(url, config = {}) {
  const { fetchTimeout } = config

  const fetchConfig = getInit(config)
  const fetchPromise = fetch(url, fetchConfig)

  let result
  if (fetchTimeout) {
    const timeoutPromise = new Promise(resolve => setTimeout(
        () => resolve({
          ok: false,
          status: errorTimeoutStatusCode
        })), fetchTimeout)
    result = await Promise.race([fetchPromise, timeoutPromise])
  } else {
    result = await fetchPromise()
  }

  const payload = await getPayload(result, fetchConfig)

  return payload
}

export default fetchData
