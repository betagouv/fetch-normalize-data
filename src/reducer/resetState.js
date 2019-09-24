const getResetState = (initialState, config) => {
  if (!config.excludes) return initialState

  return Object.keys(initialState).reduce((resetState, currentStateKey) => {
    if (!config.excludes.includes(currentStateKey)) {
      resetState[currentStateKey] = initialState[currentStateKey]
    }

    return resetState
  }, {})
}

export default getResetState
