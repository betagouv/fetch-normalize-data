import { TIMEOUT_ERROR } from './error_codes'
import { failData } from '../../reducer/actionCreators'


export function handleTimeoutError(reducer, payload, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config

  payload['error_type'] = TIMEOUT_ERROR
  dispatch(failData(payload, config))

  if (handleFail) {
    const action = { config, payload }
    handleFail(state, action)
  }
}

export default handleTimeoutError
