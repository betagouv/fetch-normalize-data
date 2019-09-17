import { failData } from "../../reducer/actionCreators"

export const GLOBAL_SERVER_ERROR = "Server error. Try to to refresh the page."

export function handleServerError(reducer, error, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config
  const globalServerError = config.globalServerError || GLOBAL_SERVER_ERROR

  const errors = [
    {
      global: [globalServerError]
    },
    {
      data: [String(error)]
    }
  ]

  const result = {
    errors,
    ok: false,
    status: 500
  }

  dispatch(failData(result, config))

  if (handleFail) {
    handleFail(state, { config, result })
  }
}

export default handleServerError
