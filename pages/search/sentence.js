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
                }, function () {
                    that.test(data.data, word);
                });
            }
        })
    },

    findIndex: function (sentence, word) {
        const reg = new RegExp(word, 'g');
        let index = new Array;
        while ((match = reg.exec(sentence)) !== null) {
            index.push(match.index);            
        }        
    },

    test: function () {
        for (let i = 0; i < this.data.sentence.length; i++) {
            const sent = this.data.sentence[i].orig;
            let array = sent.split(this.data.word);
            for (let j = 0; j < array.length; j++) {
                if (j != array.length - 1) {
                    console.log(array[j]);
                    console.log(this.data.word);
                } else {
                    console.log(array[j]);
                    console.log('换行');
                }
            }
        }
    }

})