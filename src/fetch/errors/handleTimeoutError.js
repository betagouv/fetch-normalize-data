import { TIMEOUT_ERROR } from './errorCodes'
import { failData } from '../../reducers/data/actionCreators'

export function handleTimeoutError(reducer, payload, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config

  payload['error_type'] = TIMEOUT_ERROR
  const failAction = failData(payload, config)
  dispatch(failAction)

  if (handleFail) {
    const action = { config, payload, type: failAction.type }
    handleFail(state, action)
  }
}

export default handleTimeoutError
