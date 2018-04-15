const { httpPost, httpGet } = require('functions.js');

const { 
    USER_LOGIN,               // 用户登陆URL
    GET_USER_CONFIG,          // 获取用户配置URL
    GET_USERINFO,             // 获取用户信息URL
    GET_USER_LEXICON,         // 获取用户词库URL
    UPDATE_USERINFO,          // 更新用户信息URL
    USER_SHARE,               // 用户分享小程序，获取分享金币
    INFINITY_COVER_IMG,       // 巅峰挑战分享封面
    PERSION_DATA_SHARE_COVER, // 个人成就页分享封面    
} = require('constant.js');

/**
 * 更新微信用户信息
 * @param that
 * @param userInfo 用户信息对象
 */
function updateUserInfo(that, userInfo) {
    that.setData({ nickName: userInfo.nickName });
    that.setData({ avatarUrl: userInfo.avatarUrl });
    that.setData({ gender: userInfo.gender });
    wx.setStorageSync('nickname', userInfo.nickName);
    wx.setStorageSync('gender', userInfo.gender);
    wx.setStorageSync('avatarUrl', userInfo.avatarUrl);
    userInfo.cust_id = wx.getStorageSync('cust_id');
    userInfo.unionid = wx.getStorageSync('unionid');
    const url = UPDATE_USERINFO;
    return httpPost(url, userInfo);
}

/**
 * 共用的分享信息
 */
function commonShareMessage(day = 0, word = 0) {
    const cust_id = wx.getStorageSync('cust_id');
    return {
        title: '我已坚持了' + day + '天，共掌握了' + word + '个单词',
        path: '/pages/home/start?fromcustid=' + cust_id,
        imageUrl: PERSION_DATA_SHARE_COVER,
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

/**
 * 巅峰挑战的分享信息
 */
function infinityShareMessage() {
    return {
        title: '巅峰挑战单词的世界TOP100',
        path: '/pages/infinity/index?scene=share&fromcustid=' + wx.getStorageSync('cust_id'),
        imageUrl: INFINITY_COVER_IMG,
        success: function (res) {
            const url = USER_SHARE;
            const data = { cust_id: wx.getStorageSync('cust_id') };
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

/**
 * 用户登录，获取openid, unionid, cust_id
 */
function userLogin(that) {    
    const promise = new Promise((resolve, reject) => {
        wx.login({
            success: function (res) {
                if (res.code) {
                    wx.request({
                        url: USER_LOGIN,
                        data: {
                            code: res.code
                        },
                        success: function (result) {
                            const data = result.data;
                            if (0 == data.code) {
                                console.log('用户登录');
                                const { openid, unionid, cust_id, maxim_cn, maxim_en, comment, img, coin } = data['data'];
                                wx.setStorageSync('openid', openid);
                                wx.setStorageSync('unionid', unionid);
                                wx.setStorageSync('cust_id', cust_id);
                                wx.setStorageSync('coin', coin);
                                wx.setStorageSync('img', img);
                                wx.setStorageSync('comment', comment);
                                
                                console.log('获取用户统一信息');
                                that.setData({ cust_id: cust_id });
                                wx.setStorageSync('maxim_cn', maxim_cn);
                                wx.setStorageSync('maxim_en', maxim_en);                                
                                resolve(cust_id);
                            } else {
                                wx.showModal({
                                    title: '发生错误',
                                    content: data.msg,
                                });
                            }
                        }
                    });
                }
            }
        });
    });
    return promise;
}

/**
 * 获取用户配置
 */
function getUserConfig(cust_id) {
    const url = GET_USER_CONFIG;
    const data = { cust_id: cust_id };
    return httpGet(url, data).then(data => {
        if (0 == data.code) {
            console.log('获取用户系统配置');
            wx.setStorageSync('globalSoundEffect', data['data']['global_sound_effect']);
            wx.setStorageSync('autoPlayPhonetic', data['data']['auto_play_phonetic']);
        } else {
            wx.showModal({
                title: '发生错误',
                content: data.msg,
            });
        }
    });
}

/**
 * 获取用户信息
 */
function getUserInfo() {
    const url = GET_USERINFO;
    const data = { cust_id: wx.getStorageSync('cust_id') };
    return httpPost(url, data).then(data => {
        if (0 == data.code) {
            console.log('获取用户个人信息');
            wx.setStorageSync('nickname', data['data']['nickname']);
            wx.setStorageSync('avatarUrl', data['data']['avatar_url']);
            wx.setStorageSync('gender', parseInt(data['data']['gender']));
            wx.setStorageSync('signin_day', parseInt(data['data']['signin_day']));
        } else {
            wx.showModal({
                title: '发生错误',
                content: data.msg,
            });
        }
    });
}

/**
 * 获取用户词库
 */
function getUserLexicon() {
    const url = GET_USER_LEXICON;
    const data = { cust_id: wx.getStorageSync('cust_id') };
    httpGet(url, data).then(data => {
        if (0 == data.code) {
            console.log('获取用户签到词库');
            wx.setStorageSync('user_lexicon_id', parseInt(data['data']['id']));
            wx.setStorageSync('user_lexicon_name', data['data']['name']);
            wx.setStorageSync('user_lexicon_word_count', parseInt(data['data']['word_count']));
            wx.setStorageSync('user_lexicon_word_completed', parseInt(data['data']['word_completed']));
            wx.setStorageSync('user_daily_word_count', parseInt(data['data']['user_daily_word_count']));
            wx.setStorageSync('user_lexicon_cell_word_count', parseInt(data['data']['cell_word']));
            wx.setStorageSync('is_pass_today', parseInt(data['data']['is_pass_today']));
            console.log('登录完成');            
        } else {
            wx.showModal({
                title: '发生错误',
                content: data.msg,
            });
        }
    });
}

module.exports = {
    updateUserInfo,       // 更新微信用户信息
    commonShareMessage,   // 共用的分享信息
    infinityShareMessage, // 巅峰挑战的分享信息
    userLogin,            // 用户登录
    getUserConfig,        // 获取用户配置
    getUserInfo,          // 获取用户信息
    getUserLexicon        // 获取用户词库
};