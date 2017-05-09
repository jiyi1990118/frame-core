# observer
javascript for es5 Data observation （基于es5核心javascript的数据观察）


### api:

  watch
  
  unWatch

get

destroy

	


### demo code:

	var obsObj={yes:'----'},
            watchFn=function (newVal) {
                console.log('---1---',newVal);
            },
            $observer=observer(obsObj);

        $observer.watch('name.a.c',watchFn);
        var $observer2=observer(obsObj);
        var $observer3=observer(obsObj);

        $observer2.watch('name.a.c',function (newVal) {
            console.log('---2---',newVal);
        });
        $observer3.watch('name.a.c',function (newVal) {
            console.log('---3---',newVal);
        });

        obsObj.name='xiyuan';

        setTimeout(function () {
            obsObj.name={a:{c:'c'}};
            $observer.destroy();
            $observer3.destroy();

            // $observer.unWatch('name.a',watchFn);
        },1000);

        setTimeout(function () {

            obsObj.name.a.c='yes';
            obsObj.name={ag:{c:'c'}};
            $observer2.destroy();

            console.log(obsObj)

        },2000)
