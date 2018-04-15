/**
 * 常量文件
 */

const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'June.', 'July.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

// 服务器根目录
//const ROOT_DOMAIN = 'https://jidear.com/word';
const ROOT_DOMAIN = 'https://svipcoach.com/word';

// 服务器URL
const USER_SHARE = ROOT_DOMAIN + '/Gow/User/share';                                                      // 用户分享 pages
const USER_ADD_RELATE = ROOT_DOMAIN + '/Gow/User/addUserRelate';                                         // 添加好友关系 pages
const BUY_COIN = ROOT_DOMAIN + '/Gow/Pay/buyCoin';                                                       // 购买金币 pages

const USER_LOGIN = ROOT_DOMAIN + '/Gow/User/login';                                                      // 用户登录 home/start
const GET_USER_CONFIG = ROOT_DOMAIN + '/Gow/Config/getUserConfig';                                       // 获取用户配置 home/start
const GET_USERINFO = ROOT_DOMAIN + '/Gow/User/getUserInfo';                                              // 获取用户信息 home/start
const GET_USER_LEXICON = ROOT_DOMAIN + '/Gow/Recite/getUserLexicon';                                     // 获取用户签到词库 home/start
const GET_USER_SIGNIN_DAYS = ROOT_DOMAIN + '/Gow/Recite/getMonthReciteDays';                             // 获取用户签到日期 home/index
const GET_USER_REVIEW_STAR_PERCENT = ROOT_DOMAIN + '/Gow/Review/getReviewProgress';                      // 获取用户复习闯关进度 home/index

const GET_LEXICON_LIST = ROOT_DOMAIN + '/Gow/Lexicon/getLexiconList';                                    // 获取词库列表 lexicon/choice
const GET_LEXICON_INFO = ROOT_DOMAIN + '/Gow/Lexicon/getLexiconInfo';                                    // 获取词库信息 lexicon/daily
const GET_DAILY_WORD_COUNT_OPTIONS = ROOT_DOMAIN + '/Gow/Lexicon/getDailyWordCount';                     // 获取每日签到新词数 lexicon/daily
const SET_USER_LEXICON = ROOT_DOMAIN + '/Gow/Recite/setUserLexicon';                                     // 设置用户词库 lexicon/daily

const GET_TODAY_WORDS = ROOT_DOMAIN + '/Gow/Recite/getTodayWords';                                       // 获取今日签到单词 recite/words
const GET_SIGNIN_STATE = ROOT_DOMAIN + '/Gow/Recite/getSigninState';                                     // 获取今日签到状态 recite/words
const GET_TODAY_TEST_WORDS = ROOT_DOMAIN + '/Gow/Recite/getTodayTestWords';                              // 获取今日签到考核单词 recite/test
const UPLOAD_RECITE_SCORE = ROOT_DOMAIN + '/Gow/recite/report';                                          // 上传签到成绩 recite/score

const GET_USER_REVIEW_PROGRESS = ROOT_DOMAIN + '/Gow/Review/getUserReviewProgress?lexicon_id=';          // 获取用户复习进度 review/index
const GET_LEVEL_WORDS = ROOT_DOMAIN + '/Gow/Review/getLevelWords?level_id=';                             // 获取关卡词汇 review/detail
const GET_LEVEL_TEST_WORDS = ROOT_DOMAIN + '/Gow/Review/getLevelTestWords?level_id=';                    // 获取关卡考核单词 review/test
const UPLOAD_REVIEW_SCORE = ROOT_DOMAIN + '/Gow/review/report';                                          // 上传复习成绩 review/score
const GET_REVIEW_STAR = ROOT_DOMAIN + '/Gow/Review/getReviewStar';                                       // 获取目前的星星数 review/score

const ADD_TEMPLATE_FORMID = ROOT_DOMAIN + '/Gow/Template/addToken';                                      // 添加模板消息 infinity/index
const GET_INFINITY_TEST_WORD = ROOT_DOMAIN + '/Gow/Infinity/getInfinityWord';                            // 获取巅峰挑战考核单词 infinity/wait
const GET_INFINITY_TEST_WORD_V2 = ROOT_DOMAIN + '/Gow/Infinity/getInfinityWordv2';                       // 获取巅峰挑战考核单词 infinity/test
const SEND_INFINITY_RECOVER = ROOT_DOMAIN + '/Gow/Infinity/recover';                                     // 发送巅峰挑战复活信息 infinity/score
const UPLOAD_INFINITY_SCORE = ROOT_DOMAIN + '/Gow/Infinity/report';                                      // 上传巅峰挑战考核成绩 infinity/score
const GET_WORLD_LEADERBOARD = ROOT_DOMAIN + '/Gow/Infinity/getWorldRank';                                // 获取本赛季世界排行榜 infinity/score
const GET_FRIEND_LEADERBOARD = ROOT_DOMAIN + '/Gow/Infinity/getFriendRank';                              // 获取本赛季好友排行榜 infinity/score
const GET_SEASON_COUNTDOWN = ROOT_DOMAIN + '/Gow/Infinity/getSeasonCountDown';                           // 获取赛季结束时间 infinity/score
const GET_LEADERBOARD = ROOT_DOMAIN + '/Gow/Infinity/getLeaderboard';                                    // 获取本赛季排行榜 infinity/score
         
const UPDATE_USERINFO = ROOT_DOMAIN + '/Gow/User/updateUserinfo';                                        // 更新用户资料 user/index
const SET_GLOBAL_SOUND_EFFECT = ROOT_DOMAIN + '/Gow/Config/setGlobalSoundEffect';                        // 设置全局音效 user/index
const SET_WORD_AUTO_PLAY_PHONETIC = ROOT_DOMAIN + '/Gow/Config/setWordAutoPlayPhonetic';                 // 设置自动发音 user/index
const GET_USER_COIN = ROOT_DOMAIN + '/Gow/User/getUserCoin';                                             // 获取用户金币 user/index
const GET_RECITE_LOG = ROOT_DOMAIN + '/Gow/Log/getReciteLog';                                            // 获取签到日志 user/signin/recite
const GET_USER_DATA = ROOT_DOMAIN + '/Gow/Log/getUserData';                                              // 获取用户数据 user/statistics/data
const GET_COIN_CONFIG = ROOT_DOMAIN + '/Gow/Config/getCoinConfig';                                       // 获取金币配置 user/coin/buy
const GET_COIN_LOG = ROOT_DOMAIN + '/Gow/User/getUserCoinBill';                                          // 获取金币账单 user/coin/detail

const SEARCH_WORD = ROOT_DOMAIN + '/Gow/Search/word?word=';                                              // 极速查词API
const WORD_SENTENCE = ROOT_DOMAIN + '/Gow/Search/sentence?word=';                                        // 金山词霸例句API
const PHONETIC_API = 'https://dict.youdao.com/dictvoice?audio=';                                         // 音标发音API

// 图片素材
const DEFAULT_AVATAR_IMG = ROOT_DOMAIN + '/Public/resource/image/icon/gow/global/avatar.png';            // 默认头像
const RETURN_ICON = ROOT_DOMAIN + '/Public/resource/image/icon/gow/global/return.png';                   // 返回图标
const PERSION_DATA_COVER = ROOT_DOMAIN + '/Public/resource/image/icon/gow/global/data.jpg';              // 个人成就页封面
const PERSION_DATA_SHARE_COVER = ROOT_DOMAIN + '/Public/resource/image/icon/gow/global/recite.jpg'; // 个人成就页分享封面
const PHONETIC_SOUND_ICON = ROOT_DOMAIN + '/Public/resource/image/icon/gow/global/sound.png';            // 音标发音图标

const BOOK_BANNER_0 = ROOT_DOMAIN + '/Public/resource/image/icon/gow/book/banner0.jpg';                  // 未选择词库的封面
const BOOK_BANNER_1 = ROOT_DOMAIN + '/Public/resource/image/icon/gow/book/banner1.jpg';                  // 小学英语的封面
const BOOK_BANNER_2 = ROOT_DOMAIN + '/Public/resource/image/icon/gow/book/banner2.jpg';                  // 初中英语的封面
const BOOK_BANNER_3 = ROOT_DOMAIN + '/Public/resource/image/icon/gow/book/banner3.jpg';                  // 高中英语的封面
const BOOK_BANNER_4 = ROOT_DOMAIN + '/Public/resource/image/icon/gow/book/banner4.jpg';                  // 大学四级英语的封面
const BOOK_BANNER_5 = ROOT_DOMAIN + '/Public/resource/image/icon/gow/book/banner5.jpg';                  // 大学六级英语的封面
const BOOK_CIRCLE = ROOT_DOMAIN + '/Public/resource/image/icon/gow/book/book';                           // 词库选择的封面图

const SIGNIN_SUCCESS = ROOT_DOMAIN + '/Public/resource/image/icon/gow/recite/success.jpg';               // 签到成功封面 recite/score
const SIGNIN_FAIL = ROOT_DOMAIN + '/Public/resource/image/icon/gow/recite/fail.jpg';                     // 签到失败封面 recite/score

const HOME_GAME_ICON = ROOT_DOMAIN + '/Public/resource/image/icon/gow/home/game.png';                    // 首页巅峰挑战图标
const HOME_TRANSLATE_ICON = ROOT_DOMAIN + '/Public/resource/image/icon/gow/home/translate.png';          // 首页极速查词图标
const HOME_SETTING_ICON = ROOT_DOMAIN + '/Public/resource/image/icon/gow/home/setting.png';              // 首页个人中心图标

const SEARCH_SHARE_IMG = ROOT_DOMAIN + '/Public/resource/image/icon/gow/search/share2.png';              // 极速查词分享封面
const SEARCH_TALK_IMG = ROOT_DOMAIN + '/Public/resource/image/icon/gow/search/talk2.png';                 // 极速查词回答图标
const SEARCH_SOUND_IMG = PHONETIC_SOUND_ICON;                                                            // 极速查词发音图标
const SEARCH_LEAVE_IMG = ROOT_DOMAIN + '/Public/resource/image/icon/gow/search/left.png';                // 极速查词返回图标

const INFINITY_COVER_IMG = ROOT_DOMAIN + '/Public/resource/image/icon/gow/infinity/infinity.jpg';        // 巅峰挑战分享封面

// 音频
const ERROR_AUDIO_URL = '/resource/audio/error.wav';
const CORRECT_AUDIO_URL = '/resource/audio/pixies.mp3';
const CLICK_AUDIO_URL = '/resource/audio/click.wav';


module.exports = {
    MONTHS,                       // 月份简写常量
    // URL
    USER_SHARE,                   // 用户分享 pages
    USER_ADD_RELATE,              // 添加好友关系 pages
    BUY_COIN,                     // 购买金币

    USER_LOGIN,                   // 用户登录 home/start
    GET_USER_CONFIG,              // 获取用户配置 home/start
    GET_USERINFO,                 // 获取用户信息 home/start
    GET_USER_LEXICON,             // 获取用户词库 home/start    
    GET_USER_SIGNIN_DAYS,         // 获取用户签到日期 home/index
    GET_USER_REVIEW_STAR_PERCENT, // 获取用户复习闯关进度 home/index

    GET_LEXICON_LIST,             // 获取词库列表 lexicon/choice
    SET_USER_LEXICON,             // 设置用户词库 lexicon/daily
    GET_LEXICON_INFO,             // 获取词库信息 lexicon/daily
    GET_DAILY_WORD_COUNT_OPTIONS, // 获取每日签到新词数 lexicon/daily

    GET_TODAY_WORDS,              // 获取今日签到单词 recite/words
    GET_SIGNIN_STATE,             // 获取今日签到状态 recite/words
    GET_TODAY_TEST_WORDS,         // 获取今日签到考核单词 recite/test
    UPLOAD_RECITE_SCORE,          // 上传签到成绩 recite/score

    GET_USER_REVIEW_PROGRESS,     // 获取用户复习进度 review/index
    GET_LEVEL_WORDS,              // 获取关卡词汇 review/detail
    GET_LEVEL_TEST_WORDS,         // 获取关卡考核单词 review/test
    UPLOAD_REVIEW_SCORE,          // 上传复习成绩 review/score
    GET_REVIEW_STAR,              // 获取目前的复习星星数 review/score

    ADD_TEMPLATE_FORMID,          // 添加巅峰挑战模板消息 infinity/index
    GET_INFINITY_TEST_WORD,       // 获取巅峰挑战考核单词 infinity/wait
    GET_INFINITY_TEST_WORD_V2,    // 获取巅峰挑战考核单词 infinity/test
    SEND_INFINITY_RECOVER,        // 发送巅峰挑战复活信息 infinity/score
    UPLOAD_INFINITY_SCORE,        // 上传巅峰挑战考核成绩 infinity/score
    GET_WORLD_LEADERBOARD,        // 获取本赛季世界排行榜 infinity/score
    GET_FRIEND_LEADERBOARD,       // 获取本赛季好友排行榜 infinity/score
    GET_SEASON_COUNTDOWN,         // 获取赛季结束时间 infinity/score
    GET_LEADERBOARD,              // 获取赛季排行榜 infinity/score

    UPDATE_USERINFO,              // 更新用户资料 user/index
    SET_GLOBAL_SOUND_EFFECT,      // 设置全局音效 user/index
    SET_WORD_AUTO_PLAY_PHONETIC,  // 设置自动发音 user/index
    GET_USER_COIN,                // 获取用户金币 user/index
    GET_RECITE_LOG,               // 获取签到日志 user/signin/recite
    GET_USER_DATA,                // 获取用户数据 user/statistics/data
    GET_COIN_CONFIG,              // 获取金币配置 user/coin/buy
    GET_COIN_LOG,                 // 获取金币账单 user/coin/detail

    SEARCH_WORD,                  // 极速查词API
    WORD_SENTENCE,                // 金山词霸例句API
    PHONETIC_API,                 // 音标发音API

    // 图片、图标 
    DEFAULT_AVATAR_IMG,           // 默认头像
    RETURN_ICON,                  // 返回图标
    PERSION_DATA_COVER,           // 个人成就页封面
    PERSION_DATA_SHARE_COVER,     // 个人成就页分享封面
    PHONETIC_SOUND_ICON,          // 音标发音文件

    BOOK_BANNER_0,                // 未选择词库的封面
    BOOK_BANNER_1,                // 小学英语的封面
    BOOK_BANNER_2,                // 初中英语的封面
    BOOK_BANNER_3,                // 高中英语的封面
    BOOK_BANNER_4,                // 大学四级英语的封面
    BOOK_BANNER_5,                // 大学六级英语的封面
    BOOK_CIRCLE,                  // 词库选择的封面图

    SIGNIN_SUCCESS,               // 签到成功封面 recite/score
    SIGNIN_FAIL,                  // 签到失败封面 recite/score

    HOME_GAME_ICON,               // 首页-巅峰挑战
    HOME_TRANSLATE_ICON,          // 首页-极速查词图标
    HOME_SETTING_ICON,            // 首页-个人中心图标

    SEARCH_SHARE_IMG,             // 极速查词-极速查词分享封面
    SEARCH_TALK_IMG,              // 极速查词-极速查词回答图标
    SEARCH_SOUND_IMG,             // 极速查词-极速查词发音图标
    SEARCH_LEAVE_IMG,             // 极速查词-极速查词返回图标

    INFINITY_COVER_IMG,           // 巅峰挑战-巅峰挑战分享封面

    ERROR_AUDIO_URL,              // 错误音效
    CORRECT_AUDIO_URL,            // 正确音效
    CLICK_AUDIO_URL,              // 点击音效    
};