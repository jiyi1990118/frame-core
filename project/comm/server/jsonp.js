/**
 * Created by xiyuan on 17-6-4.
 */

jsonpServer(function ($app) {

    var JSONP=vf.lib.net.jsonp;

    $app.server('jsonp',{
        request:function (option,sendData) {
            var api=this,
                url=option.url;

            option.data=option.data||{};

            Object.keys(sendData||{}).forEach(function (key) {
                option.data[key]=sendData[key];
            });


            JSONP({
                url: url,
                data:option.data,
                jsonpCallback: option.method||'callback',
                complete: function (data) {
                    var sourceMap;
                    //检查返回的状态
                    if (this.state) {
                        if(arguments.length !== 1){
                            //检查是否多个jsonp切片
                            sourceMap=(this.many ? [].slice.call(arguments) : [[].slice.call(arguments)]).reduce(function (map,source) {
                                map[source[0]]=source[1];
                                return map;
                            },{});
                            api.success(sourceMap);
                        }else{
                            api.success(data);
                        }

                    } else {
                        api.error();
                    }

                    api.complete(sourceMap);
                }
            })

        },
        filter:{
            request:function (option) {

            },
            success:function (res,option) {
                
            },
            error:function (res,option) {

            },
            receive:function (res,option) {

            }
        },
        config:{
            header: {
                // 'Device-Type':'mobile',
                // 'X-XSRF-TOKEN':getCookie('XSRF-TOKEN'),
                // 'X-Requested-With':'XMLHttpRequest'
            },
            timeout:600,
            dataType: 'json'
        }

    })



});
