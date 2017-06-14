
/**
 * Created by lei on 17-1-9.
 */
model('detailBasicInfo',['$:custom/detail/detailConf:detailConf'],function (detailConf){
	var This = this,
        recordId = $_GET['recordId'],
        viewId = $_GET['viewId'];

	var detailStructureSever=this.server({
        serverType:'api',
        method:'post',
        url:'detailViewRendering' //R01004
    });

    This.trigger('detailConf',function (viewId,gridApi){
    	detailStructureSever.success(function (res){
         
            // console.log(btnList)
            This.exports = detailConf(res,viewId,gridApi);

    	}.bind(this)).error(function (msg){
    		console.log(msg)
    	}).send({
    		 'viewId':viewId,
             "recordId":recordId,
             "isPreview":1
    	})
    })
})

//关联子列表的数据
model('gridConf', ['$:custom/detail:bobayDataListConfig'], function (bobayDataListConfig) {
    var This = this


    var gridStructureSever = this.server({
        serverType: 'api',
        method: 'post',
        url: 'viewRenderConditions'  //R01003
    });

    this.method('getConf', function (viewId, gridApi) {
        // console.log(viewId,'>>>>>>')
        // return

        gridStructureSever.success(function (res) {
            // console.log(res,'-->>',dataListConf(res))
            //获取方法转译后的数据
            this.$model = bobayDataListConfig(viewId, res, gridApi);
           
        }.bind(this)).fail(function (msg) {
            console.log(msg)
        }).send({
            viewId: viewId
        })
    })
// console.log(this)
});