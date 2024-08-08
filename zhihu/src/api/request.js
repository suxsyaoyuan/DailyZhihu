import axios from 'axios'
import config from '@/config'
import useBaseLocalStore from '@/stores/local'
import { showRequestError } from '@/utils/notification'

const request = axios.create({
  baseURL: config.apiUrl + config.apiUrlPrefix,
  timeout: 600000000,
  headers: {
    Env: config.apiEnv,
    'Content-Type': 'application/json',
  },
})

// 不需要验证token的接口白名单
const noAuthWhiteList = [
  'account.GetUserToken',
  'account_customer.RegisterSendPhoneCode',
  'account_customer.RegisterByPhone',
  'account_customer.LoginSendPhoneCode',
  'account_customer.LoginByPhone',
  'account_customer.LoginByWeChat',
]
// 请求拦截器
request.interceptors.request.use(config => {
  const baseLocalStore = useBaseLocalStore()
  if (baseLocalStore.token) {
    config.headers.Authorization = `Bearer ${baseLocalStore.token}`
  } else {
    const url = config.url || ''
    if (!noAuthWhiteList.includes(url)) {
      toLogin()
      return Promise.reject(new Error('not login'))
    }
  }
  return config
}, error => {
  return Promise.reject(new Error(error))
})

// 响应拦截器
request.interceptors.response.use(response => {
  const { data } = response
  if (data.code === 0) {
    return data.Response
  } else if (data.code === 401) {
    toLogin()
  } else {
    const msg = data.message || '调用接口失败'
    showRequestError(msg)
    console.log('defined: api response error: ', msg)
    return Promise.reject(new Error(msg))
  }
}, error => {
  let msg = ''
  if (error.response) {
    if (error.response.status === 401) { // 未登陆
      toLogin()
      return
    }
    if (error.response?.data?.message) {
      msg = error.response.data.message
    } else {
      msg = error.response.data
    }
  } else {
    msg = error.message
  }
  if (msg !== 'not login') {
    showRequestError(msg)
  }
  console.log('undefined: api response error: ', msg)
  return Promise.reject(msg)
})

export const toLogin = () => {
  showRequestError('登录信息已过期，请重新登录')
  const baseLocalStore = useBaseLocalStore()
  baseLocalStore.setLogout()
}

export const send = (url, data) => {
  const body = {
    cmd: url,
    env: config.apiEnv,
    request: data,
  }
  return request.post(url, body)
}

export const _download = (url, query) => {
  return request.get(url, { params: query, responseType: 'blob' })
}

export const _upload = (url, data, currentConfig) => {
  const formData = new FormData()
  formData.append('file', data.file)
  return request.post(url, formData, currentConfig)
}
