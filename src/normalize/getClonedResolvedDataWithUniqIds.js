import uniqBy from 'lodash.uniqby'

import { getDefaultDatumIdKey, getDefaultDatumIdValue } from './utils'

export function getClonedResolvedDatumWithId(datum, index, config) {
  const {
    data,
    resolve
  } = config
  const getDatumIdKey = config.getDatumIdKey || getDefaultDatumIdKey
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue

  // CLONE
  let datumWithId = Object.assign(
    { [getDatumIdKey(datum)]: getDatumIdValue(datum, index) },
    datum
  )

  // MAYBE RESOLVE
  if (resolve) {
    datumWithId = config.resolve(datumWithId, data, config)
  }

  return datumWithId
}

export function getClonedResolvedDataWithUniqIds (data, config) {
  const { getDatumIdValue } = config
  const unifyConfig = Object.assign({ data }, config)

  return uniqBy(
    data.map((datum, index) => getClonedResolvedDatumWithId(datum, index, unifyConfig)),
    // UNIFY BY ID
    // (BECAUSE DEEPEST NORMALIZED DATA CAN RETURN ARRAY OF SAME ELEMENTS)
    getDatumIdValue
  )
}

export default getClonedResolvedDataWithUniqIds
