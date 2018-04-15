// pages/infinity/wait.js

const { httpPost } = require('../../resource/util/functions.js');
const { GET_INFINITY_TEST_WORD, GET_INFINITY_TEST_WORD_V2 } = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        colors: ['#1abc9c', '#34495e', '#f39c12', '#9b59b6', '#3498db', '#e74c3c', '#2ecc71', '#f1c40f'], // 随机背景色
        index: 0,  // 背景色索引
        loader: ['audio.svg', 'ball-triangle.svg', 'bars.svg', 'grid.svg', 'oval.svg', 'puff.svg', 'rings.svg', 'spinning-circles.svg', 'tail-spin.svg', 'three-dots.svg'], // 加载动画
        loader_index: 0,            // 加载动画索引
        title: ['Get ready', 'Go'], // 加载文字
        title_index: 0,             // 加载文字索引
        stop_id: -1                 // 倒计时ID
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const length = this.data.colors.length;
        const index = Math.round(Math.random() * 100) % length;
        this.setData({ index: index });
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: this.data.colors[index],
        });

        const loader_length = this.data.loader.length;
        const loader_index = Math.round(Math.random() * 100) % loader_length;
        this.setData({ loader_index: loader_index });
        const that = this;
        // 复活次数大于0，说明是从首页进入，获取远程获取词库
        if (parseInt(wx.getStorageSync('infinity_recover')) > 0) {
            this.getInfinityTestWord().then(function () {
                const id = setInterval(that.change, 1000);
                that.setData({ stop_id: id });
            });
        } else {            
            const id = setInterval(that.change, 1000);
            that.setData({ stop_id: id });
        }        
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {        
        clearInterval(this.data.stop_id);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {        
        clearInterval(this.data.stop_id);        
    },

    /**
     * 倒计时切换文字
     */
    change: function () {
        const index = this.data.title_index;
        if (this.data.title_index >= this.data.title.length - 1) {
            clearInterval(this.data.stop_id);
            wx.redirectTo({
                url: '/pages/infinity/test'
            });
        } else {
            this.setData({ title_index: index + 1 });
        }
    },

    /**
     * 获取巅峰挑战单词
     */
    getInfinityTestWord: function (version = 1) {
        const cust_id = wx.getStorageSync('cust_id');
        const data = { cust_id: cust_id };
        let url = GET_INFINITY_TEST_WORD;
        if (version != 1) {
            url = GET_INFINITY_TEST_WORD_V2
        }
        
        const that = this;
        return httpPost(url, data).then(data => {
            if (data.code == 0) {
                const infinity_second = data['data']['one_word_second'];
                const word = data['data']['words'];
                wx.setStorageSync('infinity_seconds', infinity_second);
                wx.setStorageSync('infinity_words', word);
            }
        });
    }
})