/**
 * Created by xiyuan on 17-6-9.
 */

appNav(function ($app) {

    //列表组件
    $app.component('app-nav', {
        props: {
            conf: {
                key: 'conf',
                type: Object,
                autoRender: true
            },
        },
        isReplace: true,
        scope: function () {
            return {}
        },
        filter: {},
        render: function (vnode, scope) {

            return '<div class="app-nav">' +
                '<div class="nav-befor">' +
                    '<ul>' +
                        '<li><i class="img" style="background-image:url( ./project/comm/img/comm/menu-logo.png );background-position: center center;width: 100px;height: 49px;background-size: cover;"></i></li>' +
                        '<li>' +
                            '<div class="app-menu" style="position: relative;">' +
                                '<ul class="app-menu-content" style="column-count:4;-moz-column-count:4;-webkit-column-count:4;">' +
                                    '<li v-for="menuGroup in conf.menuList">' +
                                        '<a><span>{{menuGroup.name}}</span></a>' +
                                        '<ul class="app-menu-group-content">' +
                                            '<li v-for="menuData in menuGroup.list">' +
                                                '<a href="">' +
                                                    '<i style="color:" class="iconfont icon-aIcon aIcon-sousuo"></i>' +
                                                    '<span>{{menuData.name}}</span>' +
                                                '</a>' +
                                            '</li>' +
                                        '</ul>' +
                                    '</li>' +
                                '</ul>' +
                                '<i class="iconfont icon-menu"></i>' +
                            '</div>' +
                        '</li>' +
                        '<li><a href="home/index"><i class="iconfont icon-index-copy"></i></a></li>' +
                        '<li v-for="menuGroup in conf.shortcutMenuList">' +
                            '<a href="home/custom/list>{{menuGroup.name}}</a>' +
                            '<i class="iconfont icon-down"></i>' +
                            '<ul class="nav-menu">' +
                                '<li v-for="menuData in menuGroup.list"><a>{{menuData.name}}</a></li>' +
                            '</ul>' +
                        '</li>' +
                    '</ul>' +
                '</div>' +
                '<div class="nav-after">' +
                    '<ul>' +
                        '<li>' +
                            '<i class="img" style="background-image:url( ./project/comm/img/comm/head.png );background-size: 100% 100%;width: 35px;height: 35px;margin-right: 10px;"></i>' +
                            '<a href="admin/personalInformation/personalInformation"><span>匿名用户</span></a>' +
                            '<ul class="nav-menu">' +
                                '<li><span>个人信息</span></li>' +
                                '<li><span>修改密码</span></li>' +
                                '<li><span>自定义快捷菜单</span></li>' +
                            '</ul>' +
                        '</li>' +
                        '<li><a target="_blank" href="#!/admin/organization/organization"><i class="iconfont icon-shezhi"></i><span>设置</span></a></li>' +
                    '</ul>' +
                '</div>' +
                '</div>';


        }
    })


})
