export const keyFromConfig = config => config.tag || config.apiPath

export default (state, config) =>
  state.requests && state.requests[keyFromConfig(config)]
