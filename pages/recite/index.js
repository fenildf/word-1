// pages/recite/index.js

const {
    MONTHS,
    GET_USER_REVIEW_STAR_PERCENT,
    GET_USER_SIGNIN_DAYS,
    USER_SHARE
} = require('../../resource/util/constant.js');

const {
    range,
    httpPost,
    preventDoubleClick
} = require('../../resource/util/functions.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        current_year: 2018,  // 今年
        current_month: 3,    // 本月
        current_day: 9,      // 本日  
        signin_days: [],     // 签到日期         
        days_array: [],      // 签到日历
        lexicon_id: 1,       // 当前词库ID
        lexicon_name: '',    // 当前词库名称
        lexicon_progress: 0, // 当前词库进度
        word_completed: 0,   // 签到完成单词数
        review_progress: 0,  // 复习进度
        signin_day: 0,       // 签到天数       
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const res = wx.getSystemInfoSync();
        this.setData({
            width: res.windowWidth - 60,                // 封面宽度
            height: (res.windowWidth - 60) / 938 * 580, // 封面高度
            maxim_en: wx.getStorageSync('maxim_en'),    // 格言英语
            maxim_cn: wx.getStorageSync('maxim_cn'),    // 格言中文
            comment: wx.getStorageSync('comment'),      // 格言评论
            img: wx.getStorageSync('img'),              // 格言封面
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        const date = new Date;                // 今天
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        this.setData({
            current_year: date.getFullYear(),                                 // 年份
            current_month: date.getMonth() + 1,                               // 月份
            month_string: MONTHS[date.getMonth()],                            // 月份简写
            current_day: date.getDate(),                                      // 日期
            lexicon_id: parseInt(wx.getStorageSync('user_lexicon_id')),       // 当前词库标识
            lexicon_name: wx.getStorageSync('user_lexicon_name'),             // 当前词库名称
            word_completed: wx.getStorageSync('user_lexicon_word_completed'), // 用户完成进度
            signin_day: wx.getStorageSync('signin_day')                       // 用户签到天数
        });

        const word_count = wx.getStorageSync('user_lexicon_word_count');      // 用户签到词库单词数
        let progress = this.data.word_completed * 100 / word_count;           // 用户签到进度
        if (progress > 0 && progress < 10) {
            this.setData({ lexicon_progress: progress.toFixed(2) });
        }
        else if (progress >= 10 && progress < 100) {
            this.setData({ lexicon_progress: progress.toFixed(1) });
        }
        else {
            this.setData({ lexicon_progress: 0 });
        }

        // 获取复习进度
        const url = GET_USER_REVIEW_STAR_PERCENT;
        const data = { cust_id: wx.getStorageSync('cust_id') };
        const that = this;
        httpPost(url, data).then(data => {
            if (0 == data.code) {
                that.setData({ review_progress: data['data'] });
            }
        })
            .then(this.getUserReciteDays) // 获取签到日期
            .then(this.setCalendarData);  // 设置显示日历
    },

    /**
     * 设置日历
     */
    setCalendarData: function () {
        const year = this.data.current_year;
        const month = this.data.current_month;
        const empty_days_count = new Date(year, month - 1, 1).getDay();   // 月份第一天是周几  
        let empty_days = new Array;
        const prev_month = month - 1 == 0 ? 12 : month - 1;             // 上个月的月份数
        /**
         * 上个月的日期
         */
        for (let i = 0; i < empty_days_count; i++) {
            empty_days.push({
                state: 'inactive',
                value: -1,
                month: prev_month,
                info: 'prev',
                color: '#c3c6d1',
                background: 'transparent'
            });
        }

        /**
         * 下个月的日期
         */
        const last_day = new Date(year, month, 0);          // 本月最后一天
        const days_count = last_day.getDate();              // 本月最后一天是几号
        const last_date = last_day.getDay();                // 本月最后一天是星期几
        const next_month = month + 1 == 13 ? 1 : month + 1; // 下个月的月份数
        let empty_days_last = new Array;
        for (let i = 0; i < 6 - last_date; i++) {
            empty_days_last.push({
                state: 'inactive',
                value: -2,
                month: next_month,
                info: 'next',
                color: '#c3c6d1',
                background: 'transparent'
            });
        }

        /**
         * 本月的日期
         */
        let temp = new Array;
        for (let i = 1; i <= days_count; i++) {
            let active = 'inactive';
            for (let j = 0; j < this.data.signin_days.length; j++) {
                if (i == this.data.signin_days[j]) {
                    active = 'active';
                }                
            }
            temp.push({
                state: active,
                value: i,
                month: month,
                info: 'current',
                color: '#4a4f74',
                background: 'transparent'
            });
        }

        const days_range = temp;                                   // 本月
        let days = empty_days.concat(days_range, empty_days_last); // 上个月 + 本月 + 下个月
        let days_array = new Array;
        let week = new Array;
        for (let i = 0; i < days.length; i++) {
            week.push(days[i]);
            if (i % 7 == 6) {
                days_array.push(week);
                week = new Array;
            }
        }

        if (week.length > 0) {
            days_array.push(week);
        }

        this.setData({
            days_array: days_array
        });
    },

    /**
     * 获取用户签到日期
     */
    getUserReciteDays: function () {
        const that = this;
        const url = GET_USER_SIGNIN_DAYS;
        const data = {
            cust_id: wx.getStorageSync('cust_id')
        };
        return httpPost(url, data).then(data => {
            if (data.code == 0) {
                that.setData({
                    signin_days: data['data']
                });
            }
        })
    },

    /**
     * 页面跳转
     */
    jump: function (event) {
        const id = event.currentTarget.dataset.id;
        let url = '';
        switch (id) {
            case 'signin':
                if (this.data.lexicon_id == -1) {
                    url = '/pages/lexicon/choice';
                } else {
                    url = '/pages/recite/words';
                }
                break;
            case 'review':
                if (this.data.lexicon_id == -1) {
                    url = '/pages/lexicon/choice';
                } else {
                    url = '/pages/review/index';
                }                
                break;
            case 'data':
                if (this.data.lexicon_id == -1) {
                    url = '/pages/lexicon/choice';
                } else {
                    url = '/pages/user/statistics/data';
                }                
                break;
        }
        wx.navigateTo({ url });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const cust_id = wx.getStorageSync('cust_id');
        return {
            title: '让坚持不再枯燥，让学习妙趣横生【全民单词】',
            path: '/pages/home/start?fromcustid=' + cust_id,
            success: function (res) {
                const url = USER_SHARE;
                const data = { cust_id: cust_id };
                httpPost(url, data).then(data => {
                    if (data.code == 0) {
                        const addcoin = data['data']['addcoin'];
                        const coin = data['data']['coin'];
                        let title = '分享成功';
                        if (addcoin > 0) {
                            title = '分享 +' + addcoin + '金币';
                        }
                        wx.setStorageSync('coin', coin);
                        wx.showToast({
                            title: title,
                            icon: 'success'
                        });
                    }
                });
            },
            fail: function (res) {
                if (res.errMsg == 'shareAppMessage:fail cancel') {
                    wx.showToast({
                        title: '已取消分享',
                        icon: 'none'
                    });
                }
            }
        }
    }
})