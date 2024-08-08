import { HashRouter } from 'react-router-dom'
import RouterView from "./router"
import { KeepAliveProvider } from 'keepalive-react-component'

/* 页面入口 */
const App = function App() {
    return <HashRouter>
        <KeepAliveProvider>
            {/* 放路由渲染的内容 */}
            <RouterView />
        </KeepAliveProvider>
    </HashRouter>
}
export default App