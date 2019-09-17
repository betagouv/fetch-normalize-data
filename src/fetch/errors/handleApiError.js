import { failData } from "../../reducer/actionCreators"

export function handleApiError(reducer, result, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config

  dispatch(failData(result, config))

  if (handleFail) {
    handleFail(state, { config, result })
  }
}

export default handleApiError
