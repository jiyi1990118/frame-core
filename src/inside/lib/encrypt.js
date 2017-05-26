/**
 * Created by xiyuan on 17-5-26.
 */


//全局唯一id生成
exports.uid = function uid() {
    function n() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return n() + n() + n() + n() + n() + n() + n() + n();
}
