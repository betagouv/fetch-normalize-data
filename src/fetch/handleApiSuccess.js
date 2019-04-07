import { successData } from '../reducer'

export function handleApiSuccess (reducer, payload, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleSuccess } = config

  dispatch(successData(payload, config))

  if (handleSuccess) {
    handleSuccess(state, { config, payload })
  }
}

export default handleApiSuccess
