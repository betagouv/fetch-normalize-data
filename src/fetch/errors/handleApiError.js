import { API_ERROR } from './error_codes'
import { failData } from '../../reducer/actionCreators'


export function handleApiError(reducer, payload, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config

  payload['error_type'] = API_ERROR
  dispatch(failData(payload, config))

  if (handleFail) {
    const action = { config, payload }
    handleFail(state, action)
  }
}

export default handleApiError
