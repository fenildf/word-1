/**
 * pages/home/start.js
 * 页面功能：启动页（此页逻辑已完成）
 * 
 * 页面逻辑说明：
 * onLoad，执行以下操作：
 * 1、获取现在的时间来设置问候语
 * 2、用户登录
 * 3、获取openid、unionid、cust_id，并写入缓存
 * 4、获取本次格言
 * 5、获取用户系统配置（全局音效、自动发音），并写入缓存
 * 6、获取用户信息（昵称、性别、头像地址、签到成功天数），并写入缓存
 * 7、获取用户词库信息（词库ID、词库名、词库词汇量、当前进度、每日签到词数、单元格单词数），并写入缓存
 * 
 * 涉及数据缓存：
 * 写：openid、unionid、cust_id、globalSoundEffect、autoPlayPhonetic、nickname、gender、avatar、signin_day、
 *     user_lexicon_id、user_lexicon_name、user_lexicon_word_count、user_lexicon_cell_word_count、
 *     user_lexicon_word_completed、user_daily_word_count、is_pass_today
 */

// 网络请求
const { httpPost } = require('../../resource/util/functions.js');

// 用户相关函数
const {
    userLogin,
    getUserConfig,
    getUserInfo,
    getUserLexicon
} = require('../../resource/util/user.js');

const { USER_ADD_RELATE } = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cust_id: -1, // 客户ID,
        welcome: '',
        fromcustid: -1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const fromcustid = options.fromcustid; // 判断是否他人点击分享        
        // 设置日期        
        const today = new Date;
        let welcome = '';
        const hour = today.getHours();        
        if (hour >= 5 && hour < 12) {
            welcome = 'Good morning';
        } else if (hour >= 12 && hour < 19) {
            welcome = 'Good afternoon';

        } else if (hour >= 19 && hour < 22) {
            welcome = 'Good evening';
        } else {
            welcome = 'Good night';
        }
        if (fromcustid != undefined)
        {
            this.setData({
                fromcustid: fromcustid
            });
        }
        this.setData({ 
            welcome: welcome            
        });        
    },

    onShow: function () {        
        const that = this;        
        userLogin(this)            // 用户登录（金币、openid、unionid、cust_id、格言）
            .then(getUserConfig)   // 获取用户配置（答题音效、自动读音）
            .then(getUserInfo)     // 获取用户个人信息
            .then(getUserLexicon)  // 获取用户签到词库、进度、配置
            .then(function () {
                if (that.data.fromcustid && that.data.fromcustid != -1 && that.data.fromcustid != wx.getStorageSync('cust_id')) {                    
                    const url = USER_ADD_RELATE; // 新增好友关系
                    const data = {
                        cust_id: wx.getStorageSync('cust_id'),
                        rela_cust_id: that.data.fromcustid
                    };
                    httpPost(url, data);
                }
            }).then(function () {
                wx.switchTab({
                    url: '/pages/recite/index'
                });
            });
    }
})