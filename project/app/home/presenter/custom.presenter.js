/**
 * Created by xiyuan on 17-6-4.
 */
presenter('list',function () {

    this.title('列表页面');

    window.s={
        list:[1,2]
    }

    var viewId=$_GET['viewId'];

    var gridConf=this.model('@custom/list:gridConf');

    gridConf.trigger('request',viewId);

    this.assign('gridConf',gridConf);
    this.assign('test',{y:{c:'ffff'}});

    this.layout('@layout:default').display();

});

//详情页面
presenter('detail',function () {
    this.title('详情页面');
    //
    // var gridApi=this.model();
    //
    // this.assign('gridApi',gridApi);

    var formLayout = this.model('@custom/detail:detailBasicInfo');

    formLayout.trigger('detailConf',$_GET['viewId']?$_GET['viewId']:162,'')

    this.assign('formLayout',formLayout);console.log(formLayout)

    this.layout('@layout:default').display();

});