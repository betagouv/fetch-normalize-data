import { failData } from '../../reducer/actionCreators'

export function handleApiError(reducer, payload, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config

  dispatch(failData(payload, config))

  if (handleFail) {
    const action = { config, payload }
    handleFail(state, action)
  }
}

export default handleApiError
