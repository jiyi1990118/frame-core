/**
 * Created by xiyuan on 17-6-4.
 */

apiMap(function ($app) {
    //公共配置
    $app.custom({
        API_HOST:'192.168.30.30:8080',
        API_GATEWAY:'debug/afa4j',
        API_URL_MAP: {
            //创建字段
            'addModuleConfigField': '/custom/C01001',
        }
    });

})