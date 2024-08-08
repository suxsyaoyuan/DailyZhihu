import React, { useState } from "react";
import message from "@/components/message";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { RightOutline, SetOutline, EyeOutline } from "antd-mobile-icons";
import NavBarAgain from "@/components/NavBarAgain";
import { connect } from "react-redux";
import action from "@/store/actions";
import _ from "@/assets/utils";

/* 组件的样式 */
const PersonalStyle = styled.div`
  background-color: ${(props) => (props.nightMode ? "#444" : "#f5f5f5")};
  .baseInfo {
    box-sizing: border-box;
    margin: 20px 0;
    .pic {
      display: block;
      margin: 0 auto;
      width: 86px;
      height: 86px;
      border-radius: 50%;
    }
    .name {
      line-height: 50px;
      font-size: 18px;
      text-align: center;
      color: ${(props) => (props.nightMode ? "#fff" : "#000")};
    }
  }
  .tab {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    color: ${(props) => (props.nightMode ? "#fff" : "#000")};
    border-bottom: 1px solid #eee;
  }
  .bottomButtons {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 60px;
    background-color: ${(props) => (props.nightMode ? "#444" : "#f5f5f5")};
    position: fixed;
    bottom: 0;
    width: 100%;
    box-shadow: 0px -1px 5px rgba(0, 0, 0, 0.1);
    .button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: ${(props) => (props.nightMode ? "#fff" : "#666")};
      font-size: 12px;
      text-decoration: none;
      &:hover {
        color: #1890ff;
      }
    }
  }
`;

const Personal = function Personal({
  navigate,
  profile,
  removeLoginInfo,
  clearStore,
  nightMode,
  setNightMode,
}) {
  return (
    <PersonalStyle nightMode={nightMode}>
      <NavBarAgain title="个人中心" />
      <div className="baseInfo">
        <Link to="/update">
          <img className="pic" src={profile.pic} alt="" />
          <p className="name">{profile.name}</p>
        </Link>
      </div>
      <div>
        <Link to="/mystore" className="tab">
          我的收藏
          <RightOutline />
        </Link>
        <div
          className="tab"
          onClick={() => {
            removeLoginInfo(); // 清除redux中信息
            clearStore();
            _.storage.remove("TK"); // 清除token
            message.success("您已安全退出"); // 提示
            navigate(`/login?to=/personal&lx=singout`, { replace: true }); // 跳转
          }}
        >
          退出登录
          <RightOutline />
        </div>
      </div>

      {/* 底部设置和夜间模式按钮 */}
      <div className="bottomButtons">
        <div
          className="button"
          onClick={() => {
            /* 处理设置按钮的点击事件 */
          }}
        >
          <SetOutline />
          设置
        </div>
        <div
          className="button"
          onClick={() => {
            setNightMode(!nightMode); // 切换夜间模式状态
          }}
        >
          <EyeOutline />
          夜间模式
        </div>
      </div>
    </PersonalStyle>
  );
};
export default connect((state) => state.base, {
  removeLoginInfo: action.base.removeLoginInfo,
  setNightMode: action.base.setNightMode,
  clearStore: action.collect.clearStore,
})(Personal);
