import { failData } from "../../reducer/actionCreators"

export const GLOBAL_RESULT_ERROR =
  "Result returned by the server is not at the good json format"

export function handleResultError(reducer, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config
  const globalResultError = config.globalResultError || GLOBAL_RESULT_ERROR

  const errors = [
    {
      global: [globalResultError]
    }
  ]
  const payload = { errors }

  dispatch(failData(payload, config))

  if (handleFail) {
    handleFail(state, { config, payload })
  }
}

export default handleResultError
