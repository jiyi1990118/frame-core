/**
 * Created by xiyuan on 17-6-9.
 */

/**
 * 页面导航数据结构
 */
model('navStruct',['$::menuList','$::shortcutMenuList'],function (menuList,shortcutMenuList) {
    this.exports={};

    this.watch(function (val) {
        console.log('yes',val)
    })

    //从扩展中获取所有菜单数据
    menuList(this);

    //快捷菜单数据
    shortcutMenuList(this);
})