/**
 * pages/user/signin/recite.js
 * 页面功能：个人中心（此页面逻辑已完成）
 * 
 * 页面逻辑说明：
 * onLoad，执行以下操作：
 * 1、读取用户签到日志
 * 
 * 涉及数据缓存：
 * 读：cust_id
 */

const { httpPost } = require('../../../resource/util/functions.js');
const { GET_RECITE_LOG } = require('../../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        records: [],
        colors: ['#ffa68f', '#ff4867', '#18b29d', '#716DF9', '#44617b'],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getReciteLog();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getReciteLog();
    },

    /**
     * 获取用户签到日志
     */
    getReciteLog: function () {
        const cust_id = wx.getStorageSync('cust_id');
        const data = { cust_id: cust_id };
        const that = this;
        httpPost(GET_RECITE_LOG, data).then(data => {
            if (data.code == 0) {
                that.setData({ records: data['data'] });
            }
        });
    }
})