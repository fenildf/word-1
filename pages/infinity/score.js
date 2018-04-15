// pages/infinity/score.js

const { 
    httpPost, 
    httpGet,
    preventDoubleClick 
} = require('../../resource/util/functions.js');

const {
    PHONETIC_API,
    UPLOAD_INFINITY_SCORE,
    GET_WORLD_LEADERBOARD,
    GET_FRIEND_LEADERBOARD,
    SEND_INFINITY_RECOVER,
    GET_SEASON_COUNTDOWN,
    GET_LEADERBOARD,
    USER_SHARE,
    BUY_COIN
} = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        width: 0,                 // 页面宽度
        height: 0,                // 页面高度
        score: 0,                 // 最终分数
        index: 0,                 // 错误的词的索引
        pos: -1,                  // 选择的位置
        time: 0,                  // 用时
        words: [],                // 考核的词
        is_season_top: 0,         // 是否本赛季最高分
        is_history_top: 0,        // 是否历史最高分
        history: 0,               // 历史最高分
        season: 0,                // 本赛季最高分
        world_board: [],          // 世界排行榜
        world_rank: 999,          // 世界排行榜排名
        friend_board: [],         // 好友排行榜
        friend_rank: 999,         // 好友排行榜排名
        countdown_text: '距离赛季结束还有: ',       // 赛季结束时间文字
        season_end_time: 0,       // 赛季结束时间
        stop_countdown: -1,       // 停止计时器
        phoneticAudio: null,      // 发音文件
        recover_time: 0,          // 复活次数
        recover_cost: 0,          // 复活代价

        // 样式
        score_board: 0,           // 分数版外间距
        scroll_height: 0,         // 排行榜高度
        cut: 0,                   // more距离
        world: 'btn-active',      // 排行榜类型-世界
        friend: 'btn-inactive',   // 排行榜类型-本地
        scroll_id: 'score-board', // 滚动id        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {        
        const res = wx.getSystemInfoSync();
        const width = res.windowWidth;
        const height = res.windowHeight;
        const index = parseInt(options.i);

        this.setData({ 
            width: width,
            height: height,
            score: parseInt(options.s),
            index: index,
            pos: parseInt(options.p),
            time: (parseFloat(options.t) + parseFloat(wx.getStorageSync('infinity_time'))).toFixed(2),
            words: wx.getStorageSync('infinity_words'),
            recover_time: wx.getStorageSync('infinity_recover')
        });
        
        wx.setStorageSync('infinity_stop_pos', index);
        // 复活代价
        if (index <= 30) {
            this.setData({ recover_cost: 0 });
        } else if (index <= 60) {
            this.setData({ recover_cost: -2 });
        } else if (index <= 100) {
            this.setData({ recover_cost: -5 });
        } else {
            this.setData({ recover_cost: -8 });
        }

        this.upload()                   // 上传成绩
            .then(this.getLeaderboard)  // 获取排行榜
            .then(this.initStyle);      // 设置样式
    },

    onReady: function () {
        wx.setNavigationBarTitle({
            title: '战绩',
        });
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        clearInterval(this.data.stop_countdown);
    },

    /**
     * 继续挑战
     */
    recover: function () {    
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);            
            const that = this;
            const coin = wx.getStorageSync('coin');
            if (coin < Math.abs(this.data.recover_cost)) {
                wx.showActionSheet({
                    itemList: [
                        '金币不足，重新开始', 
                        '继续挑战，0.1元（特惠）', 
                        '继续挑战 + 100金币，3元', 
                        '继续挑战 + 510金币，15元', 
                        '继续挑战 + 1030金币，30元', 
                        '继续挑战 + 2100金币，60元'],                    
                    success: function (res) {
                        const index = res.tapIndex;
                        let money = 0;
                        switch (index) {
                            case 0:
                                that.again();
                                break;
                            case 1:
                                money = 10;
                                break;
                            case 2: 
                                money = 300;
                                break;
                            case 3: 
                                money = 1500;
                                break;
                            case 4:
                                money = 3000;
                                break;
                            case 5:
                                money = 6000;
                                break;
                        }
                        let data = {
                            openid: wx.getStorageSync('openid'),
                            fee: money
                        }
                        let url = BUY_COIN;
                        httpPost(url, data).then(data => {
                            if (data.code == 0) {
                                const pay = data['data'];
                                wx.requestPayment({
                                    timeStamp: String(pay['timeStamp']),
                                    nonceStr: pay['nonceStr'],
                                    package: pay['package'],
                                    signType: pay['signType'],
                                    paySign: pay['paySign'],
                                    success: function (res) {
                                        wx.setStorageSync('infinity_score', that.data.score); // 设置复活分数
                                        wx.setStorageSync('infinity_recover', that.data.recover_time - 1); // 减少复活次数
                                        url = SEND_INFINITY_RECOVER;
                                        data = {
                                            cust_id: wx.getStorageSync('cust_id'),
                                            //recover_cost: that.data.recover_cost
                                            recover_cost: 0
                                        };
                                        httpPost(url, data).then(data => {
                                            if (data.code == 0) {
                                                wx.setStorageSync('coin', data['data']);
                                                wx.setStorageSync('infinity_time', that.data.time);
                                                wx.redirectTo({
                                                    url: '/pages/infinity/wait',
                                                });
                                            } else {
                                                that.setData({ recover_time: 0 });
                                                wx.setStorageSync('infinity_time', 0);     // 设置开局用时为0
                                                wx.setStorageSync('infinity_recover', 0);  // 设置复活机会为1
                                                wx.setStorageSync('infinity_score', 0);    // 设置巅峰挑战开局分数
                                                wx.setStorageSync('infinity_stop_pos', 0); // 设置巅峰挑战开局索引
                                            }
                                        });
                                    },
                                    fail: function (res) {
                                        console.log(res);
                                        if (res.errMsg == 'requestPayment:fail cancel') {
                                            wx.showToast({
                                                title: '已取消购买',
                                                icon: 'none'
                                            });
                                        } else {
                                            wx.showToast({
                                                title: '支付失败',
                                                icon: 'none'
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    },
                });
            }
            else {
                wx.setStorageSync('infinity_score', this.data.score); // 设置复活分数
                wx.setStorageSync('infinity_recover', this.data.recover_time - 1); // 减少复活次数
                const url = SEND_INFINITY_RECOVER;
                const data = {
                    cust_id: wx.getStorageSync('cust_id'),
                    recover_cost: this.data.recover_cost
                };
                httpPost(url, data).then(data => {
                    if (data.code == 0) {
                        wx.setStorageSync('coin', data['data']);
                        wx.setStorageSync('infinity_time', that.data.time);
                        wx.redirectTo({
                            url: '/pages/infinity/wait',
                        });
                    } else {                    
                        that.setData({ recover_time: 0 });
                        wx.setStorageSync('infinity_time', 0);     // 设置开局用时为0
                        wx.setStorageSync('infinity_recover', 0);  // 设置复活机会为1
                        wx.setStorageSync('infinity_score', 0);    // 设置巅峰挑战开局分数
                        wx.setStorageSync('infinity_stop_pos', 0); // 设置巅峰挑战开局索引
                    }
                });
            }
        }
    },

    /**
     * 再来一次
     */
    again: function () {   
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);     
            wx.setStorageSync('infinity_recover', 1);  // 设置复活机会为1
            wx.setStorageSync('infinity_score', 0);    // 设置巅峰挑战开局分数
            wx.setStorageSync('infinity_stop_pos', 0); // 设置巅峰挑战开局索引
            wx.redirectTo({
                url: '/pages/infinity/wait',
            });
        }
    },

    /**
     * 上传成绩
     */
    upload: function () {
        const cust_id = wx.getStorageSync('cust_id');
        const data = {
            cust_id: cust_id,
            score: this.data.score,
            time: this.data.time,
            word: this.data.index,
            source: this.data.recover_time > 0 ? 'INFINITY_SINGLE' : 'INFINITY_RECOVER'
        };
        const url = UPLOAD_INFINITY_SCORE;
        const that = this;
        return httpPost(url, data).then(data => {
            if (data.code == 0) {
                that.setData({ is_season_top: data['data']['is_top'] });
                that.setData({ history: data['data']['history'] });
                that.setData({ season: data['data']['season'] });
                if (that.data.score == that.data.history) {
                    that.setData({ is_history_top: 1 });
                }
            } else {
                wx.showToast({
                    title: '新增记录失败',
                    icon: 'none'
                });
            }
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
                    this.setData({ countdown_text: '距离赛季结束还有: ' + days + '天' + hour + '小时' + mins + '分'});
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
                that.setData({ world_board: world['board'] });
                that.setData({ world_rank: world['user_rank'] });
                that.setData({ friend_board: friend['board'] });
                that.setData({ friend_rank: friend['user_rank'] });
                that.setData({ season_end_time: timestamp });
                let id = setInterval(that.seasonCountDown, 1000);
                that.setData({ stop_countdown: id });
            }
        });
    },

    /**
     * 初始化样式
     */
    initStyle: function () {
        const that = this;
        const query = wx.createSelectorQuery();
        // 查询排行榜头部尺寸，设置排行榜滚动栏高度
        query.select('.header').fields({
            size: true
        }, function (res) {
            const height = res.height;
            const leaderboard_height = that.data.height - 40;
            const scorll_height = leaderboard_height - height;
            that.setData({ scroll_height: scorll_height });
        }).exec();
    },

    /**
     * 切换世界排行
     */
    world: function () {        
        this.setData({ world: 'btn-active' });
        this.setData({ friend: 'btn-inactive' });
    },

    /**
     * 切换好友排行
     */
    friend: function () {        
        this.setData({ friend: 'btn-active' });
        this.setData({ world: 'btn-inactive' });
    },
    
    /**
     * 播放发音
     */
    playVoice: function () {
        
        if (!!this.data.phoneticAudio) {
            this.data.phoneticAudio.stop();
        }
        let src = PHONETIC_API + this.data.words[this.data.index]['word'];
        const innerAudioContext = wx.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.src = src;
        this.setData({ phoneticAudio: innerAudioContext });
    },

    /**
     * 分享转发
     */
    onShareAppMessage: function () {
        return {
            title: '我在全民单词中斩获单词' + this.data.score + '分，你能超过我吗？',
            path: '/pages/infinity/index?scene=share&fromcustid=' + wx.getStorageSync('cust_id'),            
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
     * 切换
     */
    swiperChange: function (event) {
        const id = event.detail.current;
        let title = '';
        switch (id)
        {
            case 0:
                title = '答错单词';
                break;
            case 1:
                title = '战绩';
                break;
            case 2: 
                title = '榜单';
                break;
        }        
        wx.setNavigationBarTitle({
            title: title
        });
    },

    /**
     * 各选手详情
     */
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

    /**
     * 各好友详情
     */
    friendRankInfo: function (event) {
        const index = event.currentTarget.dataset.index;
        const item = this.data.friend_board[index];
        const score = item.score;
        const time = item.time;
        const word = item.word;
        const nickname = item.nickname;
        const rank = item.rank;
        wx.showModal({
            title: nickname,
            content: '得分：' + score + '\n单词数：' + word + '\n好友排名：' + rank,
            showCancel: false,
            confirmText: '厉害',
        });
    },

    /**
     * 完整含义
     */
    explain: function () {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            const word = this.data.words[this.data.index]['word'];        
            wx.navigateTo({
                url: '/pages/infinity/explain?word=' + word
            });            
        }
    }
})