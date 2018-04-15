const {
    INFINITY_COVER_IMG,  // 分享封面
    USER_ADD_RELATE,     // 添加好友关系URL
    UPDATE_USERINFO,     // 更新用户信息URL
    ADD_TEMPLATE_FORMID, // 添加模板消息ID
} = require('../../resource/util/constant.js');

const { httpPost, preventDoubleClick } = require('../../resource/util/functions.js');

const { infinityShareMessage } = require('../../resource/util/user.js');

// 用户相关函数
const {
    userLogin,     // 用户登录
    getUserConfig, // 获取用户配置
    getUserInfo,   // 获取用户信息
    getUserLexicon // 获取用户词库
} = require('../../resource/util/user.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        width: 0,          // 屏幕宽度
        height: 0,         // 屏幕高度
        cloud1_width: 0,   // 云1宽度
        cloud1_height: 0,  // 云1高度
        cloud2_width: 0,   // 云2宽度
        cloud2_height: 0,  // 云2高度
        show_button: 0,    // 显示按钮
        source: 'app',     // 启动来源        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 设置屏幕大小
        
        // 启动来源
        const scene = options.scene;
        const source = options.scene == 'share' ? 'share' : 'app';
        const that = this;
        // 如果是点击转发链接进来的，要先完成登陆动作
        if (source == 'share') {
            this.setData({ source: source });
            wx.showLoading({
                title: '用户登陆中',
            });
            // 用户登录-->获取用户配置-->获取用户个人信息-->获取用户词库        
            userLogin(this)
                .then(getUserConfig)
                .then(getUserInfo)
                .then(getUserLexicon)
                .then(wx.hideLoading)
                .then(this.getAuthorize)
                .then(this.userAuthorize, this.userReject)
                .then(function () {
                    that.setData({ show_button: 1 });
                    const from_cust_id = parseInt(options.fromcustid);
                    if (from_cust_id && wx.getStorageSync('cust_id') != from_cust_id) { // 如果是别人点击进来的，加入好友列表
                        console.log('添加好友关系');
                        const url = USER_ADD_RELATE;
                        const data = {
                            cust_id: wx.getStorageSync('cust_id'),
                            rela_cust_id: from_cust_id
                        };
                        httpPost(url, data);
                    }
                });
        } else {
            this.getAuthorize()
                .then(this.userAuthorize, this.userReject)
                .then(function () {
                    that.setData({ show_button: 1 });
                });
        }
    },

    onReady: function () {
        const res = wx.getSystemInfoSync();
        const width = res.windowWidth;
        const height = res.windowHeight;
        this.setData({ width, height }); 
        console.log(res);
        
        // 设置云1大小
        const c1w = width / 1181 * 209;
        const c1h = height / 1772 * 127;
        this.setData({ 
            cloud1_width: c1w,
            cloud1_height: c1h
        });        
        // 设置云2大小
        const c2w = width / 1181 * 266;
        const c2h = height / 1772 * 161;
        this.setData({ 
            cloud2_width: c2w,
            cloud2_height: c2h
        });
    },

    /**
     * 每次显示都删除之前的缓存
     */
    onShow: function () {
        wx.removeStorageSync('infinity_words');   // 移除巅峰挑战考核单词
        wx.removeStorageSync('infinity_seconds'); // 移除巅峰挑战每词时间
        wx.removeStorageSync('infinity_recover'); // 移除巅峰挑战复活机会
        wx.removeStorageSync('infinity_score');   // 移除巅峰挑战开局分数
    },

    /**
     * 页面卸载
     */
    onUnload: function () {
        wx.removeStorageSync('infinity_time');    // 移除巅峰挑战答题时间
        wx.removeStorageSync('infinity_words');   // 移除巅峰挑战考核单词
        wx.removeStorageSync('infinity_seconds'); // 移除巅峰挑战每词时间
        wx.removeStorageSync('infinity_recover'); // 移除巅峰挑战复活机会
        wx.removeStorageSync('infinity_score');   // 移除巅峰挑战开局分数
    },

    /**
     * 开始游戏
     */
    begin: function (e) {        
        if (!this.data.buttonClicked)
        { 
            preventDoubleClick(this);
            const formId = e.detail.formId;
            const url = ADD_TEMPLATE_FORMID;
            const data = {
                cust_id: wx.getStorageSync('cust_id'),
                token: formId,
                source: 'GOW_INFINITY_BEGIN'
            };
            httpPost(url, data).then(data => {
                if (data.code == 0) {                    
                    wx.setStorageSync('infinity_time', 0);     // 设置巅峰挑战答题时间
                    wx.setStorageSync('infinity_recover', 1);  // 设置复活机会为1
                    wx.setStorageSync('infinity_score', 0);    // 设置巅峰挑战开局分数
                    wx.setStorageSync('infinity_stop_pos', 0); // 设置巅峰挑战开局索引
                    wx.navigateTo({
                        url: '/pages/infinity/wait'
                    });
                }
            });            
        }        
    },

    /**
     * 我的排名
     */
    leaderboard: function () {
        if (!this.data.buttonClicked)
        {
            preventDoubleClick(this);            
            wx.navigateTo({
                url: '/pages/infinity/leaderboard',
            });
        }        
    },

    /**
     * 返回
     */
    goback: function () {
        if (!this.data.buttonClicked)
        {            
            if (this.data.source == 'app') {
                wx.navigateBack({
                    delta: 1
                });
            }
            else {
                wx.reLaunch({
                    url: '/pages/home/index',
                });
            }
        }        
    },

    /**
     * 分享转发
     */
    onShareAppMessage: function () {
        if (!this.data.buttonClicked)
        {
            return infinityShareMessage();
        }        
    },

    /**
     * 获取用户授权
     */
    getAuthorize: function () {
        let promise = new Promise(function (resolve, reject) {
            wx.getSetting({
                success(res) {
                    if (!res.authSetting['scope.userInfo']) {
                        wx.authorize({
                            scope: 'scope.userInfo',
                            success() {
                                resolve();
                            },
                            fail() {
                                reject();
                            }
                        });
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
        return promise;
    },

    /**
     * 用户同意授权
     */
    userAuthorize: function () {
        const that = this;
        wx.getUserInfo({
            lang: 'zh_CN',
            success: function (res) {
                const userInfo = res.userInfo;
                that.updateUserInfo(userInfo);
            }
        })
    },

    /**
     * 用户拒绝授权
     */
    userReject: function () {
        ; // 不需要执行操作
    },

    /**
     * 更新用户资料到服务器
     */
    updateUserInfo: function (userInfo) {
        this.setData({ 
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender
        });        
        wx.setStorageSync('nickname', userInfo.nickName);
        wx.setStorageSync('gender', userInfo.gender);
        wx.setStorageSync('avatarUrl', userInfo.avatarUrl);
        userInfo.cust_id = wx.getStorageSync('cust_id');
        userInfo.unionid = wx.getStorageSync('unionid');
        return httpPost(UPDATE_USERINFO, userInfo);
    },
})
