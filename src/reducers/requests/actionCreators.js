import { DELETE_REQUEST } from './actions'

export const deleteRequest = key => ({
  key,
  type: DELETE_REQUEST,
})
