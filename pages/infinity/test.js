// pages/test/game.js

const progress_interval = 20;
const { playCorrect } = require('../../resource/util/audio.js');
const { PHONETIC_API, GET_INFINITY_TEST_WORD_V2 } = require('../../resource/util/constant.js');
const { httpPost, preventDoubleClick } = require('../../resource/util/functions.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        colors: ['#9b59b6', '#3498db', '#c53f46', '#7cc576', '#faa701'], // 背景颜色数组 
        color_index: 0,           // 背景颜色索引
        words: [],                // 考核的单词
        one_word_second: 10,      // 每个词的时间
        index: 0,                 // 目前答到的索引
        score: 0,                 // 分数
        add_score: 0,             // 增加的分数
        score_animated: 'hidden', // 分数动效
        progress: 100,            // 进度条值
        stop_progress_id: -1,     // 停止进度条计时
        total_time: 0,            // 总用时
        stop_total_time_id: -1,   // 总用时计时器
        phoneticAudio: null       // 发音文件
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({ 
            index: parseInt(wx.getStorageSync('infinity_stop_pos')), // 答题起始索引
            score: parseInt(wx.getStorageSync('infinity_score')),    // 巅峰挑战开局分数
            one_word_second: wx.getStorageSync('infinity_seconds'),  // 获取一个单词考核时间
            words: wx.getStorageSync('infinity_words')               // 获取考核单词
        });
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: this.data.colors[this.data.color_index]
        });
        if (wx.getStorageSync('autoPlayPhonetic') != 0) {
            this.playVoice();
        }
        this.startTimer();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {        
        console.log('hide');
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.stopTimer();
    },

    /**
     * 用户点击了选项
     */
    selected: function (event) {
        const pos = event.currentTarget.dataset.index;
        if (pos == this.data.words[this.data.index]['pos']) {
            playCorrect();
            const total_length = this.data.words.length;
            const index = (this.data.index + 1) % total_length;
            this.setData({ index: index });
            if (wx.getStorageSync('autoPlayPhonetic') != 0) {
                this.playVoice();
            }
            if (index % 10 == 0) { // 每10个词切换一次背景
                const length = this.data.colors.length;
                const color_index = this.data.color_index;
                this.setData({ color_index: (color_index + 1) % length });
                wx.setNavigationBarColor({
                    frontColor: '#ffffff',
                    backgroundColor: this.data.colors[this.data.color_index],
                });
            }

            const score = Math.round(this.data.progress / 10) + 1;
            this.setData({ add_score: '+' + score });
            this.setData({ score: this.data.score + score });
            this.addScore();
            this.setData({ progress: 100 }); // 重置倒计时
            if (index % 80 == 79) { // 每做到80个倍数的词语，就去获取新的单词
                this.getInfinityTestWord();
            }
        } else {
            this.fail(this.data.index, pos);
        }

    },

    /**
     * 增加分数
     */
    addScore: function () {
        this.setData({ score_animated: 'fadeOutUp' });
        const that = this;
        setTimeout(function () {
            that.setData({ score_animated: 'hidden' });
        }, 500);
    },

    /**
     * 进度条
     */
    progressCountDown: function () {
        const step = 100 / (this.data.one_word_second * (1000 / progress_interval));
        let value = this.data.progress - step;
        if (value <= 0) {
            this.fail(this.data.index);
        }
        this.setData({ progress: value });
    },

    /**
     * 增加总时间
     */
    addTotalTime: function () {
        let value = Math.round((parseFloat(this.data.total_time) + 0.07) * 100) / 100;
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
        this.setData({ total_time: str });
    },

    /**
     * 启动计时器
     */
    startTimer: function () {
        // 进度条启动
        const stop_progress_id = setInterval(this.progressCountDown, progress_interval);
        this.setData({ stop_progress_id: stop_progress_id });
        // 启动总计时
        const stop_total_time_id = setInterval(this.addTotalTime, 70);
        this.setData({ stop_total_time_id: stop_total_time_id });
    },

    /**
     * 停止计时器
     */
    stopTimer: function () {
        clearInterval(this.data.stop_progress_id);
        clearInterval(this.data.stop_total_time_id);
    },

    /**
     * 答错或超时
     */
    fail: function (index = 0, pos = -1) {
        this.stopTimer();
        wx.redirectTo({
            url: '/pages/infinity/score?s=' + this.data.score + '&i=' + index + '&p=' + pos + '&t=' + this.data.total_time,
        });
    },

    /**
     * 播放发音
     */
    playVoice: function () {
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);

            if (!!this.data.phoneticAudio) {
                this.data.phoneticAudio.stop();
            }
            let src = PHONETIC_API + this.data.words[this.data.index]['word'];
            const innerAudioContext = wx.createInnerAudioContext();
            innerAudioContext.autoplay = true;
            innerAudioContext.src = src;
            this.setData({ phoneticAudio: innerAudioContext });
        }
    },

    /**
     * 获取巅峰挑战单词
     */
    getInfinityTestWord: function () {
        const cust_id = wx.getStorageSync('cust_id');
        const data = { cust_id: cust_id };
        const url = GET_INFINITY_TEST_WORD_V2;
        const that = this;
        return httpPost(url, data).then(data => {
            if (data.code == 0) {
                const word = data['data']['words'];
                const words = that.data.words.concat(word);
                that.setData({ words: words });
                wx.setStorageSync('infinity_words', words);
            }
        });
    }
})