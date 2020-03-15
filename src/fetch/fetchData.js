import { errorTimeoutStatusCode } from './status'
import getInit from './getInit'
import getPayload from './getPayload'

export async function fetchData(url, config = {}) {
  const { fetchTimeout } = config

  const fetchConfig = getInit(config)
  const fetchPromise = fetch(url, fetchConfig)

  let result
  if (fetchTimeout) {
    const timeoutPromise = new Promise(resolve =>
      setTimeout(() => {
        const response = new Response()
        response.ok = false
        response.status = errorTimeoutStatusCode
        resolve(response)
      }, fetchTimeout)
    )
    result = await Promise.race([timeoutPromise, fetchPromise])
  } else {
    result = await fetchPromise
  }

  const payload = await getPayload(result, fetchConfig)

  return payload
}

export default fetchData
