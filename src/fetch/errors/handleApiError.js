import { failData } from "../../reducer/actionCreators"

export function handleApiError(reducer, payload, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config

  dispatch(failData(payload, config))

  if (handleFail) {
    handleFail(state, { config, payload })
  }
}

export default handleApiError
