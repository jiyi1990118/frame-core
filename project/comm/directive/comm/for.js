/**
 * Created by xiyuan on 17-6-5.
 */
For(function ($app) {

    $app.directive('for', {
        priority:100,
        scope: {
            listData: []
        },
        //是否需要等待当前指令或组件加载后渲染后续指令与组件
        loadRender:true,
        //是否停止当前节点后续指令与组件渲染
        stopRender:true,
        //是替换当前节点
        isReplace:true,
        //属性作用域
        props: function (expStr) {

            //提取表达式
            var reg = /^\s*(?:(?:\(\s*([a-z\$_]+[\w\$]*)\s*(?:\,\s*([a-z\$_]+[\w\$]*))?\s*\))|([a-z\$_]+[\w\.\$]*))\s*in\s+(.+)\s*$/i,
                matchRes = expStr.match(reg),
                $this=this;

            if (!matchRes)return;

            //匹配的值
            var block_val = matchRes[1],
                block_key = matchRes[2],
                alone_val = matchRes[3],
                source_obj = matchRes[4],
                keyString,
                valString;

            //检查是否有key/index
            if (block_key) {
                keyString = block_val;
                valString = block_key;
            } else {
                valString = block_val || alone_val;
            }

            this.stroage.scopeKey=keyString;
            this.stroage.scopeVal=valString;
            return [
                {
                    key:'listData',
                    exp:source_obj,
                    //获取当前表达式的观察数据信息
                    getWatchInfo:function (watchInfo) {
                        $this.stroage.watchInfo=watchInfo;
                    },
                    type:[Array,Object],
                    /*default:[

                    ],*/
                    autoRender:true
                }
            ]
        },
        event:{

        },
        render: function (vnode, scope) {

            var $this=this,
                watchRenders=[],
                innerVnodes = [];

            //移除上一次for循环的子数据监听
            if(this.stroage.watchRenders instanceof Array){
                console.log(',,,,,,,,,,,,,,',this.stroage.watchRenders.length)
                this.stroage.watchRenders.forEach(function (info) {
                    info.ob.unWatch(info.key,info.fn);
                })
                delete this.stroage.watchRenders;
            }

            //遍历for循环的数据
            scope.listData.forEach(function (val, key) {
                var scope={},
                    watchKey,
                    //节点克隆
                    _vnode=$this.templateVnode.clone();

                scope[$this.stroage.scopeVal]=val;

                if($this.stroage.scopeKey){
                    scope[$this.stroage.scopeKey]=key;
                }

                //传递作用域
                _vnode.scope(scope);

                //观察值的变化
                if($this.stroage.watchInfo){

                    //listData子元素key
                    watchKey=$this.stroage.watchInfo.key+'['+key+']';

                    function watchFn(data) {
                        _vnode.$scope[$this.stroage.scopeVal]=data;
                    }

                    //观察listData中子元素
                    $this.stroage.watchInfo.observer.watch(watchKey,watchFn);

                    watchRenders.push({
                        fn:watchFn,
                        key:watchKey,
                        ob:$this.stroage.watchInfo.observer
                    })
                }
                //节点收集
                innerVnodes.push(_vnode)
            });

            this.stroage.watchRenders=watchRenders;

            console.log(',,,,,,,++++++++,,,,,,,',watchRenders.length)

            console.log(innerVnodes)

            //改变当前节点
            return innerVnodes;
        }
    });

})