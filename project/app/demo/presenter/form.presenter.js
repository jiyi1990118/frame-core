/**
 * Created by xiyuan on 17-6-19.
 */

presenter('form-layout',function () {
    var This=this;

    This.assign('selectConf',This.model(':selectConf'));

    this.assign('getForm',function (formAPI) {
        return function () {
            console.log(formAPI,formAPI.getData());
        }
    });

    this.assign('validForm',function (formAPI) {
        return function () {
            console.log(formAPI,formAPI.valid());
        }
    });

    this.assign('window',window)

    this.layout('HOME@layout:default').display();
})