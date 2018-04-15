// pages/infinity/leaderboard.js
const { httpPost, httpGet } = require('../../resource/util/functions.js');
const {
    GET_WORLD_LEADERBOARD,
    GET_FRIEND_LEADERBOARD,
    GET_SEASON_COUNTDOWN,
    GET_LEADERBOARD,
    INFINITY_COVER_IMG,
    USER_SHARE
} = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        width: 0,                 // 页面宽度
        height: 0,                // 页面高度            
        world_board: [],          // 世界排行榜
        world_rank: 999,          // 世界排行榜排名
        friend_board: [],         // 好友排行榜
        friend_rank: 999,         // 好友排行榜排名
        countdown_text: '距离赛季结束还有: ',       // 赛季结束时间文字
        season_end_time: 0,       // 赛季结束时间
        stop_countdown: -1,       // 停止计时器
        share_text: '分享战绩',    // 分享按钮文字
        // 样式
        swiper_height: 0,         // 滑动面板高度
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const res = wx.getSystemInfoSync();
        const width = res.windowWidth;
        const height = res.windowHeight;
        this.setData({
            width,
            height
        });
        this.getLeaderboard().then(this.initStyle);
    },

    onReady: function () {
        wx.setNavigationBarTitle({
            title: '世界排行榜',
        });
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        clearInterval(this.data.stop_countdown);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const cust_id = wx.getStorageSync('cust_id');
        const board = this.data.world_board;
        let score = 0;
        for (let i = 0; i < board.length; i++) {
            let item = board[i];
            if (item['cust_id'] == cust_id) {
                score = item['score'];
                break;
            }
        }

        return {
            title: '我在全民单词中斩获单词' + score + '分，你能超过我吗？',
            path: '/pages/infinity/index?scene=share&fromcustid=' + cust_id,
            success: function (res) {
                const url = USER_SHARE;
                const data = { cust_id: wx.getStorageSync('cust_id') };
                httpPost(url, data).then(data => {
                    if (data.code == 0) {
                        const addcoin = data['data']['addcoin'];
                        const coin = data['data']['coin'];
                        let title = '分享成功';
                        if (addcoin > 0) {
                            title = '分享 +' + addcoin + '金币';
                        }
                        wx.setStorageSync('coin', coin);
                        wx.showToast({
                            title: title,
                            icon: 'success'
                        });
                    }
                });
            },
            fail: function (res) {
                if (res.errMsg == 'shareAppMessage:fail cancel') {
                    wx.showToast({
                        title: '已取消分享',
                        icon: 'none'
                    });
                }
            }
        }
    },

    /**
     * 初始化样式
     */
    initStyle: function () {
        const that = this;
        const query = wx.createSelectorQuery();
        query.selectAll('.header, .btn-share').fields({
            rect: true
        }, function (res) {
            const header = res[0];
            const btn = res[1];
            const top = header.bottom;
            const bottom = btn.top;
            const height = bottom - top - 30;
            that.setData({ swiper_height: height });
        }).exec();
    },

    /**
     * 切换
     */
    swiperChange: function (event) {
        const id = event.detail.current;
        const title = id == 0 ? '世界排行榜' : '好友排行榜';
        const text = id == 0 ? '分享战绩' : '邀请好友';
        this.setData({ share_text: text });
        wx.setNavigationBarTitle({
            title: title
        });
    },

    /**
     * 赛季结束倒计时
     */
    seasonCountDown: function () {
        let timestamp = this.data.season_end_time;
        let begin = new Date;
        let duration = Math.floor((timestamp - begin.getTime()) / 1000);  // 两个日期的时间差
        if (duration <= 0) {
            this.setData({ countdown_text: '赛季已结束' });
        }
        else {
            let days = Math.floor(duration / 86400);
            let temp2 = duration - days * 86400;
            let hour = Math.floor(temp2 / 3600);
            let mins = Math.floor((temp2 - hour * 3600) / 60);
            let sec = temp2 - hour * 3600 - mins * 60;

            if (days > 0) {
                if (hour == 0) {
                    this.setData({ countdown_text: '距离赛季结束还有: ' + days + '天' + hour + '小时' + mins + '分' });
                } else {
                    this.setData({ countdown_text: '距离赛季结束还有: ' + days + '天' + hour + '小时' });
                }
            }
            else if (hour > 0) {
                this.setData({ countdown_text: '距离赛季结束还有: ' + hour + '小时' + mins + '分' });
            }
            else {
                this.setData({ countdown_text: '距离赛季结束还有: ' + mins + '分' + sec + '秒' });
            }
        }
    },

    /**
     * 获取排行榜
     */
    getLeaderboard: function () {
        const that = this;
        const url = GET_LEADERBOARD;
        const data = { cust_id: wx.getStorageSync('cust_id') };
        return httpPost(url, data).then(data => {
            if (data.code == 0) {
                const world = data.data.world;
                const friend = data.data.friend;
                const timestamp = data.data.timestamp;
                const id = setInterval(that.seasonCountDown, 1000);
                that.setData({
                    world_board: world['board'],
                    world_rank: world['user_rank'],
                    friend_board: friend['board'],
                    friend_rank: friend['user_rank'],
                    season_end_time: timestamp,
                    stop_countdown: id
                });
            }
        });
    },

    worldRankInfo: function (event) {
        const index = event.currentTarget.dataset.index;
        const item = this.data.world_board[index];
        const score = item.score;
        const time = item.time;
        const word = item.word;
        const rank = item.rank;
        const nickname = item.nickname;

        wx.showModal({
            title: nickname,
            content: '得分：' + score + '\n单词数：' + word + '\n世界排名：' + rank,
            showCancel: false,
            confirmText: '厉害',
        });
    },

    friendRankInfo: function (event) {
        const index = event.currentTarget.dataset.index;
        const item = this.data.friend_board[index];
        const score = item.score;
        const time = item.time;
        const word = item.word;
        const rank = item.rank;
        const nickname = item.nickname;

        wx.showModal({
            title: nickname,
            content: '得分：' + score + '\n单词数：' + word + '\n好友排名：' + rank,
            showCancel: false,
            confirmText: '厉害',
        });
    }
})