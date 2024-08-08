import { combineReducers } from 'redux'
import baseReducer from './baseReducer'
import collectReducer from './collectReducer'

/* 合并reducer
   此时容器中的公共状态 会按照我们设置的名字 分模块管理
   以后获取：store.getState().base
*/
const reducer = combineReducers({
    base: baseReducer,
    collect: collectReducer
})
export default reducer