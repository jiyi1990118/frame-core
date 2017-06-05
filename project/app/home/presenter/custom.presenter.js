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

    // this.assign('s',window.s);

    this.layout('@layout:default').display();

})