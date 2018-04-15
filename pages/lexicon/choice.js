/**
 * pages/lexicon/choice.js
 * 页面功能：签到词库选择页（此页面逻辑已完成）
 * 
 * 页面逻辑说明：
 * onLoad，执行以下操作：
 * 1、获取系统词库列表
 * 2、点击单个词库后，跳转到每日签到词汇数页
 */

// 网络请求
const { httpGet, preventDoubleClick } = require('../../resource/util/functions.js');
// 词库列表、词库封面常量
const { GET_LEXICON_LIST } = require('../../resource/util/constant.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        lexicons: [],
        colors: ['#ffa68f', '#ff4867', '#18b29d', '#716DF9', '#44617b'],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;
        const url = GET_LEXICON_LIST;
        httpGet(url).then(function (data) {
            if (data.code == 0) {
                const lexicon = data['data'];
                that.setData({ lexicons: lexicon });
            }
        });
    },

    onReady: function () {
        wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#ffffff',
        });
    },

    /**
     * 选择词库
     */
    choice: function (event) {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            const id = event.currentTarget.dataset.id;
            const word_count = event.currentTarget.dataset.words;
            const url = '/pages/lexicon/daily?id=' + id;            
            wx.navigateTo({ url });
        }
    }
})