import { fetchData } from './fetchData'
import { getConfigWithDefaultValues } from './getConfigWithDefaultValues'
import { getUrlFromConfig } from './getUrlFromConfig'
import { isSuccessStatus } from './status'
import { failData, successData } from '../normalize'

export async function fetchToSuccessOrFailData(
  reducer,
  configWithoutDefaultValues
) {
  const [data, dispatch] = reducer
  const state = { data }
  const config = getConfigWithDefaultValues(configWithoutDefaultValues)
  const { handleFail, handleSuccess } = config
  const globalError = config.globalError ||
    'Server error. Try to to refresh the page.'

  const url = getUrlFromConfig(config)

  const fetchDataMethod = config.fetchData || fetchData

  try {

    const fetchResult = await fetchDataMethod(url, config)

    console.log('fetchResult', fetchResult)

    if (!fetchResult) {
      const errors = [
        {
          global: ['La connexion au serveur est trop faible'],
        },
      ]

      dispatch(failData(payload, config))

      if (handleFail) {
        handleFail(state, successOrFailAction)
      }

      return
    }

    const { ok, payload, status } = fetchResult
    Object.assign(config, { ok, status })
    const successOrFailAction = { config, payload }

    const isSuccess = isSuccessStatus(status)

    if (isSuccess) {
      dispatch(successData(payload, config))

      if (handleSuccess) {
        handleSuccess(state, successOrFailAction)
      }

      return
    }

    if (payload.errors) {

      dispatch(failData(payload, config))

      if (handleFail) {
        handleFail(state, successOrFailAction)
      }

      throw Error(payload.errors)
    }

  } catch (error) {
    Object.assign(config, { ok: false, status: 500 })
    const errors = [
      {
        global: [globalError],
      },
      {
        data: [String(error)],
      },
    ]
    const payload = { errors }
    const failAction = { config, payload  }

    dispatch(failData(payload, config))

    if (handleFail) {
      handleFail(state, failAction)
    }

    throw Error(errors)
  }
}

export default fetchToSuccessOrFailData
