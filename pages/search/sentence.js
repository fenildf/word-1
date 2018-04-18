// pages/search/sentence.js

const { httpGet } = require('../../resource/util/functions.js');
const { WORD_SENTENCE } = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        word: '',
        sentence: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const word = options.word;
        this.getSentence(word);
        this.setData({
            word
        });
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

})