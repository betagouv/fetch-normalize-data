import { failData } from '../../reducer/actionCreators'

export const GLOBAL_SERVER_ERROR = 'Server error. Try to to refresh the page.'

export function handleServerError(reducer, error, config) {
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

  const payload = {
    errors,
    ok: false,
    status: 500,
  }

  dispatch(failData(payload, config))

  if (handleFail) {
    const action = { config, payload }
    handleFail(state, action)
  }
}

export default handleServerError
