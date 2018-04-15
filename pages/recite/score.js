/** 
 * pages/recite/score.js
 * 页面功能：成绩展示页
 * 页面逻辑说明：
 * onLoad后，执行以下操作：
 * 1、读取本次测试的单词
 * 2、读取答错的单词列表
 * 3、获取答对的数量、答错的数量、用时、最终结果、正确率
 * 4、设置计时器
 * 5、上传成绩
 *
 * 点击返回列表可以返回列表页
 * 点击再来一局可以返回测试页
 * 点击返回签到首页可以回到首页
 * 
 * 涉及数据缓存：
 * 读：user_today_test_words、error_index、unionid
 * 写：correct_word_count、is_pass_today、user_lexicon_word_completed
 */

const { GET_USER_DATA, UPLOAD_RECITE_SCORE, SIGNIN_SUCCESS, SIGNIN_FAIL } = require('../../resource/util/constant.js');
// 网络请求
const { httpPost } = require('../../resource/util/functions.js')
// 共用的分享信息
const { commonShareMessage } = require('../../resource/util/user.js');

// 动效时长
const duration = 1.5;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        width: 0,               // 宽度
        height: 0,              // 高度        

        word_count: 0,          // 已签单词
        final_word: 0,          // 最终已签单词
        stop_word_count_id: -1, // 已签单词累计计时器

        level: 1,               // 用户等级
        final_level: 1,         // 最终用户等级
        stop_level_id: -1,      // 用户等级累计计时器

        signin_success: 0,      // 累计天数
        final_day: 0,           // 最终累计天数
        stop_day_count_id: -1,  // 累计天数累计计时器

        display_rate: 0,        // 显示的正确率
        stop_rate_id: -1,       // 正确率计时器
        display_time: 0,        // 显示的答题时间
        stop_time_id: -1,       // 答题时间计时器

        correct: 0,            // 正确个数
        error: 0,              // 错误个数
        time: 0,               // 答题用时
        pass: -1,               // 考核结果
        rate: 0,               // 正确率

        icon_error: 'icon-down', // 错误选项卡图标
        error_words: [],                    // 答错的单词
        error_box: 'hidden',                // 错误单词样式

        SIGNIN_SUCCESS: SIGNIN_SUCCESS,  // 签到成功图片
        SIGNIN_FAIL: SIGNIN_FAIL // 签到失败图片
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 获取屏幕信息
        const res = wx.getSystemInfoSync();
        this.setData({ width: (res.windowWidth - 30) / 24 * 22 });
        this.setData({ height: this.data.width / 630 * 300 });
        // 获取考试成绩
        const correct = parseInt(options.c);  // 正确个数
        const error = parseInt(options.e);    // 错误个数
        const time = parseFloat(options.t);   // 答题用时
        const pass = error == 0 ? 1 : 0;      // 签到结果 
        const rate = (correct / (correct + error) * 100).toFixed(2);
        this.setData({ correct: correct });
        this.setData({ error: error });
        this.setData({ time: time });
        this.setData({ pass: pass });
        this.setData({ rate: rate });

        // 本次测试单词
        const user_today_test_words = wx.getStorageSync('user_today_test_words');
        // 答错的单词
        let error_words = [];
        const error_index = wx.getStorageSync('error_index');
        for (let j = 0; j < error_index.length; j++) {
            error_words.push(user_today_test_words[error_index[j]]);
        }
        this.setData({ error_words: error_words });                

        const data = { cust_id: wx.getStorageSync('cust_id') };
        const that = this;
        httpPost(GET_USER_DATA, data).then(data => {
            if (0 == data.code) {
                // 目前
                that.setData({ level: data['data']['level'] });
                that.setData({ word_count: data['data']['word_count'] });
                that.setData({ signin_success: data['data']['signin_success'] });
                // 最终
                that.setData({ final_level: data['data']['level'] });
                that.setData({ final_word: data['data']['word_count'] });
                that.setData({ final_day: data['data']['signin_success'] });
            }
        }).then(function () {
            if (pass) {
                const daily_word_count = wx.getStorageSync('user_daily_word_count');
                that.setData({ final_day: that.data.final_day + 1 });
                that.setData({ final_word: that.data.final_word + daily_word_count });
                const level = Math.floor(that.data.final_word / 100) + 1;
                that.setData({ final_level: level });
            }
        }).then(function () {
            if (pass) {
                setInterval(that.addWordCount, 100);
                setTimeout(that.addDayCount, duration * 500);
            } else {
                setInterval(that.addTime, 100);
                setInterval(that.addRate, 100);
            }            
            setTimeout(that.addLevelCount, duration * 500);
        }).then(this.upload); // 上传成绩;
    },

    /**
     * 页面卸载
     */
    onUnload: function () {        
        clearInterval(this.data.stop_word_count_id);
        clearTimeout(this.data.stop_level_id);
        clearTimeout(this.data.stop_day_count_id);
        clearInterval(this.data.stop_rate_id);
        clearInterval(this.data.stop_time_id);
        wx.removeStorageSync('error_index');
        wx.removeStorageSync('user_today_test_words');
    },

    /**
     * 已签单词计时器
     */
    addWordCount: function () {
        const step = Math.ceil((this.data.correct + this.data.error) / duration / 10);
        let word_count = this.data.word_count;
        let final_word = this.data.final_word;
        word_count += step;        
        if (word_count >= final_word) {
            clearInterval(this.data.stop_word_count_id);
            word_count = final_word;
        }
        this.setData({ word_count: word_count });
    },

    /**
     * 累计天数计时器
     */
    addDayCount: function () {
        clearTimeout(this.data.stop_day_count_id);
        this.setData({ signin_success: this.data.final_day });
    },

    /**
     * 用户等级计时器
     */
    addLevelCount: function () {
        clearTimeout(this.data.stop_level_id);
        this.setData({ level: this.data.final_level });
    },

    /**
     * 答题时间计时器
     */
    addTime: function () {
        const time = parseFloat(this.data.time);
        const step = time / duration / 10;
        let display_time = parseFloat(this.data.display_time);
        
        display_time += step;
        display_time = display_time.toFixed(2);
        if (display_time >= time) {
            clearInterval(this.data.stop_time_id);
            display_time = time;
        }
        this.setData({ display_time: display_time });
    },

    /**
     * 正确率计时器
     */
    addRate: function () {
        const rate = parseFloat(this.data.rate);
        const step = rate / duration / 10;
        let display_rate = parseFloat(this.data.display_rate);
        
        display_rate += step;
        display_rate = display_rate.toFixed(2);
        if (display_rate >= rate) {
            clearInterval(this.data.stop_rate_id);
            display_rate = rate;
        }
        this.setData({ display_rate: display_rate });
    },

    /**
     * 分享转发
     */
    onShareAppMessage: function () {        
        return commonShareMessage(this.data.final_day, this.data.final_word);        
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
            case 'usetime':
                info = '本次签到考核的答题用时为' + this.data.time + '秒';
                break;
            case 'rate':
                info = '所有考核单词都正确才算签到成功';
                break;
        }
        wx.showModal({
            content: info,
            showCancel: false,
            confirmText: '好的'
        });
    },

    /**
     * 上传成绩
     */
    upload: function () {
        const url = UPLOAD_RECITE_SCORE;
        const data = {
            cust_id: wx.getStorageSync('cust_id'),
            correct: this.data.correct,
            error: this.data.error,
            time: this.data.time
        };

        wx.setStorageSync('is_pass_today', this.data.error == 0 ? 1 : 0);        

        httpPost(url, data).then(function (result) {
            if (result.code == 0) {
                wx.setStorageSync('user_lexicon_word_completed', parseInt(result['data']['new_progress']));
                wx.setStorageSync('signin_day', parseInt(result['data']['signin']));
                const addcoin = parseInt(result['data']['addcoin']);                
                wx.setStorageSync('coin', parseInt(result['data']['coin']));
                if (addcoin > 0) {
                    wx.showToast({
                        title: '+' + addcoin + '金币',
                        icon: 'success'
                    });
                }
            }
        });
    },

    /**
     * 点击错误单词列表（ok）
     */
    toggleError: function () {        
        let style = this.data.error_box;
        if (style == 'hidden') {
            style = '';
            this.setData({ icon_error: 'icon-up' });
            setTimeout(this.scroll, 100);

        }
        else {
            style = 'hidden';
            this.setData({ icon_error: 'icon-down' });
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 300
            });
        }
        this.setData({ error_box: style });
    },

    /**
     * 收起错词列表
     */
    closeError: function () {        
        this.setData({ icon_error: 'icon-down' });
        this.setData({ error_box: 'hidden' });
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 300
        });
    },

    /**
     * 滚动页面（ok）
     */
    scroll: function () {
        wx.pageScrollTo({
            scrollTop: 485,
            duration: 300
        });
    },

    /**
     * 返回列表页
     */
    list: function () {        
        wx.navigateBack({
            delta: 1
        });
    },

    /**
     * 再来一局
     */
    again: function () {        
        wx.removeStorageSync('error_index');
        wx.redirectTo({
            url: '/pages/recite/test'
        });
    },

    /**
     * 返回签到首页
     */
    index: function () {        
        wx.reLaunch({
            url: '/pages/home/index'
        });
    },
})