import { useState, useEffect, useMemo } from "react";
import message from "@/components/message";
import { flushSync } from "react-dom";
import styled from "styled-components";
import {
  LeftOutline,
  MessageOutline,
  LikeOutline,
  StarOutline,
  MoreOutline,
} from "antd-mobile-icons";
import { Badge, SpinLoading } from "antd-mobile";
import SkeletonAgain from "@/components/SkeletonAgain";
import API from "@/api";
import { connect } from "react-redux";
import action from "@/store/actions";

/* 组件的样式 */
const DetailStyle = styled.div`
  .content {
    overflow-x: hidden;
    // 隐藏横向溢出内容 不出现滚动条
    margin: 0;
    padding-bottom: 45px;
    .content-inner {
      background-color: ${(props) => (props.nightMode ? "#999" : "#eee")};
    }
    .img-place-holder {
      overflow: hidden;

      img {
        margin: 0;
        width: 100%;
        min-height: 100%;
      }
    }
    .meta {
      .avatar {
        display: inline-block;
        margin-top: 0;
        margin-bottom: 0;
      }
    }
  }

  .tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 999;
    box-sizing: border-box;
    width: 100%;
    height: 45px;
    background: #ddd;

    display: flex;
    align-items: center;
    .back {
      box-sizing: border-box;
      width: 50px;
      height: 25px;
      line-height: 25px;
      text-align: center;
      font-size: 20px;
      font-weight: 900;
      border-right: 1px solid #ccc;
    }
    .icons {
      flex-grow: 1;
      /* icons本身是flex元素 不写宽度 占剩余空间 */
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 25px;
      line-height: 25px;
      .adm-badge-wrapper,
      span {
        flex-grow: 1;
        /* 不用指定宽度 */
        text-align: center;
        font-size: 25px;
      }
      span {
        /* 找所有span中的最后一个 */
        &:nth-last-of-type(1) {
          color: #aaa;
        }
        /* 找所有span中的第一个 且是.stored */
        &:nth-of-type(1) {
          &.stored {
            color: #108ee9;
          }
        }
      }
      .adm-badge-wrapper {
        .adm-badge-fixed {
          right: 30%;
        }
        .adm-badge {
          background: none;
          .adm-badge-content {
            color: #555;
          }
        }
      }
    }
    .adm-spin-loading {
      margin: 0 auto;
      width: 20px;
      height: 20px;
    }
  }

  .stored {
    color: #1890ff;
  }
`;

const Detail = function Detail({
  navigate,
  params,
  location,
  profile,
  queryLoginInfo,
  collectList,
  queryStoreList,
  removeStore,
  nightMode,
}) {
  /* 新闻信息的常规处置 */
  // 定义状态
  let { id } = params;
  let [info, setInfo] = useState(null);
  let [story, setStory] = useState(null);

  // 第一次渲染完毕：从服务器获取数据
  // 处理样式
  let link = null;
  const handleStyle = (result) => {
    // 从获取的数据中拿到css 然后动态创建一个标签
    let { css } = result;
    css = (Array.isArray(css) && css[0]) || "";
    if (!css) return;
    // 动态创建Link
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = css;
    document.head.appendChild(link);
  };

  // 处理图片
  const handleImage = (result) => {
    let { image } = result;
    // 此处需要手动获取动态绑定的DOM元素 所以要确保setInfo(result)是同步的
    let imgPlaceHolder = document.querySelector(".img-place-holder");
    if (!imgPlaceHolder) return;
    // 创建大图
    let imgTemp = new Image();
    imgTemp.src = image;
    // 加载成功 加入它
    imgTemp.onload = () => {
      imgPlaceHolder.appendChild(imgTemp);
    };
    // 加载失败 移除
    imgTemp.onerror = () => {
      imgPlaceHolder.parentNode.removeChild(imgPlaceHolder);
    };
  };

  // 并行
  /*   const initInfo =
  const initStory =
  useEffect(() => {
    initInfo();
    initStory();
  }, []); */
  useEffect(() => {
    (async () => {
      try {
        let result = await API.queryNewsInfo(id);
        console.log("API.queryNewsInfo 返回值:", result); // 检查返回值
        // 先执行handleStyle(result)再更新视图  处理完flushSync后再处理handleImage 保证能拿到imgPlaceHolder
        flushSync(() => {
          // 状态修改是异步的批处理 flushSync是让状态更新队列立马执行
          setInfo(result);
          handleStyle(result);
        });
        handleImage(result);
      } catch (_) {}
    })();
    return () => {
      // 组件销毁的时候，把创建的Link移除掉
      if (link) document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let result = await API.queryNewsStory(id);
        setStory(result);
      } catch (_) {}
    })();
  }, []);

  /* 新闻收藏的处理 */
  let [loading, setLoading] = useState(false);
  // 第一次渲染完毕：处理是否登录、以及收藏列表
  useEffect(() => {
    (async () => {
      // 如果没有信息：派发 同步登录者信息
      if (!profile) {
        let result = await queryLoginInfo();
        console.log(result);
        profile = result.profile;
      }
      // 如果已经登陆 && 没有收藏列表信息：派发任务 同步收藏列表
      if (profile && !collectList) {
        await queryStoreList();
      }
    })();
  }, []);

  // 根据收藏列表，计算出当前文章是否收藏
  let isCollect = useMemo(() => {
    if (!collectList || collectList.length === 0) return false;
    return collectList.some((item) => {
      // 收藏列表里面的id === 路径参数里面的id
      return +item.news.id === +id;
    });
  }, [collectList, params]);

  // 新增或者删除收藏记录
  const collectHandle = async () => {
    // 首先校验是否登录
    if (!profile) {
      message.error(`请您先登录`);
      navigate(`/login?to=${location.pathname}`, { replace: true });
      return;
    }
    // 然后根据是否收藏，决定如何处理
    if (isCollect) {
      // 这篇文章收藏过：则移除收藏
      let item = collectList.find((item) => +item.news.id === +id);
      if (!item) {
        message.error("移除收藏失败");
        return;
      }
      setLoading(true);
      await removeStore(item.id);
      setLoading(false);
      return;
    }
    // 这篇文章没收藏过：则进行收藏
    setLoading(true);
    try {
      let { code } = await API.addStore(id);
      if (+code !== 0) {
        message.error("收藏失败");
      } else {
        message.success("收藏成功");
        // 同步最新收藏列表到redux容器中
        await queryStoreList();
      }
    } catch (_) {}
    setLoading(false);
  };

  return (
    <DetailStyle nightMode={nightMode}>
      {/* 新闻内容 */}
      {info ? (
        // 基于胡子语法{}绑定的内容全部会作为普通的文本进行渲染 我们想把富文本编辑器的编辑的一段字符串格式的html识别为标签，需要基于dangerouslySetInnerHTML
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: info?.body }}
        ></div>
      ) : (
        <SkeletonAgain />
      )}
      {/* 底部图标 */}
      <div className="tab-bar">
        <div
          className="back"
          onClick={() => {
            navigate(-1);
          }}
        >
          <LeftOutline />
        </div>
        <div className="icons">
          <Badge content={story?.comments || 0}>
            <MessageOutline />
          </Badge>
          <Badge content={(story && story.popularity) || 0}>
            <LikeOutline />
          </Badge>
          <span className={isCollect ? "stored" : ""} onClick={collectHandle}>
            {loading ? <SpinLoading /> : <StarOutline />}
          </span>
          <span>
            <MoreOutline />
          </span>
        </div>
      </div>
    </DetailStyle>
  );
};

export default connect(
  (state) => {
    return {
      profile: state.base.profile,
      nightMode: state.base.nightMode,
      collectList: state.collect.list,
    };
  },
  {
    queryLoginInfo: action.base.queryLoginInfo,
    queryStoreList: action.collect.queryStoreList,
    removeStore: action.collect.removeStore,
  }
)(Detail);
