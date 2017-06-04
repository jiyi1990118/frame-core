/**
 * Created by xiyuan on 17-6-4.
 */

model('gridConf',function () {
    var dataServer=this.server({
        serverType:'api',
        url:'test.html'
    }).error(function (data,option) {
        console.log(data,option)
    }).send();


    console.log(dataServer,'????:::::')

    setTimeout(function () {
        this.exports.data='ok!'
    }.bind(this),2000);


    this.trigger('use',function (a,b) {
        console.log('ok!'+a+b)

        return '-_-'+a+b
    })

    this.exports={
        uu:'yes',
        data:'start'
    };


})