import { API_ERROR } from './errorCodes'
import { failData } from '../../reducers/data/actionCreators'

export function handleApiError(reducer, payload, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config

  payload['error_type'] = API_ERROR
  const failAction = failData(payload, config)
  dispatch(failAction)

  if (handleFail) {
    const action = { config, payload, type: failAction.type }
    handleFail(state, action)
  }
}

export default handleApiError
