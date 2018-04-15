// pages/review/index.js 
const { range, httpPost, preventDoubleClick } = require('../../resource/util/functions.js');
const { GET_USER_REVIEW_PROGRESS } = require('../../resource/util/constant.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cell_count: 0,           // 单元格数
        columns: [0, 1, 2, 3],   // 一共4列
        rows: 0,                 // 总行数
        active_count: 0,         // 激活的数量
        user_lexicon_name: '',   // 用户词库名
        progress: [],
        swiper_count: [],
        cell_rows_count: 1,
        page_cell_count: 1,
        /**
         * 样式字符串
         */
        swiper_height_style: '', // 滑动swiper样式
        first_cell_style: '',
        cell_style: '',
        last_cell_style: '',
        left_pos: 65.5
    },

    /**
     * 初始化样式
     */
    initStyle: function () {
        const res = wx.getSystemInfoSync();
        const windowWidth = res.windowWidth;   // 屏幕宽度
        const windowHeight = res.windowHeight; // 屏幕高度
        const left_pos = (windowWidth - 244) / 2;
        this.setData({ left_pos: left_pos });

        // 15为padding，2为边框，6为占据4空间2，这里block被限制为最高50px
        const block = (windowWidth - 32) / 6 > 50 ? 50 : (windowWidth - 32) / 6;
        // 左右边距为屏幕宽度 - 左右padding - 左右边框宽度 - 4个单元格，然后处于5个空间，再切分成一半，因为左右边距不会合并
        const margin = (windowWidth - 32 - block * 4) / 10;
        // 每行第一个单元格的样式
        const fcs = 'width:' + block + 'px;height:' + block + 'px;margin-left:' + margin * 2 + 'px;margin-right:' + margin + 'px;';
        this.setData({ first_cell_style: fcs });
        // 每行中间单元格的样式
        const cs = 'width:' + block + 'px;height:' + block + 'px;margin-left:' + margin + 'px;margin-right:' + margin + 'px;';
        this.setData({ cell_style: cs });
        // 每行最后一个单元格的样式
        const lcs = 'width:' + block + 'px;height:' + block + 'px;margin-left:' + margin + 'px;margin-right:' + margin * 2 + 'px;';
        this.setData({ last_cell_style: lcs });
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const res = wx.getSystemInfoSync();
        const windowWidth = res.windowWidth;   // 屏幕宽度
        const windowHeight = res.windowHeight; // 屏幕高度
        // 15为padding，2为边框，6为占据4空间2，这里block被限制为最高50px
        const block = (windowWidth - 15 * 2 - 2) / 6 > 50 ? 50 : (windowWidth - 15 * 2 - 2) / 6;        
        const block_row_height = block + 10; // 5为上下外边距
        const header = 45;
        const number_of_block_row = Math.floor((windowHeight - header) / block_row_height);
        const cell_rows_count = number_of_block_row - 1;  // 每页行数，减少一行来放指示点
        const swiper_height = windowHeight - header - 18 - block_row_height / 2;
        this.setData({ swiper_height_style: 'height: ' + swiper_height + 'px;' });

        const cell_word_count = wx.getStorageSync('user_lexicon_cell_word_count'); // 单元格单词数
        const lexicon_word_count = wx.getStorageSync('user_lexicon_word_count');   // 词库单词数

        const cell_count = Math.ceil(lexicon_word_count / cell_word_count);      // 单元格数 = 词库词数 / 单元格单词数
        this.setData({ cell_count: cell_count });
        this.setData({ rows: range(Math.ceil(this.data.cell_count / this.data.columns.length)) }); // 行数 = 单元格数 / 每列多少格

        const page_cell_count = cell_rows_count * this.data.columns.length; // 每一页最多有多少单元格 = 每页行数 * 每行单元格数
        const swiper_count = Math.ceil(cell_count / page_cell_count);       // 指示点数量 = 单元格数 / 每页单元格数
        this.setData({ page_cell_count: page_cell_count });        
        this.setData({ swiper_count: range(swiper_count) }); // 滑动视图数量
        this.setData({ cell_rows_count: range(cell_rows_count) });  // 每页有多少行单元格
        this.setData({ user_lexicon_name: wx.getStorageSync('user_lexicon_name') });
        this.initStyle();
    },

    onShow: function () {
        const user_lexicon_word_completed = wx.getStorageSync('user_lexicon_word_completed'); // 用户签到进度
        const user_lexicon_cell_word_count = wx.getStorageSync('user_lexicon_cell_word_count');
        const active_count = Math.floor(user_lexicon_word_completed / user_lexicon_cell_word_count); // 激活的单元格数                
        this.setData({ active_count: active_count });
        this.get_user_review_progress();
    },

    /**
     * 点击单元格
     */
    into: function (event) {        
        if (!this.data.buttonClicked) {
            preventDoubleClick(this);
            const num = event.currentTarget.dataset.number; // 单元格号码        
            if (this.data.active_count >= num) {
                wx.navigateTo({
                    url: '/pages/review/words?level=' + num
                });
            } else {
                const cell_word_count = wx.getStorageSync('user_lexicon_cell_word_count');
                wx.showModal({
                    content: '每签到完成当前词库' + cell_word_count + '个单词，便可激活一个复习关卡，以平均每词作答时间10秒、7秒、4秒内完成可分别获得1星、2星和3星',
                    confirmText: '好的',
                    confirmColor: '#25445b',
                    showCancel: false
                });
            }
        }        
    },

    /**
     * 获取复习进度
     */
    get_user_review_progress: function () {        
        let that = this;
        let user_lexicon_id = wx.getStorageSync('user_lexicon_id');                                // 用户当前词库
        let url = GET_USER_REVIEW_PROGRESS + user_lexicon_id;
        let data = {
            cust_id: wx.getStorageSync('cust_id')
        };
        httpPost(url, data).then(function (data) {
            if (data.code == 0) {
                that.setData({ progress: data['data'] });
            }
        });
    },    

    /**
     * 提示
     */
    info: function () {        
        const cell_word_count = wx.getStorageSync('user_lexicon_cell_word_count');
        wx.showModal({            
            content: '每签到完成当前词库' + cell_word_count + '个单词，便可激活一个复习关卡，以平均每词作答时间10秒、7秒、4秒内完成可分别获得1星、2星和3星',
            confirmText: '好的',
            confirmColor: '#25445b',
            showCancel: false
        });
    }
})