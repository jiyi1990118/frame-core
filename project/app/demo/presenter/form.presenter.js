/**
 * Created by xiyuan on 17-6-19.
 */

presenter('form-layout',function () {
    var This=this;

    This.assign('selectConf',This.model(':selectConf'));

    this/*.layout('HOME@layout:default')*/.display();
})