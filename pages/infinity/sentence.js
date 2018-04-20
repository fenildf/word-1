// pages/infinity/sentence.js

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
                }, function () {
                    const final = new Array;
                    const reg = new RegExp("(" + that.data.word + ")", 'gi');
                    for (let i = 0; i < that.data.sentence.length; i++) {
                        const sent = that.data.sentence[i].orig;
                        let array = sent.split(reg);
                        let result = new Array;
                        for (let j = 0; j < array.length; j++) {
                            if (array[j].toLowerCase() == that.data.word.toLowerCase()) {
                                result.push({
                                    word: array[j],
                                    flag: true
                                });
                            } else {
                                result.push({
                                    word: array[j],
                                    flag: false
                                });
                            }
                        }
                        final.push(result);
                    }
                    that.setData({
                        sentences: final
                    });
                });
            }
        })
    }
})