// pages/review/words.js
const { httpPost, preventDoubleClick } = require('../../resource/util/functions.js');
const { GET_LEVEL_WORDS } = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        level: 1,
        first: 0,
        end: 0,
        words: [],
        word_list: [],             // 处理过的词汇   
        user_lexicon_cnname: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const level = options.level;
        this.setData({ level: level });
        wx.setNavigationBarTitle({
            title: 'Stage ' + level,
        })
        this.get_word_list();
    },

    /**
     * 获取关卡词汇
     */
    get_word_list: function () {
        let that = this;
        let url = GET_LEVEL_WORDS + this.data.level;
        let data = { cust_id: wx.getStorageSync('cust_id') };
        httpPost(url, data).then(function (data) {
            if (data.code == 0) {
                const words = data['data'];
                const new_words = [];
                for (let i = 0; i < words.length; i++) {
                    let id = words[i]['id'];
                    let word = words[i]['word'];
                    let explain = words[i]['explains'].replace(/\|/g, ' ');
                    let new_word = { 'id': id, 'word': word, 'explain': explain };
                    new_words.push(new_word);
                }
                that.setData({ words: words });
                that.setData({ word_list: new_words });
            }
        });
    },

    /**
     * 单词详情
     */
    detail: function (event) {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            const index = event.currentTarget.dataset.index;
            wx.navigateTo({
                url: '/pages/review/detail?level=' + this.data.level + '&index=' + index
            });
        }
    },

    /**
     * 开始闯关
     */
    begin: function () {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            wx.navigateTo({
                url: '/pages/review/test?level=' + this.data.level
            });
        }
    }
})