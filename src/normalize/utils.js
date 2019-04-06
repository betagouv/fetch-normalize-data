export function getDefaultDatumIdKey () {
  return 'id'
}

export function getDefaultDatumIdValue (datum, index) {
  return datum.id || index
}
