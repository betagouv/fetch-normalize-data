export function getConfigWithDefaultValues(config) {
  return Object.assign({
    method: 'GET'
  }, config)
}

export default getConfigWithDefaultValues
