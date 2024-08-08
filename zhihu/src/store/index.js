// 用的最原始redux
import { createStore, legacy_createStore, applyMiddleware } from "redux";
import reduxLogger from "redux-logger";
import reduxPromise from "redux-promise";
import reducer from "./reducers";

// 使用中间件
const env = process.env.NODE_ENV;
const middleware = [reduxPromise];
if (env !== "production") middleware.push(reduxLogger);

// 创建STORE公共容器
/* const store = createStore(reducer, applyMiddleware(...middleware)) */
const store = legacy_createStore(reducer, applyMiddleware(...middleware));
export default store;
