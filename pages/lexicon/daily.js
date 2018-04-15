/**
 * pages/lexicon/daily.js
 * 页面功能：选择每天打卡数量页（此页面逻辑已完成）
 * 
 * 页面逻辑说明：
 * onLoad，执行以下操作：
 * 1、获取当前选择的词库信息（词库名、参与用户数、词汇量、难度系数）
 * 2、获取每天打卡数量选项
 * 3、用户点击确定后，发送新词库配置到服务器
 * 
 * 涉及数据缓存：
 * 写：user_lexicon_id
 */

// 网络请求
const { httpGet, httpPost } = require('../../resource/util/functions.js');
// 设置词库、获取词库信息、打卡选项
const { SET_USER_LEXICON, GET_LEXICON_INFO, GET_DAILY_WORD_COUNT_OPTIONS } = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        lexicon_id: 1,    // 选择的词库ID
        name: '',         // 选择的词库名称
        word_count: 0,    // 词库词汇量
        daily_count: 0,   // 每日词汇量
        daily_option: [], // 每次词汇选项                        
        check: false      // 已选中签到数量
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const id = options.id;
        this.setData({ lexicon_id: id });

        const that = this;
        const url = GET_LEXICON_INFO + '?lexicon_id=' + id;
        httpGet(url).then(data => {
            if (data.code == 0) {
                that.setData({
                    name: data['data']['name'],
                    word_count: data['data']['word_count']
                });
            }
        }).then(this.getDailyWordCountOption);
    },

    /**
     * 获取每天打卡数量配置
     */
    getDailyWordCountOption: function () {
        const url = GET_DAILY_WORD_COUNT_OPTIONS;
        const that = this;
        httpGet(url).then(function (data) {
            if (data.code == 0) {
                const options = data['data'];
                const word_count = that.data.word_count
                let result = [];
                for (let i = 0; i < options.length; i++) {
                    let v = options[i];
                    let l = Math.ceil(word_count / v);
                    let obj = { word: v, level: l, checked: false };
                    result.push(obj);
                }
                that.setData({ daily_option: result });
            }
        });
    },

    /**
     * 用户选择每天新词数
     */
    clickChange: function (event) {
        const index = event.currentTarget.dataset.index;
        this.setData({ daily_count: event.currentTarget.dataset.value });
        const options = this.data.daily_option;
        for (let i = 0; i < options.length; i++) {
            options[i]['checked'] = false;
        }
        options[index]['checked'] = true;
        this.setData({ daily_option: options });
    },

    /**
     * 用户确定每天新词数
     */
    dailyChoice: function () {
        const that = this;
        const value = this.data.daily_count;
        const days = Math.ceil(this.data.word_count / value);
        wx.showModal({
            title: '任务概述',
            content: '每天' + value + '个新词, 一共需' + days + '天完成',
            success: function (res) {
                if (res.confirm) {
                    wx.setStorageSync('user_lexicon_id', parseInt(that.data.lexicon_id));
                    that.setUserLexicon(that.data.lexicon_id, that.data.daily_count);
                }
            }
        });
    },

    /**
     * 设置用户词库和每天打卡数
     * @param user_lexicon_id 用户词库ID
     * @param user_daily_word_count 用户每天打卡数
     */
    setUserLexicon: function (user_lexicon_id, user_daily_word_count) {
        // 先清除之前的缓存
        wx.removeStorageSync('user_lexicon_name');
        wx.removeStorageSync('user_lexicon_word_count');
        wx.removeStorageSync('user_daily_word_count');
        wx.removeStorageSync('user_lexicon_cell_word_count');

        const cust_id = wx.getStorageSync('cust_id');
        const url = SET_USER_LEXICON;
        const data = {
            cust_id,
            user_lexicon_id,
            user_daily_word_count
        };
        httpPost(url, data).then(function (data) {
            if (data.code == 0) {
                wx.setStorageSync('user_lexicon_name', data['data']['name']);
                wx.setStorageSync('user_lexicon_word_count', parseInt(data['data']['word_count']));
                wx.setStorageSync('user_lexicon_cell_word_count', parseInt(data['data']['cell_word']));
                wx.setStorageSync('user_lexicon_word_completed', parseInt(data['data']['progress']));
                wx.setStorageSync('user_daily_word_count', parseInt(user_daily_word_count));
                wx.navigateBack({
                    delta: 2
                });
            }
        });
    }
})