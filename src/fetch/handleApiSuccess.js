import { successData } from '../reducer/actionCreators'

export function handleApiSuccess(reducer, payload, config) {
  const { dispatch, getState } = reducer
  const { handleSuccess } = config

  dispatch(successData(payload, config))

  if (handleSuccess) {
    const action = { config, payload }
    handleSuccess(getState(), action)
  }
}

export default handleApiSuccess
