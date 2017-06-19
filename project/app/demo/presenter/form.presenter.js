/**
 * Created by xiyuan on 17-6-19.
 */

presenter('form-layout',function () {
    var This=this;

    this.assign('selectConf',this.model(':selectConf'));

    this.layout('HOME@layout:default').display();
})