// pages/user/coin/buy.js
const { httpPost, range } = require('../../../resource/util/functions.js');
const { GET_COIN_CONFIG } = require('../../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        coins: [],
        index: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;
        this.getCoinConfig().then(function () {
            const length = that.data.coins.length;
            that.setData({index: range(length / 2)});
        });
    },

    /**
     * 获取金币配置
     */
    getCoinConfig: function () {
        const that = this;
        const url = GET_COIN_CONFIG;
        return httpPost(url).then(data => {
            if (data.code == 0) {                
                that.setData({ coins: data['data'] });
            }
        });
    },

    /**
     * 购买金币
     */
    buy: function (event) {
        const index = event.currentTarget.dataset.index;
        const total = this.data.coins[index]['total'];
        const money = this.data.coins[index]['value'];
        const openid = wx.getStorageSync('openid');
        wx.showModal({
            title: '购买金币',
            content: '金币数量：' + total + '个，价值：' + (money / 100) + '元',
            success: function (res) {
                if (res.confirm) {
                    const data = {
                        openid: wx.getStorageSync('openid'),
                        fee: money
                    }
                    const url = 'https://jidear.com/word/Gow/Pay/buyCoin';
                    httpPost(url, data).then(data => {
                        if (data.code == 0) {
                            const pay = data['data'];                            
                            wx.requestPayment({
                                timeStamp: String(pay['timeStamp']),
                                nonceStr: pay['nonceStr'],
                                package: pay['package'],
                                signType: pay['signType'],
                                paySign: pay['paySign'],
                                success: function (res) {                                    
                                    wx.showToast({
                                        title: '购买成功',
                                    });

                                },
                                fail: function (res) {
                                    console.log(res);
                                    if (res.errMsg == 'requestPayment:fail cancel') {
                                        wx.showToast({
                                            title: '已取消购买',
                                            icon: 'none'
                                        });
                                    } else {
                                        wx.showToast({
                                            title: '支付失败',
                                            icon: 'none'
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    }
})