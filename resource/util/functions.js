// 工具函数

/**
 * 发送Get请求
 * @param url 请求的网址
 * @param data 发送的数据
 */
function httpGet(url, data = {}) {
    let promise = new Promise(function (resolve, reject) {
        wx.request({
            url: url,
            data: data,
            method: 'GET',
            success: function (result) {
                if (result.statusCode == 200) {
                    resolve(result.data);
                }
                else {
                    reject();
                }
            },
            fail: function () {
                reject();
            }
        });
    });
    return promise;
}

/**
 * 发送Post请求
 * @param url 请求的网址
 * @param data 发送的数据
 */
function httpPost(url, data = {}) {
    let promise = new Promise(function (resolve, reject) {
        wx.request({
            url: url,
            data: data,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (result) {
                if (result.statusCode == 200) {
                    resolve(result.data);
                }
                else {
                    reject();
                }
            },
            fail: function () {
                reject();
            }
        });
    });
    return promise;
}

/**
 * 生成范围数组
 */
function range(length)
{
    let result = [];
    for (let i = 0; i < length; i++)
    {
        result.push(i);
    }
    return result;
}

/**
 * 防止快速点击
 */
function preventDoubleClick(self, timeout = 500) {
    self.setData({ buttonClicked: true});
    setTimeout(function () {
        self.setData({ buttonClicked: false})
    }, timeout);
}



module.exports = {
    httpGet,
    httpPost,
    range,
    preventDoubleClick
}