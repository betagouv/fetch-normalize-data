import { v4 as uuidv4 } from 'uuid'

const { NAME, VERSION } = process.env

export function getFetchConfig(config) {
  const { body, method, token } = config

  const init = {
    credentials: 'include',
    method,
  }

  init.headers = {
    AppName: NAME,
    AppVersion: VERSION,
    'X-Request-ID': uuidv4(),
  }

  if (method !== 'GET') {
    let formatBody = body
    let isFormDataBody = formatBody instanceof FormData
    if (formatBody && !isFormDataBody) {
      const fileValue = Object.values(body).find(value => value instanceof File)
      if (fileValue) {
        const formData = new FormData()
        Object.keys(formatBody).forEach(key =>
          formData.append(key, formatBody[key])
        )
        formatBody = formData

        isFormDataBody = true
      }
    }

    if (!isFormDataBody) {
      Object.assign(init.headers, {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      })
    }

    init.body =
      init.headers['Content-Type'] === 'application/json'
        ? JSON.stringify(body || {})
        : body
  }

  if (token) {
    if (!init.headers) {
      init.headers = {}
    }
    init.headers.Authorization = `Bearer ${token}`
  }

  return init
}

export default getFetchConfig
