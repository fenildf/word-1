/**
 * pages/recite/detail.js
 * 页面功能：单词详情页（此页面逻辑已完成）
 * 页面逻辑说明：
 * onLoad后，执行以下操作：
 * 1、读取今日签到单词列表
 * 2、获取当前单词索引
 * 3、读取每日的考核单词数
 * 4、构建本页单词，判断是否自动发音
 * 
 * 涉及数据缓存：
 * 读：user_today_words、auto_play_phonetic
 */
const { PHONETIC_API, SEARCH_SOUND_IMG, WORD_SENTENCE } = require('../../resource/util/constant.js');
const { httpGet } = require('../../resource/util/functions.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        index: 0,                          // 目前的单词索引
        isfirst: 0,                        // 是否第一个单词
        islast: 0,                         // 是否最后一个单词
        daily_word: 0,                     // 每日签到单词数
        words: [],                         // 单词列表
        word: '',                          // 单词本身
        phonetic: '',                      // 音标
        explains: [],                      // 含义        
        sentence: [],                      // 例句
        state: false,                      // 查看例句按钮
        innerAudioContext: null,           // 发音文件        
        SEARCH_SOUND_IMG: SEARCH_SOUND_IMG // 发音图标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const words = wx.getStorageSync('user_today_words');
        const index = parseInt(options.index);
        this.setData({
            words, index, daily_word: wx.getStorageSync('user_daily_word_count')
        });
        this.render();
    },

    /**
     * 返回签到词汇列表页
     */
    back: function () {
        if (!!this.data.innerAudioContext) {
            this.data.innerAudioContext.stop();
        }
        wx.navigateBack({
            delta: 1
        });
    },

    /**
     * 上一个单词
     */
    prev: function () {
        this.setData({ index: this.data.index - 1 });
        if (this.data.innerAudioContext) {
            this.data.innerAudioContext.stop();
        }
        this.render();
    },

    /**
     * 下一个单词
     */
    next: function () {
        this.setData({ index: this.data.index + 1 });
        if (this.data.innerAudioContext) {
            this.data.innerAudioContext.stop();
        }
        this.render();
    },

    /**
     * 渲染页面
     */
    render: function () {
        const isfirst = this.data.index == 0 ? 1 : 0;
        const islast = this.data.index == this.data.words.length - 1 ? 1 : 0;
        this.setData({
            state: false,
            sentence: [],
            isfirst: isfirst,
            islast: islast,
            word: this.data.words[this.data.index]['word'],
            phonetic: this.data.words[this.data.index]['us_phonetic']
        });
        let explains = this.data.words[this.data.index]['explains'].split('|');
        explains.pop();
        this.setData({ explains: explains });
        this.getSentence(this.data.words[this.data.index]['word']);
        if (wx.getStorageSync('autoPlayPhonetic') != 0) {
            this.playVoice();
        }
    },

    /**
     * 播放读音
     */
    playVoice: function () {
        if (!!this.data.innerAudioContext) {
            this.data.innerAudioContext.stop();
        }

        const src = PHONETIC_API + this.data.word;
        const innerAudioContext = wx.createInnerAudioContext();
        this.setData({ innerAudioContext: innerAudioContext });
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
            if (data.code == 0) {
                that.setData({
                    sentence: data.data
                });
            }
        })
    },

    /**
     * 改变例句按钮状态
     */
    changeState: function () {
        const that = this;
        this.setData({
            state: !this.data.state
        }, function () {
            if (that.data.state) {
                const query = wx.createSelectorQuery();
                query.select('#btn-sent').fields({
                    size: true,
                    rect: true
                }, function (res) {                    
                    wx.pageScrollTo({
                        scrollTop: res.top - 140 - 20  // 140是顶部高度，20是与顶部边距
                    });
                }).exec()
            }            
        });
    }
})