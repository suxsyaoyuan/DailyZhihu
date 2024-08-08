import { lazy } from "react";
// 路由懒加载
import Home from "@/views/Home";
import { withKeepAlive } from "keepalive-react-component";

/* 路由表 */
const routes = [
  {
    path: "/",
    name: "home",
    meta: { title: "首页" }, //路由源信息 切换的时候标题可以改变
    component: withKeepAlive(Home, { cacheId: "Home" }), // 每一个缓存的组件都有一个唯一的id
  },
  {
    path: "/detail/:id", //路径传参 必传
    name: "detail",
    meta: { title: "详情页" },
    component: lazy(() => import("@/views/Detail")),
  },
  {
    path: "/personal",
    name: "personal",
    meta: { title: "个人中心" },
    component: lazy(() => import("@/views/Personal")),
  },
  {
    path: "/login",
    name: "login",
    meta: { title: "登录/注册" },
    component: lazy(() => import("@/views/Login")),
  },
  {
    path: "/mystore",
    name: "mystore",
    meta: { title: "我的收藏" },
    component: lazy(() => import("@/views/MyStore")),
  },
  {
    path: "/update",
    name: "update",
    meta: { title: "修改个人信息" },
    component: lazy(() => import("@/views/Update")),
  },
  {
    path: "/404",
    name: "404",
    meta: { title: "404页面" },
    component: lazy(() => import("@/views/Page404")),
  },
  {
    path: "*",
    redirect: "/404",
  },
];
export default routes;
