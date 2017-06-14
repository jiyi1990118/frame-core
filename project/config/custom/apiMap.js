/**
 * Created by xiyuan on 17-6-4.
 */

apiMap(function ($app) {
    //公共配置
    $app.custom({
        API_HOST:'paas.mecrmcrm.com',
        API_GATEWAY:'debug/afa4j',
        API_URL_MAP: {
            //自定义grid数据
            'gridData':'custom/C12002',
            //列表视图渲染
            'gridViewRender':'render/R01003',
            //全部菜单数据
            'menuList':'auth/A05007',
            //快捷菜单
            'shortcutMenuList':'auth/A05009',
            //详情视图渲染
            'detailViewRendering':'render/R01004',
        }
    });

})