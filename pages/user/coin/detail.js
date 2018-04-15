// pages/user/coin/detail.js

const { httpPost } = require('../../../resource/util/functions.js');
const { GET_COIN_LOG } = require('../../../resource/util/constant.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
      bills: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      const that = this;
      const url = GET_COIN_LOG;
      const data = { cust_id: wx.getStorageSync('cust_id') };
      httpPost(url, data).then(data => {
          if (data.code == 0) {
              const bills = data['data'];
              that.setData({ bills });
          }
      });
  },

})