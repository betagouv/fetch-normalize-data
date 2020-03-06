import { failData } from '../../reducer/actionCreators'
import { SERVER_ERROR } from './error_codes'

export const GLOBAL_SERVER_ERROR = 'Server error. Try to to refresh the page.'

export function handleServerError(reducer, error, config) {
  const { dispatch, getState } = reducer
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
    error_type: SERVER_ERROR,
  }

  dispatch(failData(payload, config))

  if (handleFail) {
    const action = { config, payload }
    handleFail(getState(), action)
  }
}

export default handleServerError
