import { failData } from '../../reducer/actionCreators'
import { API_ERROR } from './error_codes'

export function handleApiError(reducer, payload, config) {
  const { dispatch, getState } = reducer
  const { handleFail } = config

  payload['error_type'] = API_ERROR
  dispatch(failData(payload, config))

  if (handleFail) {
    const action = { config, payload }
    handleFail(getState(), action)
  }
}

export default handleApiError
