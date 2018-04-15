/**
 * pages/user/statistics/data.js
 * 页面功能：用户数据统计页（页面内容需更新）
 * 
 * 页面逻辑说明：
 * onLoad，执行以下操作：
 * 1、读取屏幕参数
 * 2、获取用户数据
 * 
 * 
 * 涉及数据缓存：
 * 读：nickname、cust_id
 */

const { httpPost, httpGet } = require('../../../resource/util/functions.js');
const { GET_USER_DATA, PERSION_DATA_COVER, GET_LEXICON_LIST } = require('../../../resource/util/constant.js');
const { commonShareMessage } = require('../../../resource/util/user.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        swiper_height: 0,      // 分页器高度
        width: 0,              // 宽度
        height: 0,             // 高度
        nickname: '游客',      // 用户昵称
        gender: 1,             // 性别
        word_count: 0,         // 签到单词数
        level: 0,              // 用户等级
        signin_success: 0,     // 签到成功次数
        PERSION_DATA_COVER: PERSION_DATA_COVER,// 封面图片
        lexicons: [],          // 词库列表
        lexicons_progress: [], // 各词库完成进度
        colors: ['#ffa68f', '#ff4867', '#18b29d', '#716DF9', '#44617b'],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const res = wx.getSystemInfoSync();
        this.setData({
            swiper_height: res.windowHeight - 20,
            width: (res.windowWidth - 30) / 24 * 22,
            height: (res.windowWidth - 30) / 24 * 22 / 630 * 300,
            nickname: wx.getStorageSync('nickname'),
            gender: wx.getStorageSync('gender')
        });

        const data = { cust_id: wx.getStorageSync('cust_id') };
        const that = this;
        httpPost(GET_USER_DATA, data).then(data => {
            if (0 == data.code) {
                that.setData({
                    level: data['data']['level'],
                    word_count: data['data']['word_count'],
                    signin_success: data['data']['signin_success'],
                    lexicons_progress: data['data']['lexicons']
                });
            }
        }).then(function () {
            const url = GET_LEXICON_LIST;
            httpGet(url).then(function (data) {
                if (data.code == 0) {
                    const lexicon = data['data'];
                    that.setData({ lexicons: lexicon });
                }
            });
        });
    },

    /**
     * 数值信息
     */
    info: function (event) {
        const key = event.currentTarget.dataset.key;
        let info = '';
        switch (key) {
            case 'signin':
                info = '每天可签到一次，签到成功累计1天';
                break;
            case 'wordcount':
                const daily_word_count = wx.getStorageSync('user_daily_word_count');
                info = '每天可签到一次，签到成功累计' + daily_word_count + '个单词';
                break;
            case 'level':
                info = '每累计签到100个单词可晋升一个等级';
                break;
        }
        wx.showModal({
            content: info,
            showCancel: false,
            confirmText: '好的'
        });
    },

    swiperChange: function (event) {
        const index = event.detail.current;
        if (index == 1) {
            wx.setNavigationBarTitle({
                title: '词库进度'
            });
        } else {
            wx.setNavigationBarTitle({
                title: ' '
            });
        }
    },

    onShareAppMessage: function () {
        return commonShareMessage(this.data.signin_success, this.data.word_count);
    }
})