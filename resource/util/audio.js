const { ERROR_AUDIO_URL, CORRECT_AUDIO_URL } = require('constant.js');

function play(src)
{
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = src;
    if (wx.getStorageSync('globalSoundEffect') != 0) {
        innerAudioContext.play();
    }
}

/**
 * 播放正确按钮音效
 */
function playCorrect() {    
    play(CORRECT_AUDIO_URL);    
}

/**
 * 播放错误按钮音效
 */
function playError() {    
    play(ERROR_AUDIO_URL);
}

module.exports = {
    playCorrect,
    playError
};