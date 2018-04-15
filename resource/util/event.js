// 事件模块
var events = {}; // 事件列表

/**
 * 添加监听
 * @param self
 * @param event_name 事件名
 * @param callback 回调函数
 */
function addListener(self, event_name, callback) {
    let tuple = [self, callback];
    let callbacks = events[event_name];
    if (Array.isArray(callbacks)) {
        callbacks.push(tuple);
    }
    else {
        events[event_name] = [tuple];
    }
}

/**
 * 移除监听
 * @param self
 * @param event_name 事件名
 */
function removeListener(self, event_name) {
    let callbacks = events[event_name];
    if (Array.isArray(callbacks)) {
        events[event_name] = callbacks.filter((tuple) => { return tuple[0] != self; });
    }
}

/**
 * 执行事件
 * @param event_name 事件名
 * @param data 传递的数据
 */
function execute(event_name, data) {
    let callbacks = events[event_name];
    if (Array.isArray(callbacks)) {
        callbacks.map((tuple) => {
            let self = tuple[0];
            let callback = tuple[1];
            callback.call(self, data);
        });
    }
}

module.exports = {
    addListener: addListener,
    removeListener: removeListener,
    execute: execute
};