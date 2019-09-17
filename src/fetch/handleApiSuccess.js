import { successData } from "../reducer/actionCreators"

export function handleApiSuccess(reducer, result, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleSuccess } = config

  if (handleSuccess) {
    handleSuccess(state, { config, result })
  }

  dispatch(successData(result, config))
}

export default handleApiSuccess
