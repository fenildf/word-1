/**
 * pages/user/index.js
 * 页面功能：个人中心
 * 
 * 页面逻辑说明：
 * onLoad，执行以下操作：
 * 1、读取自动发音配置
 * 2、读取全局音效配置
 * 3、获取用户授权
 * 4、如果用户不同意，设置授权变量为0
 * 5、如果用户同意，设置用户名、性别、头像，设置授权变量为1
 * 6、上传用户资料到服务器
 * 
 * 
 * 涉及数据缓存：
 * 读：autoPlayPhonetic、globalSoundEffect、cust_id、unionid、coin
 * 写：nickname、gender、avatarUrl
 */

const { httpPost, preventDoubleClick } = require('../../resource/util/functions.js');

const {
    UPDATE_USERINFO,
    GET_USER_COIN,
    SET_GLOBAL_SOUND_EFFECT,
    SET_WORD_AUTO_PLAY_PHONETIC,
    DEFAULT_AVATAR_IMG
} = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        coin: 0,                       // 用户目前金币数
        isAuthorize: 1,                // 用户是否授权
        nickName: '游客',              // 用户昵称
        avatarUrl: DEFAULT_AVATAR_IMG, // 用户头像
        gender: 0,                     // 用户性别
        autoPlayPhonetic: 1,           // 自动发音
        globalSoundEffect: 1           // 全局音效
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onLoad: function () {
        this.setData({
            nickName: wx.getStorageSync('nickname'),
            autoPlayPhonetic: wx.getStorageSync('autoPlayPhonetic'),
            globalSoundEffect: wx.getStorageSync('globalSoundEffect'),
            avatarUrl: wx.getStorageSync('avatarUrl'),
        });
        this.getAuthorize().then(this.userAuthorize, this.userReject);
    },

    onShow: function () {
        const url = GET_USER_COIN;
        const data = { cust_id: wx.getStorageSync('cust_id') };
        const that = this;
        httpPost(url, data).then(data => {
            if (data.code == 0) {
                const coin = data['data'];
                that.setData({ coin: coin });
                wx.setStorageSync('coin', coin);
            }
        });
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
        this.setData({ isAuthorize: 1 });
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
        this.setData({ isAuthorize: 0 });
    },

    /**
     * 处理用户授权回调
     */
    userInfoHandler: function (event) {
        if (event.detail.userInfo) {
            this.setData({ isAuthorize: 1 });
            this.updateUserInfo(event.detail.userInfo);
        }
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

    /**
     * 切换全局音效
     */
    toggleSound: function () {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            this.setData({ globalSoundEffect: this.data.globalSoundEffect == 1 ? 0 : 1 });
            wx.setStorageSync('globalSoundEffect', this.data.globalSoundEffect);
            const data = {
                cust_id: wx.getStorageSync('cust_id'),
                global_sound_effect: this.data.globalSoundEffect
            }
            httpPost(SET_GLOBAL_SOUND_EFFECT, data);
        }
    },

    /**
     * 切换自动发音
     */
    togglePhonetic: function () {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            this.setData({ autoPlayPhonetic: this.data.autoPlayPhonetic == 1 ? 0 : 1 });
            wx.setStorageSync('autoPlayPhonetic', this.data.autoPlayPhonetic);
            const data = {
                cust_id: wx.getStorageSync('cust_id'),
                auto_play_phonetic: this.data.autoPlayPhonetic
            }
            httpPost(SET_WORD_AUTO_PLAY_PHONETIC, data);
        }
    },

    /**
     * 功能跳转
     */
    jump: function (event) {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            const id = event.currentTarget.dataset.id;
            let url = '';
            switch (id) {
                case 'lexicon':
                    url = '/pages/lexicon/choice';
                    break;
                case 'signin':                    
                    url = '/pages/user/signin/recite';                    
                    break;
                case 'data':
                    url = '/pages/user/statistics/data';
                    break;
                case 'coindetail':
                    url = '/pages/user/coin/detail';
                    break;
                default:
                    break;
            }
            wx.navigateTo({ url });
        }
    }
})