/**
 * pages/recite/words.js
 * 页面功能：签到词汇列表页（此页面逻辑已完成）
 * 页面逻辑说明：
 * onLoad后，执行以下操作：
 * 1、获取系统屏幕宽度，适配背景图片宽度和高度
 * 2、读取当前签到的词库ID，和每日的考核单词数
 * 3、获取今日签到单词列表
 * 
 * onShow，都会读取今天签到是否已经完成
 * 
 * 点击单词可以，进入单词详情页
 * 点击开始考核，进入签到考核页
 * 点击签到成功，提示用户明天再来打卡
 * 
 * 涉及数据缓存：
 * 读：user_lexicon_id、user_daily_word_count、is_pass_today、unionid
 * 写：user_today_words
 */

const { httpPost, preventDoubleClick } = require('../../resource/util/functions.js');
const { GET_TODAY_WORDS, GET_SIGNIN_STATE, ADD_TEMPLATE_FORMID } = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        width: 0,
        height: 0,
        lexicon_id: 1,             // 用户词库ID
        lexicon_name: '',          // 用户词库名
        daily_word: 1,             // 用户每天新词数        
        word_list: [],             // 处理过的词汇
        progress: 0,               // 进度量
        is_pass_today: -1,         // 今天是否完成
        marginTop: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const res = wx.getSystemInfoSync();
        const width = res.windowWidth;
        const height = width / 828 * 360;

        const lexicon_id = wx.getStorageSync('user_lexicon_id');
        const lexicon_name = wx.getStorageSync('user_lexicon_name');

        let promise = new Promise((resolve, reject) => {
            this.setData({
                width,
                height,
                lexicon_id,
                lexicon_name                
            });
            resolve();
        });

        promise.then(this.adjustLexiconTitle);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            daily_word: wx.getStorageSync('user_daily_word_count')
        });
        this.getWordList().then(this.getSigninState);
    },

    onUnload: function () {
        wx.removeStorageSync('user_today_words');
    },

    /**
     * 适配封面图
     */
    adjustLexiconTitle: function () {
        const that = this;
        const query = wx.createSelectorQuery();
        query.select('#lexicon-name').fields({
            rect: true, size: true
        }, function (res) {            
            const height = res.height;
            const marginTop = that.data.height + height;
            that.setData({
                marginTop
            });
        }).exec();
    },

    /**
     * 获取今日签到单词列表
     */
    getWordList: function () {
        const that = this;
        const url = GET_TODAY_WORDS;
        const data = { cust_id: wx.getStorageSync('cust_id') };
        return httpPost(url, data).then(function (data) {
            if (data.code == 0) {
                const words = data['data'];                               // 今天要考的单词        
                words.reverse();                                          // 逆序今天要考的单词
                const new_words = [];                                     // 原始解释中带有|，替换成分号
                for (let i = 0; i < words.length; i++) {
                    let id = words[i]['id'];
                    let word = words[i]['word'];
                    let explain = words[i]['explains'].replace(/\|/g, ';');
                    explain = explain.slice(0, -1);
                    let new_word = { 'id': id, 'word': word, 'explain': explain };
                    new_words.push(new_word);
                }
                wx.setStorageSync('user_today_words', words);           // 缓存今天要考的单词
                that.setData({ word_list: new_words });                 // 设置单词列表                
            }
        });
    },

    /**
     * 查看单词详情
     */
    detail: function (event) {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            const index = event.currentTarget.dataset.index;
            wx.navigateTo({
                url: '/pages/recite/detail?index=' + index
            });
        }
    },

    /**
     * 切换词库
     */
    choice: function () {
        wx.navigateTo({
            url: '/pages/lexicon/choice'
        });
    },

    /**
     * 开始签到考核
     */
    begin: function (e) {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            const formId = e.detail.formId;
            const url = ADD_TEMPLATE_FORMID;
            const data = {
                cust_id: wx.getStorageSync('cust_id'),
                token: formId,
                source: 'GOW_RECITE'
            };
            httpPost(url, data).then(data => {
                if (data.code == 0) {
                    wx.navigateTo({
                        url: '/pages/recite/test'
                    });
                }
            });
        }
    },

    /**
     * 完成签到
     */
    finish: function () {
        wx.showModal({
            content: '今日已完成签到',
            showCancel: false,
            confirmText: '好的'
        });
    },

    /**
     * 获取签到状态
     */
    getSigninState: function () {
        const url = GET_SIGNIN_STATE;
        const data = { cust_id: wx.getStorageSync('cust_id') };
        const that = this;
        httpPost(url, data).then(data => {
            if (0 == data.code) {
                that.setData({ is_pass_today: data['data']['signin'] });
                wx.setStorageSync('is_pass_today', data['data']['signin']);
            }
        });
    }
})