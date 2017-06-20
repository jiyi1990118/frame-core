/**
 * Created by xiyuan on 17-6-9.
 */

//主菜单
extend(['$::menuListConversion'],function (menuListConversion) {

    var This=this;

    var menuData;

    function getData(callback) {

        This.server({
            serverType:'api',
            url:'menuList'
        }).success(function (res) {
            callback(menuData=menuListConversion(res));
        }).error(function (res) {
            console.error('菜单数据请求出错! ['+res.message+']');
        }).send({
            sourceType:0
        });
    }

    return function (defaultModel) {
        if(menuData)return defaultModel.exports=menuData;

        getData(function (resData) {
            defaultModel.exports.menuList=menuData=resData;
        })
        return menuData
    }

})

//快捷菜单
extend('shortcutMenuList',['$::menuListConversion'],function (menuListConversion) {

    var This=this;

    var shortcutMenuData;

    function getData(callback) {

        This.server({
            serverType:'api',
            url:'shortcutMenuList'
        }).success(function (res) {
            callback(shortcutMenuData=menuListConversion(res));
        }).error(function (res) {
            console.error('快捷菜单数据请求出错! ['+res.message+']');
        }).send();
    }

    return function (defaultModel) {

        if(shortcutMenuData)return defaultModel.exports.shortcutMenuList=shortcutMenuData;

        getData(function (resData) {
            defaultModel.exports.shortcutMenuList=resData;
        })

        return shortcutMenuData
    }
})


//菜单数据转换
extend('menuListConversion',function () {
    return function menuListConversion(listData) {
        var resList=[],
            tmpMap={},
            order=[],
            parentMap={};

        listData.forEach(function (menuInfo) {
            (tmpMap[menuInfo.parentId]=tmpMap[menuInfo.parentId]|| (order.push(menuInfo.parentId),[])).push({
                id:menuInfo.id,
                viewId:menuInfo.viewId,
                icon:menuInfo.iconClass,
                iconColor:menuInfo.iconColor,
                name:menuInfo.menuName,
                // href:menuInfo.menuUrl
                href:'home/custom/list?viewId='+menuInfo.viewId+'&moduleId='+menuInfo.moduleId+'&pageName='+menuInfo.menuName,
            });
        });

        (tmpMap[0]||[]).forEach(function (menuInfo) {
            parentMap[menuInfo.id]={
                name:menuInfo.name,
                viewId:menuInfo.viewId,
                id:menuInfo.id
            }
        });

        delete tmpMap[0];
        tmpMap.forEach(function (menuList,parentId) {
            parentMap[parentId] && (parentMap[parentId].list=menuList);
        });

        order.forEach(function (parentId) {
            parentMap[parentId] && resList.push(parentMap[parentId])
        });

        tmpMap=order=parentMap=null;
        return resList.length?resList:[{
            name:'暂无数据'
        }];
    }


})