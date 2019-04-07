import { getFetchConfig } from './getFetchConfig'
import { getFetchDataResult } from './getFetchDataResult'

export async function fetchData(url, config = {}) {

  const fetchConfig = getFetchConfig(config)

  const fetchResult = await fetch(url, fetchConfig)

  const fetchDataResult = await getFetchDataResult(fetchResult)

  return fetchDataResult
}

export default fetchData
