export async function getProcessedDatum(datum, index, config) {
  const { data, process } = config

  let processedDatum = datum
  if (process) {
    processedDatum = await process(datum, data, config)
  }
  return processedDatum
}

export async function getProcessedData(data, config) {
  return await Promise.all(data.map(async (datum, index) =>
    await getProcessedDatum(datum, index, config)))
}

export default getProcessedData
