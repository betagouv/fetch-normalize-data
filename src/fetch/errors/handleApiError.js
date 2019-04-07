import { failData } from '../../reducer'

function handleApiError (reducer, payload, config) {
  const [data, dispatch] = reducer
  const state = { data }
  const { handleFail } = config

  dispatch(failData(payload, config))

  if (handleFail) {
    handleFail(state, { config, payload })
  }

  throw Error(payload.errors)
}

export default handleApiError
