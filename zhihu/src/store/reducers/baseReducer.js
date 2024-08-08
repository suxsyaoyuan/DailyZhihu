// 个人信息
import * as TYPES from "../action-types";
// import _ from "../../assets/utils";

/* 管理员：修改STORE容器中的公共状态 */
let initial = {
  profile: null,
  nightMode: false, // 初始夜间模式状态为false
};

export default function baseReducer(state = initial, action) {
  // store：存储STORE容器的公共状态【最开始米有的时候，赋值初始状态值initial】
  // action：每次基于dispatch派发时，传递进来的行为对象【必须具备type属性，存储派发的行为标识】
  state = { ...state }; //浅克隆
  /* state = _.clone(true,state); //深克隆 */
  /* 每次dispatch派发 都会把reducer执行 最开始 redux内部会完成第一次派发 然后不能直接在过程中修改容器中的状态 要在最后return整体替换 所以一开始先浅克隆state 接下来改克隆的这个  */

  // 接下来需要基于派发的行为标识,修改STORE容器中的公共状态信息
  switch (action.type) {
    case TYPES.BASE_QUERY_USER_INFO:
      // 更新登录者信息
      state.profile = action.profile;
      break;
    case TYPES.BASE_REMOVE_USER_INFO:
      state.profile = null;
      break;
    case TYPES.SET_NIGHT_MODE:
      state.nightMode = !state.nightMode; // 切换夜间模式状态
      break;
    default:
  }
  // return的内容:会整体替换STORE容器中内容
  return state;
}
