/* 搭完路由表搭routerview */
import { Suspense, useEffect, useState } from "react"; //Suspense异步方式 路由懒加载
import message from "@/components/message";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import useRouteInfo from "./useRouteInfo";
import Loading from "@/components/Loading";
import routes from "./routes";
import store from "@/store";
import action from "@/store/actions";

/* 统一路由配置 */
const Element = function Element({ item }) {
  // 这里不能用async 因为element是个函数组件 必须返回jsx 不能返回实例 而且要立即返回 无法直接基于异步结果控制谁渲染
  let { meta, component: Component, path } = item;
  let profile = store.getState().base.profile;
  // let isShow = !isCheckLogin(path)
  // 执行这个方法 改变redux后实现更新
  let [random, setRandom] = useState(+new Date());
  const dispatch = store.dispatch;

  // 获取路由信息 基于属性传递给组件
  const navigate = useNavigate();
  const options = useRouteInfo(item);

  /* 登录态校验 */
  /* 我们应该根据标准的函数组件的操作，基于状态、变量、周期函数来统一处理登录态校验，首先分析是否需要做检验 isShow
            true：不需要
            false：需要
                   + 先渲染Loading[异步的]
                   + 在周期函数中校验 根据校验结果决定操作
                      + 校验通过：更新element渲染需要渲染的组件即可
                      + 没有通过：提示、跳转 */
  const checkList = ["/personal", "/mystore", "/update"];
  // 记录是否需要“异步派发”来进行登录态校验 返回是否需要校验
  let isCheckLogin = checkList.includes(path) && !profile;
  useEffect(() => {
    (async () => {
      //开始校验 完成异步请求 用自执行函数包起来 先渲染dotloading
      if (isCheckLogin) {
        // 获取异步派发的返回值 派发任务 先把redux中的信息存储起来
        let { profile } = await dispatch(action.base.queryLoginInfo());
        // 需要等异步执行完再决定navigate跳转还是继续渲染
        if (!profile) {
          // 当前用户没有登录：跳转到登录页 && 提示
          message.error("请您先登录");
          navigate(`/login?to=${path}`, { replace: true });
          return;
          /* {pathname:'/login',search=`?to=${path}` */
        }
        // 如果获取到了信息 说明已经登录
        setRandom(+new Date());
      }
    })();
  }); // 没有依赖项 每一次组件更新之后都执行
  if (isCheckLogin) return <Loading />;

  // 修改页面的标题 从meta路由原信息拿到 title
  let title = meta?.title;
  document.title = title ? `${title} - 知乎日报` : `知乎日报`;

  // 把路由的相关信息作为属性传递给组件
  return <Component {...options} />;
};

/* 路由规则配置 */
const RouterView = function RouterView() {
  return (
    <Suspense fallback={<Loading />}>
      {/* Suspense以异步的方式处理路由懒加载 */}
      <Routes>
        {/* 循环创建 路由匹配规则 */}
        {routes.map((item, index) => {
          let { path, redirect } = item;
          if (redirect) {
            return (
              <Route
                key={index}
                path={path}
                element={<Navigate to={redirect} />}
              />
            );
          }
          return (
            <Route
              key={index}
              path={path}
              element={
                <Element item={item} />
              } /* 把item中的每一项传给element  渲染element就可以做统一处理*/
            />
          );
        })}
      </Routes>
    </Suspense>
  );
};
export default RouterView;
