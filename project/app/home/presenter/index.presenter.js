/**
 * Created by xiyuan on 17-6-1.
 */

presenter('index',function () {
    var This=this;

    var title='CRM-首页'

    this.title(title);

    this.assign('window',window);

    this.layout('@layout:default').display();

    This.assign('click',function () {
        console.log('ok!')
    })

    setTimeout(function () {

        This.assign('click',function () {
            console.log('on!')
        })
    },3000)

});