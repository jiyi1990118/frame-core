/**
 * Created by xiyuan on 17-6-21.
 */

listGrid(function ($app) {
    var vf=this;

    //相关元素事件绑定
    function bindEvent(container,innerData,method){

        //首页
        container.leftFooter.querySelector('.grid-paging-left li').addEventListener('click',function () {
            if(innerData.pageNow !== 1){
                innerData.pageNow=1;
                //数据请求
                method.dataRequest();
            }
        });

        //尾页
        container.leftFooter.querySelector('.grid-paging-right li').addEventListener('click',function () {
            var lastPage=innerData.pageCount

            if(innerData.pageNow !== lastPage){
                innerData.pageNow=lastPage;
                //数据请求
                method.dataRequest();
            }
        });

        //前进
        container.leftFooter.querySelector('.grid-paging-center>li:first-child').addEventListener('click',function () {
            if(innerData.pageNow > 1){
                innerData.pageNow--;
                //数据请求
                method.dataRequest();
            }
        });

        //后退
        container.leftFooter.querySelector('.grid-paging-center>li:last-child').addEventListener('click',function () {
            var lastPage=innerData.pageCount
            if(innerData.pageNow < lastPage){
                innerData.pageNow++;
                //数据请求
                method.dataRequest();
            }
        });

        //页面输入跳转
        container.leftFooter.querySelector('.page-search').addEventListener('click',function () {
            var val=parseInt(container.leftFooter.querySelector('[name="pageNumber"]').value),
                lastPage=innerData.pageCount

            if(val && val !== innerData.pageNow && val <= lastPage && val >= 1){
                innerData.pageNow=val;
                //数据请求
                method.dataRequest();
            }
        });

        //分页跳转
        container.pagingList.querySelector('ul').addEventListener('click',function (event) {
            var index,
                childs=[].slice.call(this.childNodes),
                element = event.target;

            //检查当前点击是否范围内
            while ((index=childs.indexOf(element)) === -1) {
                if ( element === this ) return;
                element=element.parentNode;
            }

            if(innerData.pagingListTag[index] !== innerData.pageNow){
                innerData.pageNow=innerData.pagingListTag[index];

                var focusElm=this.querySelector('li.focus');
                if(focusElm)focusElm.classList.remove('focus');
                element.classList.add('focus');
                //数据请求
                method.dataRequest();
            }

        });

        //页码大小
        container.sizeList.addEventListener('click',function () {
            var index,
                oldPageSize=innerData.pageSize,
                childs=[].slice.call(this.childNodes),
                element = event.target;

            //检查当前点击是否范围内
            while ((index=childs.indexOf(element)) === -1) {
                if ( element === this ) return;
                element=element.parentNode;
            }

            if(innerData.pageSizeList[index] !== oldPageSize){
                innerData.pageSize=innerData.pageSizeList[index];

                //计算并判断列表的当前页码
                var pageCount=Math.ceil(innerData.dataCount/innerData.pageSize);

                if(pageCount < innerData.pageNow){
                    innerData.pageNow=pageCount;
                }

                var focusElm=this.querySelector('li.focus');
                if(focusElm)focusElm.classList.remove('focus');
                element.classList.add('focus');
                //数据请求
                method.dataRequest();
            }

        });

        //数据排序
        container.rightHeader.addEventListener('click',function (event) {
            var index,
                childs=[].slice.call(this.childNodes),
                element = event.target;

            //检查当前点击是否范围内
            while ((index=childs.indexOf(element)) === -1) {
                if ( element === this ) return;
                element=element.parentNode;
            }

            //获取之前排序的元素
            var selectOrder=this.querySelector('li.order'),
                order=element.getAttribute('order');

            if(order){
                order=order === 'asc'?'desc':'asc';
                //排序样式更变
                element.setAttribute('order',order);
                if(selectOrder)selectOrder.classList.remove('order');
                element.classList.add('order');

                innerData.order=order;
                innerData.orderField=innerData.userFields[index];

                //数据请求
                method.dataRequest();
            }

        });

        //页面跳转的input框输入事件
        container.leftFooter.querySelector('[name="pageNumber"]').onkeydown=function (e) {
            var keyCode = e.keyCode
            // 数字
            if (keyCode >= 48 && keyCode <= 57 ) return true
            // 小数字键盘
            if (keyCode >= 96 && keyCode <= 105) return true
            // Backspace键
            if (keyCode === 8) return true
            return false
        }

        //按钮松开
        container.leftFooter.querySelector('[name="pageNumber"]').addEventListener('keyup',function () {
            if(this.value === '')return;
            if(this.value < 1)this.value=1;
            if(this.value > innerData.pageCount)this.value=innerData.pageCount;
        },false);








    }

    //列表数据处理
    function dataListHandle(sendData,par,resData,state,_callback) {
        var res,
            api=par.api,
            innerData=api.stroage.innerData,
            gridConf=par.gridConf,
            method=api.stroage.method,
            //用于数据内部初始化处理
            dataInit=function (resData) {
                var pagingListTag=[],
                    dataCount=resData.dataCount,
                    pageCount=Math.ceil(dataCount/sendData.pageSize);

                //检查并执行数据初始化回调
                typeof gridConf.dataInitConf === 'function' && gridConf.dataInitConf(resData);

                //写入列表数据到作用域中
                innerData.gridListData=resData.dataList;

                //渲染页面的分页页码
                var startPage,
                    endPage=0;

                if(pageCount > 5){
                    if(3 > innerData.pageNow ){
                        endPage=5;
                        startPage=1;
                    }else if(innerData.pageNow+3 > pageCount){
                        startPage=pageCount - 4;
                        endPage=pageCount;
                    }else{
                        startPage=innerData.pageNow - 2;
                        endPage=innerData.pageNow + 2;
                    }
                }else{
                    startPage=1;
                    endPage=pageCount;
                }

                while (startPage <= endPage){
                    pagingListTag.push(startPage++);
                }
                innerData.pagingListTag=pagingListTag;

                //渲染页面的分页页码
                method.pageNumberUpdate()

                //写入列表的页数与条数
                innerData.pageCount=pageCount;
                innerData.dataCount=dataCount;

                innerData.loading=false;

                //数据列表渲染
                renderList(innerData,api,gridConf);

                _callback instanceof Function && _callback(innerData)
            },
            callback=function (resData) {
                //通过回调获取数据
                dataInit(resData);
                dataInit=new Function;
            };

        //检查是否有过滤函数
        if(typeof gridConf.filtration === 'function'){
            if(res=gridConf.filtration.call(gridConf,resData,callback))dataInit(res);
            res=null;
            //检查数据及状态
        }else if(state && ({}.toString.call(resData) === "[object Object]")){
            dataInit(resData);
        }

    };

    //数据列表渲染
    function renderList(innerData,api,gridConf) {
        var container=api.stroage.container,
            leftGroup=container.leftGroup,
            rightGroup=container.rightGroup,
            gridListData=innerData.gridListData;

        var groupElm=document.createElement('ul'),
            rowLeftContainer=document.createDocumentFragment(),
            rowRightContainer=document.createDocumentFragment();

        groupElm.className='grid-body-row';

        (gridListData||[]).forEach(function (rowData,rowKey) {
            var rowElm=groupElm.cloneNode();

            //元素拼接
            function join(conf) {
                var res,
                    colElm=document.createElement('li');

                var field=conf.field,
                    colData= rowData[field];

                rowElm.appendChild(colElm);

                if(conf.listConfig instanceof Function){
                    res=conf.listConfig(colData,rowData,rowKey,gridListData);
                    if(res instanceof Element){
                        colElm.innerHTML='';
                        colElm.appendChild(res);
                    }else if(typeof res === 'string' || typeof res === 'number'){
                        colElm.innerHTML=res;
                    }
                }
            }

            //左边数据渲染
            (gridConf.leftColsModel||[]).forEach(join);
            rowLeftContainer.appendChild(rowElm);

            rowElm=groupElm.cloneNode();
            
            //左边数据渲染
            (gridConf.colsModel||[]).forEach(join);
            rowRightContainer.appendChild(rowElm);
        });

        leftGroup.innerHTML='';
        rightGroup.innerHTML='';
        leftGroup.appendChild(rowLeftContainer);
        rightGroup.appendChild(rowRightContainer);

        //设置页面数据条数
        container.pageCount.innerHTML=innerData.pageCount;
        container.dataCount.innerHTML=innerData.dataCount;

        //设置 操作按钮

        //首页
        var firstPageElm=container.leftFooter.querySelector('.grid-paging-left li'),
            //尾页
            lastPageElm=container.leftFooter.querySelector('.grid-paging-right li'),
            //前进
            berforPageElm=container.leftFooter.querySelector('.grid-paging-center>li:first-child'),
            //后退
            afterPageElm=container.leftFooter.querySelector('.grid-paging-center>li:last-child');

        if(innerData.pageNow === 1){
            firstPageElm.classList.add('disabled');
            berforPageElm.classList.add('disabled');
        }else{
            firstPageElm.classList.remove('disabled');
            berforPageElm.classList.remove('disabled');
        }

        var lastPage=innerData.pageCount;
        if(innerData.pageNow === lastPage){
            lastPageElm.classList.add('disabled');
            afterPageElm.classList.add('disabled');
        }else{
            lastPageElm.classList.remove('disabled');
            afterPageElm.classList.remove('disabled');
        }
    }

    //列表组件
    $app.component('list-grid', {
        props: {
            config: {
                key: 'gridConf',
                type: Object,
                isEmpty:true,
                watch: function (gridConf) {
                    this.stroage.innerData=this.stroage.innerData.extend({
                        gridConf:gridConf,
                        order:gridConf.order,
                        orderField:gridConf.orderField,
                        pageNow:gridConf.pageNumber||1,
                        pageSize:gridConf.pageSize,
                        sendData:gridConf.sendData,
                        pageSizeList:gridConf.pageSizeList||[10,20,30]
                    });

                    this.stroage.method.updateTitle(gridConf);
                    this.stroage.method.dataRequest(gridConf);
                    this.stroage.method.pageSizeRender(gridConf);
                }
            },
            api:{
                key:'gridAPI',
                isEmpty:true,
                isExports:true,
            }
        },
        isReplace: true,
        hook: {
            init:function () {
                var This=this;
                    //grid组件结构创建
                    elm=document.createElement('div');

                elm.classList.add('list-grid');

                elm.innerHTML='<div class="grid-table">' +
                        '<div class="grid-table-left-wrap">' +
                            '<div class="grid-table-left">' +
                                '<div class="grid-header-group">' +
                                    '<ul class="grid-header-row left-header">' +
                                    '</ul>' +
                                '</div>' +
                                '<div class="grid-row-group left-group">' +

                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="grid-table-right-wrap">' +
                            '<div class="grid-table-right">' +
                                '<div class="grid-header-group">' +
                                    '<ul class="grid-header-row right-header">' +
                                    '</ul>' +
                                '</div>' +
                                '<div class="grid-row-group right-group">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'+
                    '<div class="grid-footer">' +
                        '<ul>' +
                            '<li class="footer-left">' +
                                '<ul class="grid-paging-left">' +
                                    '<li>首页</li>' +
                                '</ul>' +
                                '<ul class="grid-paging-center">' +
                                    '<li><i class="iconfont icon-left"></i></li>' +
                                    '<li class="paging-list">' +
                                        '<ul>' +
                                        '</ul>' +
                                    '</li>' +
                                    '<li><i class="iconfont icon-right"></i></li>' +
                                '</ul>' +
                                '<ul class="grid-paging-right">' +
                                    '<li>尾页</li>' +
                                '</ul>' +
                                '<div class="toPage">第<input name="pageNumber" type="text">页' +
                                '<button class="page-search">确定</button>' +
                                '共<strong class="page-count">0</strong>页' +
                                '</div>' +
                            '</li>' +
                            '<li class="footer-right">' +
                                '<span class="split">每页</span>' +
                                '<ul class="size-list">' +
                                '</ul>' +
                                '<span>共<strong class="data-count">0</strong>条</span>' +
                            '</li>' +
                        '</ul>' +
                    '</div>';

                var leftGroup=elm.querySelector('.left-group'),
                    leftHeader=elm.querySelector('.left-header'),
                    rightGroup=elm.querySelector('.right-group'),
                    rightHeader=elm.querySelector('.right-header'),
                    leftFooter=elm.querySelector('.footer-left'),
                    rightFooter=elm.querySelector('.footer-right');

                var container=this.stroage.container={
                    elm:elm,
                    leftGroup:leftGroup,
                    leftHeader:leftHeader,
                    rightGroup:rightGroup,
                    rightHeader:rightHeader,
                    leftFooter:leftFooter,
                    rightFooter:rightFooter,
                    pagingList:leftFooter.querySelector('.paging-list'),
                    sizeList:rightFooter.querySelector('.size-list'),
                    pageCount:leftFooter.querySelector('.page-count'),
                    dataCount:rightFooter.querySelector('.data-count')
                };

                var innerData=this.stroage.innerData={
                    userFields:[]
                };

                this.stroage.method={
                    //更新标题
                    updateTitle:function () {
                        var gridConf=innerData.gridConf;
                        if(gridConf){
                            //遍历左侧标题
                            leftHeader.innerHTML='';
                            (gridConf.leftColsModel||[]).forEach(function (conf) {
                                var res,
                                    titleElm=document.createElement('li');

                                leftHeader.appendChild(titleElm);

                                if(conf.titleConfig instanceof Function){
                                    res=conf.titleConfig(titleElm,leftHeader);
                                    if(typeof res === 'string'){
                                        titleElm.innerHTML=res;
                                    }else if(res instanceof Element){
                                        titleElm.innerHTML='';
                                        titleElm.appendChild(res);
                                    }
                                }else if(conf.name){
                                    titleElm.innerHTML='<p>'+conf.name+'</p>';
                                }
                            });

                            //遍历右侧标题
                            rightHeader.innerHTML='';
                            (gridConf.colsModel||[]).forEach(function (conf,index) {
                                var res,
                                    titleContainer=document.createElement('li');

                                innerData.userFields.push(conf.field);

                                titleContainer.innerHTML='<div class="table-cell"></div>';

                                rightHeader.appendChild(titleContainer);

                                var titleElm=titleContainer.firstChild;

                                if(conf.titleConfig instanceof Function){
                                    res=conf.titleConfig(titleElm,rightHeader);
                                    if(typeof res === 'string'){
                                        titleElm.innerHTML=res;
                                    }else if(res instanceof Element){
                                        titleElm.innerHTML='';
                                        titleElm.appendChild(res);
                                    }
                                }else if(conf.name){
                                    titleElm.innerHTML='<p>'+conf.name+'</p>';
                                }

                                //排序标识
                                if(conf.order){
                                    titleContainer.setAttribute('order','desc');
                                    var orderElm=document.createElement('span');
                                    orderElm.innerHTML='<i class="iconfont icon-down-copy-asc"></i><i class="iconfont icon-down-copy-desc"></i>';
                                    titleElm.appendChild(orderElm)
                                }
                            });
                        }
                    },
                    //数据请求
                    dataRequest:function () {

                        var gridConf=innerData.gridConf,
                            sendData={
                                order:innerData.order,
                                sidx:innerData.orderField,
                                currentPage:innerData.pageNow,
                                pageSize:innerData.pageSize
                            }.extend(innerData.sendData||{});

                        //检查是否有路径
                        if(gridConf.url){
                            vf.lib.net.ajax({
                                url:gridConf.url,
                                data:sendData,
                                type:gridConf.method||gridConf.type,
                                complete:function (res,state) {
                                    //数据处理
                                    dataListHandle(sendData,{
                                        api:This,
                                        gridConf:gridConf
                                    },res,state);
                                }
                            })
                        }else{
                            dataListHandle(sendData,{
                                api:This,
                                gridConf:gridConf
                            },sendData,undefined);
                        }
                    },
                    //页码渲染
                    pageNumberUpdate:function () {
                        //渲染页面的分页页码
                        var pageNumberHTML='',
                            pageNumberContainer=container.pagingList.querySelector('ul');

                        innerData.pagingListTag.forEach(function (index) {
                            pageNumberHTML+='<li'+(innerData.pageNow === index?' class="focus"':'')+'>'+index+'</li>'
                        });
                        pageNumberContainer.innerHTML=pageNumberHTML;
                    },
                    //页面大小分页渲染
                    pageSizeRender:function () {
                        var sizeHTML='';
                        innerData.pageSizeList.forEach(function (size) {
                            sizeHTML+='<li'+(innerData.pageSize === size?' class=focus':'')+'><button>'+size+'条</button></li>' ;
                        });
                        container.sizeList.innerHTML=sizeHTML;
                    }
                }

                //事件绑定
                bindEvent(container,innerData,this.stroage.method);

                //对外提供数据接口
                var api=this;
                api.exports('gridAPI',{
                    method:this.stroage.method,
                    innerData:innerData
                });

            },
            destroy: function () {

            }
        },
        render:function (vnode, scope) {
            return this.stroage.container.elm;
        }
    })

})