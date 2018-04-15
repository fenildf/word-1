/**
 * pages/recite/test.js
 * 页面功能：签到考核页
 * 页面逻辑说明：
 * onLoad后，执行以下操作：
 * 1、获取今天测试单词列表和每个单词的考核时间
 * 2、启动计时器
 * 3、进度条开始变化
 * 4、剩余秒数变动
 * 5、播放读音
 * 4、构建本页单词，判断是否自动发音
 * 
 * 涉及数据缓存：
 * 读：auto_play_phonetic
 * 写：user_today_test_words
 */

const { httpPost } = require('../../resource/util/functions.js');
const { playCorrect, playError } = require('../../resource/util/audio.js');
const { PHONETIC_API, GET_TODAY_TEST_WORDS, SEARCH_SOUND_IMG } = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        words: [],              // 考核的单词
        length: 0,              // 单词总数
        seconds: 10,            // 剩余秒数（每个单词的考核时间）        
        correct: 0,             // 正确数
        error: 0,               // 错误数

        index: 0,               // 索引        
        error_index: [],        // 答错的单词索引

        stop_word: -1,          // 计时器ID 一个单词的答题时间        
        stop_progress: -1,      // 计时器ID 答题进度条
        stop_total: -1,         // 计时器ID 答题总计时

        progress: 100,          // 秒数倒数进度条
        total_senconds: 0.0,    // 答题总时间
        phoneticAudio: null,    // 音频上下文        

        SEARCH_SOUND_IMG        // 发音图标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;
        const url = GET_TODAY_TEST_WORDS;
        const post_data = { cust_id: wx.getStorageSync('cust_id') };
        httpPost(url, post_data).then(function (data) {
            if (data.code == 0) {
                const words = data['data']['words'];
                const one_word_seconds = data['data']['one_word_second'];
                wx.setStorageSync('user_today_test_words', words);
                that.setData({
                    words: words,
                    length: words.length,
                    seconds: one_word_seconds
                });

                that.setTimer();
                that.setData({ stop_total: setInterval(that.increaseTotalTime, 70) }); // 答题总计时
                if (wx.getStorageSync('autoPlayPhonetic') != 0) {
                    that.playVoice();
                }
            }
        });
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.clearTimer();
        clearInterval(this.data.stop_total); // 停止答题总计时        
    },

    /**
     * 设置计时
     */
    setTimer: function () {
        this.setData({
            stop_progress: setInterval(this.wordCountdown, 100),        // 进度条倒数
            stop_word: setTimeout(this.next, this.data.seconds * 1000)  // 答题时间倒数倒计时结束自动触发next
        });
    },

    /**
     * 单词倒计时进度条
     */
    wordCountdown: function () {
        // 每个词x秒，每100毫秒调用一次，一共会被调用x/0.1次，每次减去100/(x/0.1)=10/x的长度
        let progress = this.data.progress - 10 / this.data.seconds;
        progress = progress <= 0 ? 0 : progress;
        this.setData({ progress: progress });
    },

    /**
     * 答题总用时
     */
    increaseTotalTime: function () {
        let value = Math.round((parseFloat(this.data.total_senconds) + 0.07) * 100) / 100;
        let str = value.toString();
        let pos = str.indexOf('.');
        if (pos == -1) {
            str = str + '.00';
        }
        else {
            let sub = str.substring(pos + 1);
            if (sub.length == 1) {
                str = str + '0';
            }
        }
        this.setData({ total_senconds: str });
    },

    /**
     * 用户超时没有点击，系统自动跳转下一个单词
     */
    next: function () {
        if (this.data.phoneticAudio) {
            this.data.phoneticAudio.stop();  // 停止上一个发音（防止用户快速点击）
        }
        playError();
        this.clearTimer();
        let error_index = this.data.error_index;
        error_index.push(this.data.index);
        this.setData({
            error_index: error_index,
            progress: 100,
            error: this.data.error + 1
        });

        if (this.data.index < this.data.words.length - 1) {
            this.setData({ index: this.data.index + 1 });
            this.setTimer();
            if (wx.getStorageSync('autoPlayPhonetic') != 0) {
                this.playVoice();
            }
        }
        else {
            wx.setStorageSync('error_index', this.data.error_index);
            wx.redirectTo({
                url: '/pages/recite/score?c=' + this.data.correct + '&e=' + this.data.error + '&t=' + this.data.total_senconds // 跳转到成绩页
            });
        }
    },

    /**
     * 停止计时
     */
    clearTimer: function () {
        clearTimeout(this.data.stop_word);      // 停止单词计时倒数
        clearInterval(this.data.stop_progress); // 停止进度条倒数
    },

    /**
     * 用户点击了选项
     */
    selected: function (event) {
        if (this.data.phoneticAudio) {
            this.data.phoneticAudio.stop();                       // 停止上一个发音（防止用户快速点击）
        }
        this.clearTimer();                                        // 重置计时器        
        const key = parseInt(event.currentTarget.dataset.index);  // 选择的答案位置
        const pos = this.data.words[this.data.index]['pos'];      // 正确的答案位置
        if (pos == key) {
            playCorrect();                                        // 播放正确发音            
            this.setData({ correct: this.data.correct + 1 });     // 正确数+1
        }
        else {
            playError();                                          // 播放错误发音
            let error_index = this.data.error_index;
            error_index.push(this.data.index);
            this.setData({
                error_index: error_index,   // 插入错误的单词下标
                error: this.data.error + 1  // 错误数+1
            });
        }

        if (this.data.index < this.data.words.length - 1) {       // 还没考完，继续下一个词
            this.setData({ index: this.data.index + 1 });
            this.setTimer();
            this.setData({ progress: 100 });
            if (wx.getStorageSync('autoPlayPhonetic') != 0) {
                this.playVoice();
            }
        }
        else {
            wx.setStorageSync('error_index', this.data.error_index);
            wx.redirectTo({
                url: '/pages/recite/score?c=' + this.data.correct + '&e=' + this.data.error + '&t=' + this.data.total_senconds // 跳转到成绩页
            });
        }
    },

    /**
     * 播放发音
     */
    playVoice: function () {
        if (!!this.data.phoneticAudio) {
            this.data.phoneticAudio.stop();
        }
        let src = PHONETIC_API + this.data.words[this.data.index]['word'];
        const innerAudioContext = wx.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.src = src;
        this.setData({ phoneticAudio: innerAudioContext });
    },

    /**
     * 提前交卷
     */
    endtest: function () {
        let error_index = this.data.error_index;
        error_index.push(this.data.index);
        this.setData({
            error_index: error_index,   // 插入错误的单词下标
            error: this.data.error + 1  // 错误数+1
        });
        wx.setStorageSync('error_index', this.data.error_index);
        wx.redirectTo({
            url: '/pages/recite/score?c=' + this.data.correct + '&e=' + this.data.error + '&t=' + this.data.total_senconds // 跳转到成绩页
        });
    }
})