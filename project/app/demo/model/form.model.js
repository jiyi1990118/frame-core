/**
 * Created by xiyuan on 17-6-19.
 */
model('selectConf',function () {
    var This=this;
    this.server({
        serverType:'jsonp',
        url:vf.getConf('PROJECT_PATH.serverData')+'/config/form/selectConf.js',
        method:'selectConf'
    }).success(function (res) {

        This.exports=res;
    }).error(function () {
        console.warn('未获取到select配置数据!')
    }).send()
})

//表单布局配置
model('formConf', function () {
    var This = this;
    this.server({
        serverType: 'jsonp',
        method: 'callback',
        url: vf.getConf('PROJECT_PATH.serverData') + '/config/form/formConf.js',
    }).error(function () {
        console.error('表单布局配置渲染请求出错! [演示专用]');
    }).success(function (res) {
        This.exports =window.con= res;
    }).send()


})