import { successData } from '../reducer/actionCreators'

export function handleApiSuccess(reducer, payload, config) {
  const [state, dispatch] = reducer
  const { handleSuccess } = config

  dispatch(successData(payload, config))

  if (handleSuccess) {
    const action = { config, payload }
    handleSuccess(state, action)
  }
}

export default handleApiSuccess
