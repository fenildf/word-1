/**
 * pages/recview/score.js
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

const { httpPost } = require('../../resource/util/functions.js');
const { UPLOAD_REVIEW_SCORE, GET_REVIEW_STAR } = require('../../resource/util/constant.js');

const duration = 1.5; // 动画总时长（秒）

Page({

    /**
     * 页面的初始数据
     */
    data: {
        level: 1,                           // 关卡等级
        error: 0,                           // 错误数量 
        display_bigstar: 0,
        star: 0,                            // 大星星总数
        star_img: '/resource/image/review/star0.png', // 大星星图片
        stop_bigstar_id: -1,

        icon_error: 'icon-down',            // 错误选项卡图标
        error_words: [],                    // 答错的单词
        error_box: 'hidden',                // 错误单词样式

        display_second: 0,                  // 显示的秒数
        total_second: 0,                    // 最终的秒数
        stop_second_id: -1,                    // 秒数计时器

        display_star: 0,                    // 一开始显示的星星数
        total_star: 0,                      // 最终显示的星星数
        stop_star_id: -1,                      // 星星数计时器

        display_correct: 0,                 // 显示的正确率        
        correct: 0,                         // 正确数量
        stop_correct_id: -1,                   // 正确数计时器                        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 本次测试单词
        const level_test_words = wx.getStorageSync('level_test_words');

        // 答错的单词
        let error_words = [];
        let error_index = wx.getStorageSync('error_index');
        for (let j = 0; j < error_index.length; j++) {
            error_words.push(level_test_words[error_index[j]]);
        }
        this.setData({ error_words: error_words });

        // 答对的数量、答错的数量、用时、最终结果、正确率
        const level = parseInt(options.l);
        const correct = parseInt(options.c);
        const error = parseInt(options.e);
        const time = parseFloat(options.t);

        const avg_time = time / (correct + error);
        const that = this;
        let star = 1;
        this.setData({ level: level });
        this.setData({ correct: correct });
        this.setData({ error: error });
        this.setData({ total_second: time });
        if (error > 0) {
            star = 0;
        } else if (avg_time <= 4.0) {
            star = 3;
        } else if (avg_time <= 7.0) {
            star = 2;
        } else {
            star = 1;
        }
        this.setData({ star: star });
        this.getReviewStar().then(function () {
            that.setData({ total_star: that.data.display_star + star })
            // 设置计时器
            that.setData({ stop_star_id: setInterval(that.addStar, 500) });
            that.setData({ stop_bigstar_id: setInterval(that.addBigStar, 500) });
            that.setData({ stop_second_id: setInterval(that.addSecond, 100) });
            that.setData({ stop_correct: setInterval(that.addCorrect, 100) });
        }).then(this.upload); // 目前星数        
    },

    /**
     * 增加大星星（ok）
     */
    addBigStar: function () {
        let display_bigstar = this.data.display_bigstar;
        let star_img = '/resource/image/review/star' + display_bigstar + '.png';
        const star = this.data.star;
        const dif = star - display_bigstar;
        let step = parseInt(Math.round(dif / duration / 2));
        step = step < 1 ? 1 : step;
        if (display_bigstar < this.data.star) {
            display_bigstar += step;
            star_img = '/resource/image/review/star' + display_bigstar + '.png';
        }

        if (display_bigstar >= this.data.star) {
            display_bigstar = this.data.star;
            star_img = '/resource/image/review/star' + display_bigstar + '.png';
            clearInterval(this.data.stop_star_id);
        }
        this.setData({ star_img: star_img });
        this.setData({ display_bigstar: display_bigstar });
    },

    /**
     * 增加星星总数(ok)
     */
    addStar: function () {
        let display_star = this.data.display_star;
        const total = this.data.total_star;
        const dif = total - display_star;
        let step = parseInt(Math.round(dif / duration / 2));
        step = step < 1 ? 1 : step;
        if (display_star < this.data.total_star) {
            display_star += step;
        }

        if (display_star >= this.data.total_star) {
            display_star = this.data.total_star;
            clearInterval(this.data.stop_star_id);
        }
        this.setData({ display_star: display_star });
    },

    /**
     * 增加用时(ok)
     */
    addSecond: function () {
        let second = this.data.display_second;
        const total_second = this.data.total_second;
        let step = parseFloat((total_second / (duration * 10)).toFixed(2));
        step = step < 0.01 ? 0.01 : step;

        if (second < total_second) {
            second = parseFloat((second + step).toFixed(2));
        }

        if (second >= total_second) {
            second = total_second;
            clearInterval(this.data.stop_second_id);
        }
        this.setData({ display_second: second });
    },

    /**
     * 增加正确数(ok)
     */
    addCorrect: function () {
        let correct = this.data.display_correct;
        const total = this.data.correct;
        let step = parseInt(Math.round(total / (duration * 10)));
        step = step < 1 ? 1 : step;
        if (correct < total) {
            correct = parseInt(correct + step);
        }

        if (correct >= total) {
            correct = total;
            clearInterval(this.data.stop_correct);
        }
        this.setData({ display_correct: correct });
    },

    /**
     * 页面卸载（ok）
     */
    onUnload: function () {
        wx.removeStorageSync('error_index');
        wx.removeStorageSync('level_test_words');
    },

    /**
     * 上传成绩
     */
    upload: function () {
        const url = UPLOAD_REVIEW_SCORE;
        const data = {
            cust_id: wx.getStorageSync('cust_id'),
            level: this.data.level,
            correct: this.data.correct,
            error: this.data.error,
            time: this.data.total_second
        };

        httpPost(url, data);
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
            scrollTop: 414,
            duration: 300
        });
    },

    /**
     * 按钮跳转
     */
    jump: function (event) {        
        const id = parseInt(event.currentTarget.dataset.id);
        switch (id) {
            case 1: // 返回列表
                wx.navigateBack({
                    delta: 2
                });
                return;
            case 2: // 分享
                return;
            case 3: // 再来
                wx.redirectTo({
                    url: '/pages/review/test?level=' + this.data.level
                });
                return;
        }
    },

    /**
     * 获取用户目前的星星数（ok）
     */
    getReviewStar: function () {
        const url = GET_REVIEW_STAR;
        const data = { cust_id: wx.getStorageSync('cust_id') }
        const that = this;
        return httpPost(url, data).then(data => {
            if (data.code == 0) {
                that.setData({ display_star: data['data'] });
            }
        });
    }
})