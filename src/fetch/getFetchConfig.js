import uuid from 'uuid'

const { NAME, VERSION } = process.env

export function getFetchConfig(config) {
  const {
    body,
    method,
    token
  } = config

  const fetchConfig = {
    credentials: 'include',
    method,
  }

  fetchConfig.headers = {
    AppName: NAME,
    AppVersion: VERSION,
    'X-Request-ID': uuid(),
  }

  if (method !== 'GET' && method !== 'DELETE') {
    let formatBody = body
    let isFormDataBody = formatBody instanceof FormData
    if (formatBody && !isFormDataBody) {
      const fileValue = Object.values(body).find(value => value instanceof File)
      if (fileValue) {
        const formData = new FormData()
        Object.keys(formatBody).forEach(key => formData.append(key, formatBody[key]))
        formatBody = formData

        isFormDataBody = true
      }
    }

    if (!isFormDataBody) {
      Object.assign(fetchConfig.headers, {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      })
    }

    fetchConfig.body =
      fetchConfig.headers['Content-Type'] === 'application/json'
        ? JSON.stringify(body || {})
        : body
  }

  if (token) {
    if (!fetchConfig.headers) {
      fetchConfig.headers = {}
    }
    fetchConfig.headers.Authorization = `Bearer ${token}`
  }

  return fetchConfig
}

export default getFetchConfig
