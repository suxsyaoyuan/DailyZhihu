import * as TYPES from '../action-types'

let initial = {
    list: null
}
export default function collectReducer(state = initial, action) {
    state = { ...state }
    let { type, list, id, flag } = action
    switch (type) {
        case TYPES.COLLECT_QUERY:
            state.list = list
            break
        case TYPES.COLLECT_REMOVE:
            if (Array.isArray(state.list) && flag) {
                state.list = state.list.filter(item => {
                    return +item.id !== +id
                })
            }
            break
        case TYPES.COLLECT_CLEAR:
            state.list = null
            break
        default:
    }
    return state
}   