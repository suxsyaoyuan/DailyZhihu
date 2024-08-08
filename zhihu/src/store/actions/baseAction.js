import * as TYPES from "../action-types";
import API from "@/api";
import defaultPic from "@/assets/images/timg.jpg"; //以es6 module格式导入

const baseAction = {
  // 异步获取登录者信息 完成派发【包含很多方法 每个方法执行都派发对应的行为对象】
  // 获取用户信息
  async queryLoginInfo() {
    let profile = null;
    try {
      // let { code, codeText, data } = await API.queryUserInfo();
      // console.log(code, codeText, data);
      // if (+code === 0) {
      //   profile = data;
      // } //请求成功
      profile = { name: "4s", pic: defaultPic };
    } catch (error) {
      throw error;
    }
    console.log("Returning profile:", profile); // 最后确认返回的 profile
    return {
      type: TYPES.BASE_QUERY_USER_INFO,
      profile,
    };
  },
  // 移除登录者信息
  removeLoginInfo() {
    return {
      type: TYPES.BASE_REMOVE_USER_INFO,
      profile: null,
    };
  },
  // 切换夜间模式
  setNightMode() {
    return {
      type: TYPES.SET_NIGHT_MODE,
    };
  },
};
export default baseAction;
