import { failData } from '../../reducer/actionCreators'

export const GLOBAL_SERVER_ERROR = 'Server error. Try to to refresh the page.'

export function handleServerError (reducer, error, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config
  const globalServerError = config.globalServerError || GLOBAL_SERVER_ERROR

  const errors = [
    {
      global: [globalServerError],
    },
    {
      data: [String(error)],
    },
  ]
  const payload = { errors }

  dispatch(failData(payload, config))

  if (handleFail) {
    handleFail(state, { config, payload })
  }

  throw Error(errors)
}

export default handleServerError
