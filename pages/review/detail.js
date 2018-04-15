// pages/review/detail.js
const { httpPost } = require('../../resource/util/functions.js');
const { GET_LEVEL_WORDS, PHONETIC_API } =require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        level: 1,
        index: 0,
        isfirst: 0,               // 是否第一个单词
        islast: 0,                // 是否最后一个单词
        words: [],
        word:'',
        phonetic: '',
        explains:[],
        innerAudioContext: null   // 发音文件
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        this.setData({ level: parseInt(options.level) });
        this.setData({ index: parseInt(options.index) });
        this.get_word_list().then(function () {
            that.render();
        });
    },

    /**
     * 获取关卡词汇
     */
    get_word_list: function () {
        let that = this;
        let url = GET_LEVEL_WORDS + this.data.level;
        let data = { cust_id: wx.getStorageSync('cust_id') };
        return httpPost(url, data).then(function (data) {
            if (data.code == 0) {
                const words = data['data'];                
                that.setData({ words: words });                
            }
        });
    },

    back: function () {        
        wx.navigateBack({
            delta: 1
        });
    },

    prev: function () {        
        this.setData({ index: this.data.index - 1 });
        if (this.data.innerAudioContext) {
            this.data.innerAudioContext.stop();
        }
        this.render();
    },

    next: function () {        
        this.setData({ index: this.data.index + 1 });
        if (this.data.innerAudioContext) {
            this.data.innerAudioContext.stop();
        }
        this.render();
    },

    render: function () {        
        const isfirst = this.data.index == 0 ? 1 : 0;
        const islast = this.data.index == this.data.words.length - 1 ? 1 : 0;
        this.setData({ isfirst: isfirst });
        this.setData({ islast: islast });
        this.setData({ word: this.data.words[this.data.index]['word'] });
        this.setData({ phonetic: this.data.words[this.data.index]['us_phonetic'] });
        let explains = this.data.words[this.data.index]['explains'].split('|');
        explains.pop();
        this.setData({ explains: explains });
        if (wx.getStorageSync('autoPlayPhonetic') != 0) {
            this.playVoice();
        }
    },

    playVoice: function () {
        const src = PHONETIC_API + this.data.word;
        const innerAudioContext = wx.createInnerAudioContext();
        this.setData({ innerAudioContext: innerAudioContext });
        innerAudioContext.autoplay = true;
        innerAudioContext.src = src;
    },

    begin: function () {
        wx.navigateTo({
            url: '/pages/review/test?level=' + this.data.level,
        });
    }
})