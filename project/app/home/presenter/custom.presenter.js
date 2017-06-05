/**
 * Created by xiyuan on 17-6-4.
 */
presenter('list',function () {

    var viewId=$_GET['viewId'];
    var gridConf=this.model('@custom/list:gridConf');

    gridConf.trigger('request',viewId);

    this.title('列表页面');

    this.assign('gridConf',gridConf);

    this.layout('@layout:default').display();

})