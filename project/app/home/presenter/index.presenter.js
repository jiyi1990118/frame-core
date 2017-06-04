/**
 * Created by xiyuan on 17-6-1.
 */

presenter('index',function () {
    window.title='这是第一个调度器页面!'

    this.title(window.title);

    this.assign('window',window);

    this.layout('@layout:default').display();

});