import { useState } from "react";
import { Button } from "antd-mobile";
// import _ from "@/assets/utils";

/* 解决问题：防抖 避免重复提交 点击按钮做啥一定要基于onclick */

export default function ButtonAgain(props) {
  // 定义状态
  let options = { ...props };
  let { children, onClick: handle } = options;
  delete options.children;
  let [loading, setLoading] = useState(false);

  // 把除了特定之外的其它属性，放在attrs中，最后统一给组件库中的Button
  // let attrs = {};
  // _.each(props, (value, key) => {
  //   if (key === "loading" || key === "children" || key === "onClick") return;
  //   attrs[key] = value;
  // });

  const clickHandle = async () => {
    if (typeof handle !== "function") return;
    setLoading(true);
    try {
      await handle();
    } catch (_) {}
    setLoading(false);
  };
  // 如果传了再处理 没传也不处理
  if (handle) options.onClick = clickHandle;

  return (
    <Button {...options} loading={loading}>
      {children}
    </Button>
  );
}
