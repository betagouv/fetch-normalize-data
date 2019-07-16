import { successData } from '../reducer/actionCreators'

export function handleApiSuccess (reducer, payload, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleSuccess } = config

  if (handleSuccess) {
    handleSuccess(state, { config, payload })
  }

  dispatch(successData(payload, config))
}

export default handleApiSuccess
