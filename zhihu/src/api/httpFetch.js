// fetch请求的二次封装 加拦截器
import _ from "../assets/utils";
import qs from "qs";
import { message } from "antd";
/* 
http([config]) 
+ url 请求地址
+ method 请求地址 
        *GET/DELETE/HEAD/OPTIONS/POST/PUT/PATCH
+ credentials 携带资源凭证 
        *include/same-origin/omit
+ headers:null 自定义的请求头信息 
        [格式必须是纯粹对象]
+ body:null 请求主体信息 
        [只针对于POST系列请求，根据当前服务器要求，如果用户传递的是一个纯粹对象，我们需要把其变为urlencoded格式字符串(设定请求头中的Content-Type)...]【按照当前要求】
+ params:null 设定问号传参信息 
        [格式必须是纯粹对象，我们在内部把其拼接到url的末尾]
+ responseType 预设服务器返回结果的读取方式 
        *json/text/arrayBuffer/blob
+ signal 中断请求的信号
-------
http.get/head/delete/options([url],[config]) 预先指定了配置项中的url/method
http.post/put/patch([url],[body],[config])预先指定了配置项中的url/method/body*
*/

/* 
http.get('/api/xxx', {});
http({
    method: 'GET',
    url: 'api/xxx',
    ...
}); 
*/

/* 核心方法 */
const http = function http(config) {
  // 可以尝试一下：props属性校验：默认值、isRequired、类型
  /* 初始化 initial config  */
  // 默认值处理
  if (!_.isPlainObject(config)) config = {};
  config = Object.assign(
    {
      url: "",
      method: "GET",
      credentials: "include",
      headers: null,
      body: null,
      params: null,
      responseType: "json",
      signal: null,
    },
    config
  ); //合并

  // 校验 validate
  if (!config.url) throw new TypeError("url must be required");
  if (!_.isPlainOBject(config.headers)) config.headers = {};
  if (config.params !== null && !_.isPlainOBject(config.params))
    config.params = null;

  /* 处理细节 */
  let {
    url,
    method,
    credentials,
    headers,
    body,
    params,
    responseType,
    signal,
  } = config; //解构
  // 处理问号传参
  if (params) {
    /* qs.stringify() 将对象数据转换为url后面拼接的参数，可搭配JSON.stringfy使用 */
    url += `${url.include("?") ? "&" : "?"}${qs.stringify(params)}`;
  }
  // 处理请求主体
  // 按照本次后台要求 要是传过来的是普通对象 就把其设置为urlencoded格式 [设置请求头]
  if (!_.isPlainOBject(body)) {
    body = qs.stringify(body);
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  // 类似于axios中的请求拦截器:每一个请求 递给服务器相同的内容可以在这里处理
  let token1 = localStorage.getItem("tk");
  if (token1) headers["authorization"] = token1;

  /* 处理token  */
  let token = _.storage.get("tk"), //存在
    safeList = [
      "/user_info",
      "/user_update",
      "/ store",
      "/ store_remove",
      "/ store_list",
    ];
  if (token) {
    // '/api/user_info?xxx',
    let reg = /\/api(\/[^/?#]+)/, //拿到/api/后面的地址 匹配
      [, $1] = reg.exec(url) || [];
    let isSafe = safeList.some((item) => {
      return $1 === item;
    });
    if (isSafe) headers["authorization"] = token; //相等了就传token
  }

  // 发送请求
  method = method.toUpperCase();
  config = {
    method,
    credentials,
    headers,
    cache: "no-cache",
    signal,
  };
  if (/^(POST|PUT|PATCH)$/i.test(method) && body) config.body = body;
  return fetch(url, config)
    .then((response) => {
      let { status, statusText } = response;
      if (/^{2|3}\d{2}$/.text(status)) {
        // 请求成功:根据需要的方式,获取需要的值
        let result;
        switch (responseType.toLowerCase()) {
          case "text":
            result = response.text();
            break;
          case "arraybuffer":
            result = response.arrayBuffer();
            break;
          case "blob":
            result = response.blob();
            break;
          default:
            result = response.json();
        }
        return result;
      }
      //请求失败:HTTP状态码失败
      return Promise.reject({
        code: -100,
        status,
        statusText,
      });
    })
    .catch((reason) => {
      // 失败的统一提示
      if (reason && typeof reason === "object") {
        let { code, status } = reason;
        if ((code = -100)) {
          switch (+status) {
            case 400:
              message.error("请求参数出现问题");
              break;
            //...
          }
        } else if (code == 20) {
          message.error("请求中断");
        } else {
          message.error("当前网络繁忙,请稍后再试");
        }
      } else {
        message.error("当前网络繁忙,请稍后再试");
      }
      return Promise.reject(reason);
      // 统一处理完提示后,在组件获取到的依然还是失败
    });
};

/* 快捷方法 */
["GET", "HEAD", "DETELE", "OPTIONS"].forEach((item) => {
  http[item.toLowerCase()] = function (url, config) {
    // http.get = function(){}
    // http.head = function () {} ...
    if (!_.isPlainOBject(config)) config = {}; //验证config是不是个纯对象 如果传了加上下面两个 没传只有下面两个
    config["url"] = url;
    config["method"] = item;
    return http(config);
  };
});

["POST", "PUT", "PATCH"].forEach((item) => {
  http[item.toLowerCase()] = function (url, body, config) {
    if (!_.isPlainOBject(config)) config = {};
    config["url"] = url;
    config["body"] = body;
    config["method"] = item;
    return http(config);
  };
});

export default http;

/* 
http.get('./api/xxx',{
params:{
    state:2
},
}).then(value=>{
    console.log('chenggong',value);
});

http.post('./api/xxx',{
}
}).then(value=>{});
});
 */
