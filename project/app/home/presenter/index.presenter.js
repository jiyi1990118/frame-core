/**
 * Created by xiyuan on 17-6-1.
 */

presenter('index',function () {
    var This=this;

    var title='CRM-首页'

    this.title(title);

    window.scope={}

    this.assign('window',window.scope);

    this.layout('@layout:default').display();

    this.assign('selectConf',[8,9,4,1]);

    This.assign('click',function () {
        console.log('ok!')
    })

    setTimeout(function () {
        This.assign('click',function () {
            console.log('on!')
        })

        This.assign('selectConf',[18,19,4,1,'werrwe','wer23333','ppweire']);
    },3000);


    this.assign('downConf',[1,2,3]);

});