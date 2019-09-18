import getInit from "./getInit"
import getPayload from "./getPayload"

export async function fetchData(url, config = {}) {
  const fetchConfig = getInit(config)

  const result = await fetch(url, fetchConfig)

  const payload = await getPayload(result, fetchConfig)

  return payload
}

export default fetchData
