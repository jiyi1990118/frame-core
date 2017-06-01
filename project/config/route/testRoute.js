/**
 * Created by xiyuan on 16-5-11.
 */
homeRoute(function ($app) {

    /*应用路由配置 默认*/
    $app.route(function ($route) {

        //常规路由
        $route
            .when(
                //页面路径
                '/index',
                //'/',
                //路由页面配置
                {
                    controller: 'project/test@home:index',
                    view: function ($view) {
                        $view({
                            layout:'',
                            suffix: 'tpl',
                            requireType: 'ajax'
                        });
                        return 'view/index'
                    }
                },
                function ($route) {
                    //自动路由
                    $route.autoRoute('project');
                }
            )
            .when(
                //页面路径
                ['{index}{model}', {model: /[a-z]+/, index: /\d+/}],
                function ($route) {

                    $route.when(['{number}', {number: /\d+/}], function ($route) {
                        /*$route.
                         when(['{ss}',{ss:/\w+/}],
                         {
                         controller: 'project/test@home:index'
                         })*/
                    });

                    //自动路由
                    $route.autoRoute('PROJECT');
                    $route.autoRoute({
                        controllerDir: 'dev.com/controller',
                        viewDir: 'dev.com/view',
                        viewConfig: {
                            suffix: 'tpl',
                            requireType: 'jsonp'
                        }
                    });
                    /*$route.autoRoute(function(lowerUrl,parameter){

                     return {
                     view: 'PROJECT@'+parameter.model,
                     controller: 'PROJECT@index'
                     }
                     });*/

                    $route.suffix('.html');
                }
            )
            .when(
                'success',
                {
                    controller: 'success',
                    view: 'v/success'
                },
                //子路由
                function ($route) {

                    $route.when(function () {

                    });

                    $route.prevUrl == '/index' && $route.redirectTo('/index');
                }
            )
            .when('error', {
                controller: 'error',
                viewTemplate: '页面数据错误!(:</br>' +
                '错误文件:{{errorFile}}</br>' +
                '错误行号:{{errorLine}}</br>' +
                '错误信息:{{errorInfo}}</br>' +
                '<h3>请联系管理员！</h3></br>' +
                '<button x-click="sendEroor()">提交错误</button>'
            })
            .when('404', {
                viewTemplate: '页面不存在！'
            }, function ($route) {
                //自动路由
                $route.autoRoute({
                    controllerDir: 'dev.com/controller',
                    viewDir: 'dev.com/view'
                });
            })
            //当找不到路由
            .other(
                {
                    rewrite: '404'
                }
            )
            //路由拦截器
            .interceptor(function ($routeInfo) {

            })
            //带正则的拦截器
            .when(/^\/product\//, {
                //controller: 'PROJECT@index',
                controller: 'base/sss',
                view: function ($view, $parameter) {
                    $view({
                        suffix: 'tpl',
                        requireType: 'ajax',
                        parameter: {
                            yes: 'ddd',
                            sdf: 'ssddsdf'
                        }
                    });
                    //return 'view/index'
                    return 'PROJECT@index'
                }
            }, function ($route) {
                $route.suffix('');

                $route.autoRoute({
                    controllerDir: 'project/controller',
                    viewDir: 'project/view'
                });
            })
            //路由路径后缀
            .suffix('.jsp')
            //用来做测试
            .when(
                //页面路径
                '/a',
                '/t',
                //路由页面配置
                {
                    controller: 'c/home:index',
                    view: function ($view) {
                        $view({
                            suffix: 'tpl',
                            requireType: 'ajax'
                        });
                        return 'view/index'
                    }
                },
                function ($route) {

                    $route.when('3424', function ($route) {
                        $route.when('wer', {
                            controller: 'sss'
                        });
                    }).suffix('.php');
                }
            )
            .when('regexp', /regexp_/, function ($route) {
                $route.when(/\d+/, {
                    controller: 'sss'
                }).suffix('.regexp');
                $route.when(/\w+/, {
                    controller: 'ssdddddddds'
                }).suffix('.regexp');
            })
        //参数路由/regexp_name \ regexp(\d)+
        /*.when(['/{line}regexp{name}{age}','dddddddddddd', {name: [/xi[a-zA-Z]/, /_name/],age:[/\d+/,/age:\d+/],line:/\d+/,number:function(){
         return this.name[1];
         }}],[/\w+\/(\d+)[a-z]*!/,{line:function(){return this[1];}}], function ($route) {
         $route.when(/\s+/, {
         controller: 'sss'
         }).suffix('.regexp');

         $route.when(/\sd+/, {
         controller: 'ssdddddddds'
         }).suffix('.regexp');
         })*/
    });


    /*应用路由配置 默认*/
    $app.route(function ($route) {

        //常规路由
        $route
            .when(
                //页面路径
                '/home',
                //路由页面配置
                {
                    controller: 'cl/home:index',
                    view: function ($view) {
                        $view = {
                            suffix: 'tpl',
                            requireType: 'ajax'
                        };
                        return 'view/index'
                    }
                }
            )
            //参数路由 argxiyuan25 '/arg{name}{age}'
            .when([/argxi[a-zA-Z]+(\d+)/, 'reg', {
                name: [/xi[a-zA-Z]+/, /_name/], age: /\d+/, number: function () {
                    return this[1];
                }
            }], function ($route) {
                $route.when(/\w+yy/, ['{s}{test}', {s: /\w+/, test: /\w/}], {
                    controller: 'sss'
                });

                $route.when(/\[a-z]\d+/, {
                    controller: 'ssdddddddds'
                })
            })
            //页面错误路由
            .when('error', function ($route) {
                $route.when(['msg{msg}', {msg: /[\w\W]+/}], {
                        controller: 'msg'
                    })
                    .suffix('.error')
            })
    });

    /*自动路由*/
    /*$app.autoRoute({
     '/': {
     controller: 'dev.com/controller',
     view: 'dev.com/view'
     }
     });*/


});
