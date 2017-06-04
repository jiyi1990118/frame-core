/**
 * Created by xiyuan on 17-6-4.
 */
presenter('list',function () {
    this.title('列表页面');

    var gridConf=this.model('@custom/list:gridConf');

    this.assign('gridConf',gridConf);

    this.layout('@layout:default').display();

})