/**
 * Created by xiyuan on 17-6-1.
 */

presenter('index',function () {
    var This=this;

    window.title='这是第一个调度器页面!'

    this.title(window.title);

    this.assign('window',window);

    this.layout('@layout:default').display();

    setTimeout(function () {
        This.assign('click',function () {
            console.log('ok!')
        })

        This.assign('testConfig','hello')

        setTimeout(function () {
            This.assign('testConfig','-----')
        },2000)
    },2000)

});