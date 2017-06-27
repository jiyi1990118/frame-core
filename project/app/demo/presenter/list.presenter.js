/**
 * Created by xiyuan on 17-6-21.
 */

presenter('list-grid',function () {

    var gridConf=this.model('HOME@custom/list:gridConf');

    gridConf.trigger('request',136&&148);

    this.assign('gridConf',gridConf);

    this.assign('getAPI',function (gridAPI) {
        return function () {
            console.log(gridAPI,'yes')
        }
    })

    this.layout('HOME@layout:default').display();
})