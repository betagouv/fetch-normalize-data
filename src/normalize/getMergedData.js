import uniq from 'lodash.uniq'
import uniqBy from 'lodash.uniqby'

import { getDefaultDatumIdValue, merge } from './utils'

export function getMergedData(nextData, previousData, config) {
  if (!previousData) {
    return nextData
  }

  const { isMergingDatum, isMutatingDatum, resolve } = config
  const getDatumIdValue = config.getDatumIdValue || getDefaultDatumIdValue
  const isMutatingArray =
    typeof config.isMutatingArray === 'undefined'
      ? true
      : config.isMutatingArray

  const mergedData = isMutatingArray ? [...previousData] : previousData

  // for each datum we are going to assign (by merging or not) them into
  // their right place in the resolved array
  nextData.forEach(nextDatum => {
    const previousIndex = previousData.findIndex(previousDatum => {
      if (getDatumIdValue(previousDatum) === getDatumIdValue(nextDatum))
        return true
      if (previousDatum.activityIdentifier && nextDatum.activityIdentifier) {
        return previousDatum.activityIdentifier === nextDatum.activityIdentifier
      }
      return false
    })
    const previousDatum = previousData[previousIndex]
    const resolvedIndex =
      previousIndex === -1 ? mergedData.length : previousIndex

    let datum

    if (resolve) {
      datum = resolve(nextDatum, previousDatum, {
        previousData,
        nextData,
        config,
      })
    } else if (isMutatingDatum) {
      datum = Object.assign({}, isMergingDatum && previousDatum, nextDatum)
    } else if (isMergingDatum) {
      datum = previousIndex !== -1 ? merge(previousDatum, nextDatum) : nextDatum
    } else {
      datum = nextDatum
    }

    if (
      previousDatum &&
      previousDatum.__normalizers__ &&
      nextDatum.__normalizers__
    ) {
      datum.__normalizers__ = uniqBy(
        previousDatum.__normalizers__.concat(nextDatum.__normalizers__),
        normalizer =>
          `${normalizer.datumKey || ''}-${normalizer.stateKey || ''}`
      )
    }

    if (previousDatum && previousDatum.__tags__ && nextDatum.__tags__) {
      datum.__tags__ = uniq(previousDatum.__tags__.concat(nextDatum.__tags__))
    }

    mergedData[resolvedIndex] = datum
  })

  return mergedData
}

export default getMergedData
