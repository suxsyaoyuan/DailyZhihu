import fetch from "isomorphic-fetch";
import { message } from "antd";

const BASE_URL = "";
// content-type
const ContentType = {
  JSON: "application/json; charset=UTF-8",
  FORM: "application/x-www-form-urlencoded; charset=UTF-8",
};

// token header
const getTokenHeaders = () => {
  // TODO get the token permission request
  const token = localStorage.getItem("user_token");
  return {
    Accept: ContentType.JSON,
    "Content-Type": ContentType.JSON,
    Token: token,
  };
};

// handle url
const getUrl = (url) => {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BASE_URL}${url}`;
};

// common check
const checkStatus = (response, type) => {
  if (response.status === 204) return response;
  if ([200, 201, 202].includes(response.status)) {
    if (type === "file") {
      return response;
    }
    return response.json();
  }
  // throw new Error(response.status)
  const { status } = response;
  const pureResponse = response.json();
  if (type !== "ignore") {
    if ([400, 500].includes(status)) {
      pureResponse.then((res) => {
        message.error(res.message || res.msg || "未知异常！");
      });
    } else {
      switch (status) {
        case 404:
          message.error("未找到远程服务器");
          break;
        case 401:
          message.error("会话信息缺失，请重新登录");
          setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();
            const { href } = window.location;
            window.tabs.jumpToLogin(href);
          }, 800);
          break;
        case 502:
          message.error("Bad Gateway");
          break;
        case 503:
          message.error("Service Unavailable");
          break;
        case 504:
          message.error("Gateway Timeout");
          break;
        default:
          message.error("服务器异常");
          break;
      }
    }
  }
  return Promise.reject(pureResponse);
};

// common error
const handleError = (promise, isFile = true) =>
  promise
    .then((response) => checkStatus(response, isFile ? "" : "file"))
    .catch((err) => Promise.reject(err));

/** GET请求
 * @param url: string
 * @param params
 * @param headers
 * @returns Promise<any>
 */
function get(url, params, headers = getTokenHeaders()) {
  let requestUrl;
  if (params) {
    const paramsString = Object.keys(params)
      .map((key) => `${key}=${params[key] || ""}`)
      .join("&");
    const joiner = url.search(/\?/) === -1 ? "?" : "&";
    requestUrl = `${url}${joiner}${paramsString}`;
  } else {
    requestUrl = url;
  }
  const promise = fetch(getUrl(requestUrl), {
    method: "GET",
    headers,
  });
  return handleError(promise);
}

/** * POST 请求
 * @param url
 * @param params
 * @param headers
 * @returns Promise<any>
 * */
function post(url, params, headers = getTokenHeaders()) {
  const promise = fetch(getUrl(url), {
    method: "POST",
    headers,
    mode: "cors",
    body: JSON.stringify(params),
  });
  return handleError(promise);
}

/** * POST 请求(不处理restful的status code = 500错误，直接返回)
 * @param url
 * @param params
 * @param headers
 * @returns Promise<any>
 * */
function postIgnore(url, params, headers = getTokenHeaders()) {
  const promise = fetch(getUrl(url), {
    method: "POST",
    headers,
    mode: "cors",
    body: JSON.stringify(params),
  });
  return promise
    .then((response) => checkStatus(response, "ignore"))
    .catch((err) => {
      // err.then((e) => {
      //   message.error(e.message || e.msg || '未知异常！');
      // });
      Promise.reject(err);
    });
}

/** * POST form 请求
 * @param url
 * @param params
 * @param headers
 * @returns Promise<any>
 * */
function postForm(url, params, headers = getTokenHeaders()) {
  const promise = fetch(getUrl(url), {
    method: "POST",
    headers: {
      Token: headers.Token,
    },
    mode: "cors",
    body: params,
  });
  return handleError(promise);
}

/** * POST 请求文件
 * @param url
 * @param params
 * @param headers
 * @returns Promise<any>
 * */
function postFile(url, params, headers = getTokenHeaders()) {
  const promise = fetch(getUrl(url), {
    method: "POST",
    headers,
    mode: "cors",
    body: JSON.stringify(params),
  });
  return handleError(promise, false);
}
/** * delete 请求文件
 * @param url
 * @param headers
 * @returns Promise<any>
 * */
function Delete(url, params, headers = getTokenHeaders()) {
  let requestUrl;
  if (params) {
    const paramsString = Object.keys(params)
      .map((key) => `${key}=${params[key] || ""}`)
      .join("&");
    const joiner = url.search(/\?/) === -1 ? "?" : "&";
    requestUrl = `${url}${joiner}${paramsString}`;
  } else {
    requestUrl = url;
  }
  const promise = fetch(getUrl(requestUrl), {
    method: "delete",
    headers,
  });
  return handleError(promise);
}
/** GET 请求文件
 * @param url: string
 * @param params
 * @param headers
 * @returns Promise<any>
 */
function getDownFiles(url, params, headers = getTokenHeaders()) {
  let requestUrl;
  if (params) {
    const paramsString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const joiner = url.search(/\?/) === -1 ? "?" : "&";
    requestUrl = `${url}${joiner}${paramsString}`;
  } else {
    requestUrl = url;
  }
  const promise = fetch(getUrl(requestUrl), {
    method: "GET",
    headers,
  });
  return handleError(promise, false);
}

/** * POST 请求文件
 * @param url
 * @param params
 * @param headers
 * @returns Promise<any>
 * */
function postDownFile(url, params, headers = getTokenHeaders()) {
  const promise = fetch(getUrl(url), {
    method: "POST",
    headers,
    mode: "cors",
    body: JSON.stringify(params),
  });
  return handleError(promise, false);
}

export {
  get,
  post,
  postForm,
  postFile,
  getTokenHeaders,
  postIgnore,
  Delete,
  getDownFiles,
  postDownFile,
};
