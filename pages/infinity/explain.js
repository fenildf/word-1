const { httpGet, httpPost } = require('../../resource/util/functions.js');

// 常量
const {
    SEARCH_SHARE_IMG,     // 分享极速查词的封面
    SEARCH_WORD,          // 极速查词API
    SEARCH_TALK_IMG,      // 极速查词回答图标
    SEARCH_SOUND_IMG,     // 极速查词发音图标
    SEARCH_LEAVE_IMG,     // 极速查词返回图标
    DEFAULT_AVATAR_IMG,   // 默认用户头像
    PHONETIC_API,         // 音标发音API
    USER_SHARE,           // 用户分享获取金币链接    
    USER_ADD_RELATE,      // 添加好友关系
    WORD_SENTENCE
} = require('../../resource/util/constant.js');

// 用户相关函数
const {
    userLogin,
    getUserConfig,
    getUserInfo,
    getUserLexicon
} = require('../../resource/util/user.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        nickname: '',                       // 昵称
        word: '',                           // 输入框中的字符
        scroll_height: 0,                   // 滚到页面高度
        content: [],                        // 已问的内容
        sentence: [],                       // 例句
        id: 0,                              // 当前激活ID
        toVal: 'w1',                        // 当前激活ID
        avatar: DEFAULT_AVATAR_IMG,         // 默认头像        
        SEARCH_TALK_IMG: SEARCH_TALK_IMG,   // 极速查词回答图标
        SEARCH_SOUND_IMG: SEARCH_SOUND_IMG, // 极速查词发音图标
        SEARCH_LEAVE_IMG: SEARCH_LEAVE_IMG, // 极速查词返回图标
        innerAudioContext: null             // 发音文件
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 屏幕参数
        const res = wx.getSystemInfoSync();
        const windowHeight = res.windowHeight;
        this.setData({ scroll_height: windowHeight - 110 });
        // 头像
        let avatar = wx.getStorageSync('avatarUrl');
        avatar = avatar == '' ? DEFAULT_AVATAR_IMG : avatar;
        this.setData({ avatar: avatar });
        // 昵称
        let nickname = wx.getStorageSync('nickname');
        nickname = (nickname == '' || nickname == '游客') ? 'Friend' : nickname;
        this.setData({ nickname: nickname });       
        // 是否带单词进入
        const word = options.word;
        if (!!word) {
            this.setData({ word: word });
            this.search();
            this.getSentence(word);
        }        
    },    

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (e) {
        let word = '';
        let title = '';
        let path = '';
        if (e.target) {
            word = e.target.dataset.word;
            title = '已翻译：' + word;
            path = '/pages/search/index?scene=share&fromcustid=' + wx.getStorageSync('cust_id') + '&word=' + word;
        } else {
            title = '欢迎使用全民单词';
            path = '/pages/search/index?scene=share&fromcustid=' + wx.getStorageSync('cust_id');
        }
        return {
            title: title,
            path: path,
            imageUrl: SEARCH_SHARE_IMG,
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
     * 输入触发
     */
    input: function (event) {
        this.setData({ word: event.detail.value });
    },

    /**
     * 查词
     */
    search: function () {
        let that = this;
        if (this.data.word.length > 0) {
            this.getSentence(this.data.word);
            this.setData({ id: ++this.data.id });
            let url = SEARCH_WORD + this.data.word;
            httpGet(url).then(data => {
                if (0 == data.code) {
                    let content = that.data.content;
                    let result = data['data'];
                    result['id'] = 'w' + that.data.id;
                    content.push(result);
                    that.setData({ content: content });
                    that.setData({ word: '' });
                    that.setData({ toVal: 'w' + that.data.id });
                }
            });
        }
    },

    /**
     * 播放音标读音
     */
    play: function (event) {
        const word = event.currentTarget.dataset.word;
        if (!!this.data.innerAudioContext) {
            this.data.innerAudioContext.stop();
        }

        const src = PHONETIC_API + word;
        const innerAudioContext = wx.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.src = src;
    },

    /**
     * 获取例句
     */
    getSentence: function (word) {
        const url = WORD_SENTENCE + word;
        const that = this;
        httpGet(url).then(data => {
            if (data.code == 0 && data.data.length > 0) {
                that.setData({
                    sentence: data.data
                });
            }
        })
    },

    /**
     * 跳转例句
     */
    sentence: function (event) {
        const word = event.currentTarget.dataset.word;
        wx.navigateTo({
            url: 'sentence?word=' + word,
        });
    }
})