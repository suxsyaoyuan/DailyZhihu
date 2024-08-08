import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Swiper, Divider, DotLoading, Image } from "antd-mobile";
import { connect } from "react-redux";

import HomeHead from "@/components/HomeHead";
import NewsItem from "@/components/NewsItem";
import SkeletonAgain from "@/components/SkeletonAgain";
import api from "@/api";
import dayjs from "dayjs";

/* 组件样式 */
const HomeStyle = styled.div`
  background-color: ${(props) => (props.nightMode ? "#444" : "#eee")};
  .banner-box {
    height: 375px;
    background-color: #eee;
    .adm-swiper {
      height: 100%;
    }
    .adm-swiper-item {
      position: relative;
      .adm-image,
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
      .content {
        position: absolute;
        bottom: 20px;
        left: 0;
        z-index: 999;
        box-sizing: border-box;
        padding: 0 10px;
        width: 100%;
        .title {
          font-size: 18px;
          color: #fff;
          line-height: 28px;
        }
        .author {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 28px;
        }
      }
    }
    .adm-swiper-indicator {
      left: auto;
      transform: none;
      right: 12px;
      bottom: 12px;
      .adm-page-indicator-dot {
        margin-right: 6px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        &.adm-page-indicator-dot-active {
          width: 18px;
          border-radius: 3px;
          background: #fff;
        }
      }
    }
  }

  .news-box {
    margin-top: 20px;
    padding: 0 10px;
    .adm-divider-horizontal {
      font-size: 12px;
    }
  }

  .load-more {
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-size: 12px;
    color: #999;
    background: #eee;
    letter-spacing: 3px;
  }
`;

const Home = function Home({ navigate, nightMode }) {
  // 定义状态
  let [today, setToday] = useState(() => dayjs().format("YYYYMMDD"));
  //   let [today, setToday] = useState(_.format(null, "{0}{1}{2}"));

  let [bannerData, setBannerData] = useState([]);
  let [newsList, setNewsList] = useState([]);
  let loadBox = useRef();
  // 拿到dom元素

  // 第一次渲染完组件：向服务器发送请求，获取今日新闻列表
  const initData = async () => {
    try {
      let { date, stories, top_stories } = await api.queryNewsLatest();
      setToday(date);
      setBannerData(top_stories);
      setNewsList([
        {
          date,
          stories,
        },
      ]);
    } catch (_) {}
  };
  useEffect(() => {
    initData();
  }, []);

  // 第一次渲染完组件：获取加载更多的元素，基于 IntersectionObserver 进行监听（设置监听器），实现触底加载
  let isRun = false;
  const queryMoreData = async () => {
    try {
      // 取出今天日期获取昨日新闻 然后发请求
      let time = newsList[newsList.length - 1].date;
      let result = await api.queryNewsBefore(time);
      newsList.push(result);
      setNewsList([...newsList]);
    } catch (_) {}
  };
  useEffect(() => {
    let temp = loadBox.current;
    // console.log(temp;
    let ob = new IntersectionObserver(async (changes) => {
      let { isIntersecting } = changes[0];
      // 只监听一个
      if (isIntersecting) {
        // true 加载更多的按钮出现在视口当中了 滚动到底部了
        if (isRun) return;
        isRun = true;
        await queryMoreData();
        isRun = false;
      }
    });
    ob.observe(temp);
    // 手动设置的监听器 组件释放时 react内部不会移除 要手动移除
    return () => {
      // 组件销毁后 或者 newsList状态改变(产生新闭包之前)，都会执行这个函数 移除监听再等于null
      // 组件完全释放后触发的 虚拟dom已经移除 元素已经不存在 是null 所以要提前赋给一个变量
      ob.unobserve(temp);
      ob = null;
    };
  }, [newsList]);

  return (
    <HomeStyle nightMode={nightMode}>
      {/* 头部 */}
      <HomeHead today={today} />

      {/* 轮播图 */}
      <div className="banner-box">
        {bannerData.length > 0 ? (
          <Swiper autoplay loop>
            {/* 循环创建 */}
            {bannerData.map((item) => {
              let { id, image, title, hint } = item;
              return (
                <Swiper.Item
                  key={id}
                  onClick={() => {
                    navigate(`/detail/${id}`);
                  }}
                >
                  {/* 延迟加载 进来先只加载一个 */}
                  <Image src={image} lazy />
                  <div className="content">
                    <h3 className="title">{title}</h3>
                    <p className="author">{hint}</p>
                  </div>
                </Swiper.Item>
              );
            })}
          </Swiper>
        ) : null}
      </div>

      {/* 新闻列表 */}
      {newsList.length > 0 ? (
        <>
          {newsList.map((item, index) => {
            let { date, stories } = item;
            return (
              <div className="news-box" key={date}>
                {/* 索引为0 不需要divider */}
                {index > 0 ? (
                  <Divider contentPosition="left">
                    {dayjs(date).format("MM月DD日")}
                  </Divider>
                ) : null}
                <div className="news-list">
                  {stories.map((cur) => {
                    return <NewsItem key={cur.id} info={cur} />;
                  })}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <SkeletonAgain />
      )}

      {/* 加载更多 */}
      <div
        className="load-more"
        ref={loadBox}
        style={{
          display: newsList.length > 0 ? "block" : "none",
        }}
      >
        数据加载中
        <DotLoading />
        {/* 基于数据控制元素显示隐藏：1.控制是否渲染 2.控制元素样式display */}
      </div>
    </HomeStyle>
  );
};
export default connect((state) => state.base)(Home);
