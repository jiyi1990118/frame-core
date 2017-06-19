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