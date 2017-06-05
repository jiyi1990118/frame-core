/**
 * Created by xiyuan on 17-6-4.
 */
listGrid(function ($app) {

    //列表组件
    $app.component('list-grid', {
        // template: '<div class="grid"><strong>grid{{gridConf.method}}</strong>dsfsdf</div><p>o::::</p>',
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
                    titleName=actionData.name,
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
                                        '<template config="actionData.listConfig|colDataHandle:[$,rowData,rowKey,actionData.field,gridListData,eles]"></template>' +
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
                                        '<template config="colModel|:colHeaderHandle($)"></template>' +
                                        '<span $-if="colModel.order" $-show="gridConf.orderIndex == colKey "><i class="iconfont icon-down-copy-asc"></i><i class="iconfont icon-down-copy-desc"></i></span>' +
                                    '</li>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                        '<div class="grid-row-group" $-on:mouseout="eventManage.bodyMouseout" $-render="eles|setContainer:[$,\'rightContainer\']">' +
                            '<ul class="grid-body-row" for="(rowKey , rowData) in gridListData" $-on:click="eventManage.rowClick(rowKey,rowData)" $-on:mouseover="eventManage.rowHover(rowKey,rowData)" $-class="{row-hover:gridConf.rowHoverIndex == rowKey }">' +
                                '<li for=" ( colKey , colModel ) in gridConf.colsModel"  $-render="eventManage.render(rowKey,colKey)">' +
                                    '<template config="colModel.listConfig|colDataHandle:[$,rowData,rowKey,colModel.field,gridListData,eles]"></template>' +
                                '</li>' +
                            '</ul>' +
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
                '<li $-on:click="eventManage.pageTurn(pagingTag)" $-class="{focus:gridConf.pageNumber == pagingTag}" $-for="pagingTag in pagingListTag"><span>{{pagingTag}}</span></li>' +
                '<li $-on:click="eventManage.pageTurn(gridConf.pageNumber+1)" $-class="{disabled:gridConf.pageNumber == pageCount}"><i class="iconfont icon-right"></i></li>' +
                '</ul>' +
                '<ul class="grid-paging-right">' +
                '<li $-on:click="eventManage.pageTurn(pageCount)" $-class="{disabled:gridConf.pageNumber == pageCount}">尾页</li>' +
                '</ul>' +
                '<div class=toPage>第<input type="text" $-model="searchVal" $-valid="pageCount|searchValid" name="pageNumber">页<button $-on:click="searchVal|toPage:[$,pageCount]" class="page-search">确定</button>共<strong>{{pageCount}}</strong>页</div>' +
                '</li>' +
                '<li class="footer-right">' +//<select config="gridConf.pageSizeList|pageSizeListHandle" ></select>条
                '<span class="split">每页</span><ul><li $-for="size in gridConf.pageSizeList"><button $-on:click="eventManage.pageSize(size)" $-class="{focus:gridConf.pageSize == size}">{{size}}条</button></li></ul>' +
                '<span>共<strong>{{dataCount}}</strong>条</span>' +
                '</li>' +
                '</ul>';

            return  '<div class="grid">' +
                    '<div class="list-grid">'+
                         bodyHtml +
                    '<div class="grid-footer">' +
                        footerHtml +
                    '</div>' +
                '</div>';
        }
    })

})
