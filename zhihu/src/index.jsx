/* 程序打包入口 */
import React from "react";
import ReactDOM from "react-dom/client";
// import './global'

/* ANTD-MOBILE */
import { ConfigProvider } from "antd-mobile";
import zhCN from "antd-mobile/es/locales/zh-CN";

/* REDUX */
import { Provider } from "react-redux";
import store from "./store";

/* 组件&样式 */
// import 'lib-flexible';
import "@/assets/flexible";
import "./index.less";
import App from "./App";

/* 解决click事件300ms延迟的问题 */
import FastClick from "fastclick";
FastClick.attach(document.body);

/* 处理最大宽度 */
/* ( function () {
const handleMax = function handleMax() {
let html = document.documentElement,	
root = document.getElementById('root'),
deviceW = html.clientWidth;	
root.style.maxWidth = "750px";
if (deviceW >= 750){
html.style.fontSize = '75px';	
};
handleMax();	
window.addEventListener( 'resize', handleMax);
})(); */

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ConfigProvider locale={zhCN}>
    {/* 基于上下文对象的Provider 用来把创建的store放到祖先的上下文中 */}
    <Provider store={store}>
      <App />
    </Provider>
  </ConfigProvider>
);
