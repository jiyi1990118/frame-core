/**
 * Created by xiyuan on 17-6-4.
 */
server(function ($app) {
    $app.include({
        apiServer:'./api.js',
        jsonpServer:'./jsonp.js'
    })
})