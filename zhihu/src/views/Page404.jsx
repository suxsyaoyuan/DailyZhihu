import React from "react"
import styled from "styled-components"
import { ErrorBlock, Button } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'

/* 组件的样式 */
const Page404Style = styled.div`
    padding-top: 50px;
    font-size: 20px;

    .adm-error-block-image{
        height: 200px;
    }

    .adm-error-block-description,
    .adm-error-block-description-title{
        font-size: 14px;
    }

    .btn{
        margin-top: 25px;
        display: flex;
        justify-content: center;
        .adm-button{
            margin: 0 10px;
        }
    }
`

const Page404 = function Page404() {
    const navigate = useNavigate()

    return <Page404Style>
        <ErrorBlock status="empty" title="您访问的页面不存在" description="去逛逛其他页面吧" />
        <div className="btn">
            <Button color="warning"
                onClick={() => {
                    navigate(-1)
                }}>
                返回上一页
            </Button>
            <Button color="primary"
                onClick={() => {
                    navigate('/', { replace: true })
                }}>
                回到首页
            </Button>
        </div>
    </Page404Style>
}
export default Page404