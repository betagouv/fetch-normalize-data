import {
  ASSIGN_DATA,
  DELETE_DATA,
  MERGE_DATA,
  REINITIALIZE_DATA,
  SET_DATA,
} from './actions'
import getTypeSuffixFromConfig from './getTypeSuffixFromConfig'
import getConfigWithDefaultValues from '../../fetch/getConfigWithDefaultValues'


export const assignData = patch => ({
  patch,
  type: ASSIGN_DATA,
})


export const deleteData = (patch, config = {}) => ({
  config,
  patch,
  type: DELETE_DATA,
})


export const mergeData = (patch, config = {}) => ({
  config,
  patch,
  type: MERGE_DATA,
})


export const failData = (payload = {}, config = {}) => ({
  config,
  payload,
  type: `FAIL_DATA_${getTypeSuffixFromConfig(config)}`,
})


export const requestData = (config = {}) => {
  const configWithDefaultValues = getConfigWithDefaultValues(config)
  return {
    config: configWithDefaultValues,
    type: `REQUEST_DATA_${getTypeSuffixFromConfig(configWithDefaultValues)}`,
  }
}


export const reinitializeData = (config = {}) => ({
  config,
  type: REINITIALIZE_DATA,
})


export const setData = patch => ({
  patch,
  type: SET_DATA,
})


export const successData = (payload = {}, config = {}) => ({
  config,
  payload,
  type: `SUCCESS_DATA_${getTypeSuffixFromConfig(config)}`,
})
