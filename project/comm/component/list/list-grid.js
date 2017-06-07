/**
 * Created by xiyuan on 17-6-4.
 */
listGrid(function ($app) {

    var bodyHtml='<div class="grid-table">' +
        '<div class="grid-table-left-wrap">' +
        '<div class="grid-table-left">' +
        '<div class="grid-header-group">' +
        '<ul class="grid-header-row">' +
        '<li for=" actionData in gridConf.leftColsModel">' +
        '<template config="actionData|:colHeaderHandle($)"></template>' +
        '</li>' +
        '</ul>' +
        '</div>' +
        '<div class="grid-row-group" $-on:mouseout="eventManage.bodyMouseout" $-render="eles|setContainer:[$,\'leftContainer\']">' +
            '<ul class="grid-body-row" for="(rowKey ,rowData ) in gridListData" $-on:click="eventManage.rowClick(rowKey,rowData)" $-on:mouseover="eventManage.rowHover(rowKey,rowData)" $-class="{row-hover:gridConf.rowHoverIndex == rowKey }">' +
                '<li for="(actionKey , actionData) in gridConf.leftColsModel">' +
                    '<template config="actionData|:colDataHandle($,rowData,rowKey,gridListData,eles)"></template>' +
                '</li>' +
            '</ul>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="grid-table-right-wrap">' +
        '<div class="grid-table-right">' +
            '<div class="grid-header-group">' +
            '<ul class="grid-header-row">' +
                '<li class="content-center" $-class="{desc:colModel.order == \'desc\',asc:colModel.order == \'asc\'}" $-on:click="eventManage.headerClick(colKey,colModel)" for=" ( colKey , colModel ) in gridConf.colsModel">' +
                    '<div class="table-cell"><template config="colModel|:colHeaderHandle($)"></template>' +
                    '<span $-if="colModel.order" $-show="gridConf.orderIndex == colKey "><i class="iconfont icon-down-copy-asc"></i><i class="iconfont icon-down-copy-desc"></i></span></div>' +
                '</li>' +
            '</ul>' +
            '</div>' +
            '<div class="grid-row-group" $-on:mouseout="eventManage.bodyMouseout" $-render="eles|setContainer:[$,\'rightContainer\']">' +
                '<ul class="grid-body-row" for="(rowKey , rowData) in gridListData" $-on:click="eventManage.rowClick(rowKey,rowData)" $-on:mouseover="eventManage.rowHover(rowKey,rowData)" $-class="{row-hover:gridConf.rowHoverIndex == rowKey }">' +
                '<li for=" ( colKey , colModel ) in gridConf.colsModel"  $-render="eventManage.render(rowKey,colKey)">' +
                '<template config="colModel|:colDataHandle($,rowData,rowKey,gridListData,eles)"></template>' +
                '</li>' +
                '</ul>' +
            '</div>' +
        '</div>' +
        '</div>' +
        '</div>';


    var footerHtml='<ul>' +
        '<li class="footer-left">' +
        '<ul class="grid-paging-left">' +
            '<li $-on:click="eventManage.pageTurn(1)" $-class="{disabled:gridConf.pageNumber == 1}">首页</li>' +
        '</ul>' +
        '<ul class="grid-paging-center">' +
            '<li $-on:click="eventManage.pageTurn(gridConf.pageNumber-1)" $-class="{disabled:gridConf.pageNumber == 1}"><i class="iconfont icon-left"></i></li>' +
            '<li $-on:click="eventManage.pageTurn(pagingTag)" $-class="{focus:gridConf.pageNumber == pagingTag}" for="pagingTag in pagingListTag"><span>{{pagingTag}}</span></li>' +
            '<li $-on:click="eventManage.pageTurn(gridConf.pageNumber+1)" $-class="{disabled:gridConf.pageNumber == pageCount}"><i class="iconfont icon-right"></i></li>' +
        '</ul>' +
        '<ul class="grid-paging-right">' +
            '<li $-on:click="eventManage.pageTurn(pageCount)" $-class="{disabled:gridConf.pageNumber == pageCount}">尾页</li>' +
        '</ul>' +
        '<div class=toPage>第<input type="text" $-model="searchVal" $-valid="pageCount|searchValid" name="pageNumber">页<button $-on:click="searchVal|toPage:[$,pageCount]" class="page-search">确定</button>共<strong>{{pageCount}}</strong>页</div>' +
        '</li>' +
        '<li class="footer-right">' +//<select config="gridConf.pageSizeList|pageSizeListHandle" ></select>条
            '<span class="split">每页</span><ul><li for="size in gridConf.pageSizeList"><button $-on:click="eventManage.pageSize(size)" $-class="{focus:gridConf.pageSize == size}">{{size}}条</button></li></ul>' +
            '<span>共<strong>{{dataCount}}</strong>条</span>' +
        '</li>' +
        '</ul>';

    var gridTemplate=  '<div class="grid">' +
        '<div class="list-grid">'+
        bodyHtml +
        '<div class="grid-footer">' +
        footerHtml +
        '</div>' +
        '</div>';

    //数据请求
    function dataRequest(scope) {
        var gridConf=scope.gridConf,
            sendData={
                order:gridConf.order,
                orderField:gridConf.orderField,
                pageNow:gridConf.pageNumber,
                pageSize:gridConf.pageSize
            }.extend(gridConf.sendData||{});

        //检查是否有路径
        if(gridConf.url){
            vf.lib.net.ajax({
                url:gridConf.url,
                data:sendData,
                type:gridConf.method||gridConf.type,
                complete:function (res,state) {
                    //数据处理
                    dataListHandle(true,res,state,sendData,scope);
                }
            })

        }else{
            dataListHandle(false,sendData,scope);
        }

    }

    //列表数据处理
    function dataListHandle(isUrl,resData,state,sendData,scope) {
        //检查是否内部url请求还是过滤处理
        if(!isUrl){
            scope=state;
        }

        var $gridConf=scope.gridConf,
            //用于数据内部初始化处理
            dataInit=function (resData) {
                var index=0,
                    pagingListTag=[],
                    dataCount=resData.dataCount,
                    pageCount=Math.ceil(dataCount/sendData.pageSize);

                //检查并执行数据初始化回调
                typeof $gridConf.dataInitConf === 'function' && $gridConf.dataInitConf(resData);

                //写入列表数据到作用域中
                scope.gridListData=resData.dataList;

                //写入分页中
                while (++index <= pageCount && index<= 5){
                    pagingListTag.push(index);
                }
                scope.pagingListTag=pagingListTag;

                //写入列表的页数与条数
                scope.pageCount=pageCount;
                scope.dataCount=dataCount;

                scope.loading=false;

            },
            callback=function (resData) {
                //通过回调获取数据
                dataInit(resData);
                dataInit=null;
            };

        //检查是否有过滤函数
        if(typeof $gridConf.filtration === 'function'){

            if($gridConf.url){
                var res=$gridConf.filtration(state && resData,callback);
                //检查是否有直接返回的值
                ({}.toString.call(res) === "[object Object]") &&  dataInit(res);
            }else{
                $gridConf.filtration.call($gridConf,resData,callback);
            }
            res=null;
            //检查数据及状态
        }else if(state && ({}.toString.call(resData) === "[object Object]")){
            dataInit(resData);
        }

    }

    //列表组件
    $app.component('list-grid', {
        props: {
            conf: {
                key: 'gridConf',
                type: Object,
                watch: function () {

                },
                autoRender: true
            },
        },
        isReplace: true,
        filter: {
            //header标题处理
            colHeaderHandle:function (actionData) {
                var config,
                    titleConfig=actionData.titleConfig;

                switch (true){
                    case titleConfig instanceof Function:
                        config=titleConfig();
                        break;
                    case titleConfig instanceof Object:
                        config=titleConfig;
                        break;
                    case !!actionData.name:
                        config={
                            template:'<p>'+actionData.name+'</p>'
                        }
                        break;
                    case !!actionData.content:
                        config={
                            template:'<p>'+actionData.content+'</p>'
                        }
                        break;
                }

                if(config.template === null || config.template === undefined){
                    config.template=config.content;
                }

                return config
            },
            //数据处理
            colDataHandle:function (colModel,rowData,rowKey,gridListData,eles) {

                // console.log(listConfig,rowData,rowKey,actionData,gridListData,eles)//,actionData,gridListData,eles
                var config,
                    field=colModel.field,
                    colData= rowData[field];
                switch (true ){
                    case colModel.listConfig instanceof  Function:
                        config=colModel.listConfig(colData,rowData,rowKey,gridListData,eles)
                        break;
                    case colModel.listConfig instanceof  Object:
                        config=colModel.listConfig;
                        break;
                    case !!colData:
                        config={
                            template:'<span>'+colData+'</span>',
                        };
                        break;
                    default:
                        console.log(colModel,rowData,rowKey)
                }

                if(config.template === null || config.template === undefined){
                    config={
                        template:'<span>'+(config.content||colData)+'</span>'
                    }
                }else{
                    config.template=String( config.template)
                }

                // console.log('-----------',config)

                return config
            }
        },
        hook: {
            init: function () {

            },
            create: function () {

            },
            destroy: function () {

            }
        },
        render:function (vnode, scope) {

            //用于元素记录容器
            scope.eles={
                leftContainer:null,
                rightContainer:null
            };
            console.log(scope)
            //数据请求
            dataRequest(scope)

            return gridTemplate;
        }
    })

})
