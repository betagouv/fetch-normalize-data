import { DELETE_REQUESTS, REINITIALIZE_REQUESTS } from './actions'

export const deleteRequests = key => ({
  key,
  type: DELETE_REQUESTS,
})

export const reinitializeRequests = () => ({
  type: REINITIALIZE_REQUESTS,
})
