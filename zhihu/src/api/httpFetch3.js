// fetch-wrapper.js
/**
 * 自定义的fetch函数封装，支持请求和响应拦截器。
 *
 * @param {string} url - 想要获取资源的URL地址。
 * @param {Object} [options={}] - 传递给fetch请求的选项对象。
 * @param {string} [responseType='json'] - 预期的响应类型（如 'json', 'text', 'blob' 等）。
 * @returns {Promise} - 返回一个promise，解析为请求的响应结果。
 */
function customFetch(url, options = {}, responseType = "json") {
  // 预设请求和响应拦截器
  const requestInterceptors = [
    // 请求拦截器逻辑
    (config) => {
      // 比如添加身份验证的逻辑
      console.log("Running request interceptors");
      console.log(config);
      return config;
    },
  ];

  const responseInterceptors = [
    // 响应拦截器逻辑
    (response) => {
      // 比如对特定的状态码做统一处理
      console.log("Running response interceptors");
      console.log(response);
      return response;
    },
  ];

  // 运行请求拦截器
  options = requestInterceptors.reduce(
    (acc, interceptor) => interceptor(acc),
    options
  );

  // 执行fetch请求
  return fetch(url, options)
    .then((response) => {
      // 运行响应拦截器
      response = responseInterceptors.reduce(
        (acc, interceptor) => interceptor(acc),
        response
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      switch (responseType) {
        case "json":
          return response.json();
        case "text":
          return response.text();
        case "blob":
          return response.blob();
        case "formData":
          return response.formData();
        case "arrayBuffer":
          return response.arrayBuffer();
        default:
          return response.json();
      }
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
      throw error;
    });
}

/**
 * 将对象转换为URL查询字符串。
 *
 * @param {Object} params - 需要转换的参数对象。
 * @returns {string} - 从参数对象创建的查询字符串。
 */
function toQueryString(params) {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .map((k) => esc(k) + "=" + esc(params[k]))
    .join("&");
}

/**
 * 封装GET请求，支持传递查询参数。
 *
 * @param {string} url - 请求的URL地址。
 * @param {Object} [params={}] - 作为查询字符串添加到URL的参数对象。
 * @param {Object} [options={}] - fetch请求的选项对象。
 * @returns {Promise} - 返回一个promise，解析为请求的响应结果。
 */
function get(url, params = {}, options = {}) {
  // 构造带查询字符串的URL
  if (params && Object.keys(params).length) {
    url += (url.indexOf("?") === -1 ? "?" : "&") + toQueryString(params);
  }
  return customFetch(url, { ...options, method: "GET" });
}

/**
 * 封装POST请求。
 *
 * @param {string} url - 请求的URL地址。
 * @param {Object|FormData} [data={}] - 需要POST的数据对象或FormData对象。
 * @param {Object} [options={}] - fetch请求的选项对象。
 * @param {boolean} [json=true] - 如果为true，则发送JSON；为false，则发送FormData。
 * @returns {Promise} - 返回一个promise，解析为请求的响应结果。
 */
function post(url, data = {}, json = true, options = {}) {
  const headers = new Headers(options.headers || {});

  let bodyData;
  if (json) {
    // 当json为true时，设置Content-Type头部为application/json，并将数据转换成JSON字符串
    headers.append("Content-Type", "application/json");
    bodyData = JSON.stringify(data);
  } else {
    // 当json为false时，将对象转换为FormData
    bodyData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      bodyData.append(key, value);
    }
  }

  return customFetch(url, {
    ...options,
    method: "POST",
    headers,
    body: bodyData,
  });
}

/**
 * 添加下载功能的函数。
 *
 * @param {string} url - 请求资源的URL地址。
 * @param {Object} [data={}] - 如果是POST请求，这里是请求体的数据对象；如果是GET请求，这里是查询参数对象。
 * @param {string} [fileName='file'] - 下载文件时希望使用的文件名。
 * @param {string} [method='GET'] - 请求使用的HTTP方法（通常是'GET'或'POST'）。
 */
function download(url, data, fileName, method = "GET") {
  if (method === "GET") {
    // 构造带查询字符串的URL
    if (data && Object.keys(data).length) {
      url += (url.indexOf("?") === -1 ? "?" : "&") + toQueryString(data);
    }
  }
  // 根据请求类型设置options
  const options =
    method === "POST"
      ? {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      : {
          method: method,
        };

  customFetch(url, options, "blob")
    .then((blob) => {
      // 创建blob链接
      const url = window.URL.createObjectURL(blob);
      // 创建a标签用于触发下载
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "file");
      document.body.appendChild(link);
      link.click();
      // 清除
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Download Error:", error);
    });
}

// 导出封装好的 GET 和 POST 函数
export { get, post, customFetch, download };
