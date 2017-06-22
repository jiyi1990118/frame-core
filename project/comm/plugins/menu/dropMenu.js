/*vf.loadPlugins('PLUGINS/menu/dropMenu',function(dropMenu){
    dropMenu(document.querySelector('.dropbtn'),{
        list:[
            {
                content:'<span>1</span>',
                click:function(){
                    console.log('yes')
                }
            },
            {
                content:'<span>2</span>'
            },
            {
                content:'<span>2</span>'
            },
        ]
    })
})*/



define(function () {

    var showFlag=false;

    var eventMange={
        mouseover:function (event) {
            showFlag=true;
            event.stopPropagation()
        },
        mouseout:function (event) {
            var This=this;
            showFlag=false;
            setTimeout(function () {
                showFlag || removeEvent(This);
            },10);
        }
    };

    //事件绑定
    function bindEvent(menuContainer) {
        menuContainer.addEventListener('mouseover',eventMange.mouseover,false);
        menuContainer.addEventListener('mouseout',eventMange.mouseout,false);
    };

    //移除事件
    function removeEvent(menuContainer) {
        menuContainer.removeEventListener('mouseover',eventMange.mouseover,false);
        menuContainer.removeEventListener('mouseout',eventMange.mouseout,false);
        document.body.contains(menuContainer) && document.body.removeChild(menuContainer)
    };
    
    
    return function (elm,menuData) {
        menuData.config=menuData.config||{
                position:'right'
            };

        //创建元素菜单容器
        var menuContainer=document.createElement('div'),
            classList=menuContainer.classList,
            containerHtml='<ul>';

        //元素对拼
        menuData.list.forEach(function (info) {
            containerHtml+='<li>'+info.content+'</li>'
        });

        menuContainer.innerHTML=containerHtml+'</ul>';

        classList.add('drop-menu-container');
        classList.add(menuData.config.position);

        //绑定菜单点击事件
        menuContainer.querySelector('ul').addEventListener('click',function () {
            var index,
                clickFn,
                childs=[].slice.call(this.childNodes),
                element = event.target;

            //检查当前点击是否范围内
            while ((index=childs.indexOf(element)) === -1) {
                if ( element === this ) return;
                element=element.parentNode;
            }

            clickFn=menuData.list[index].click;

            if(clickFn instanceof Function){
                clickFn.call(element);
            }

        },false)

        //绑定移入事件
        elm.addEventListener('mouseover',function (e) {
            bindEvent(menuContainer);
            showFlag=true;
            //获取组件距离视窗的相关数据
            var boundingClientRect=this.getBoundingClientRect();

            switch (menuData.config && menuData.config.position){
                case 'right':
                    menuContainer.style.top=( document.body.scrollTop + boundingClientRect.top + boundingClientRect.height - elm.offsetHeight )+'px';
                    menuContainer.style.left=(document.body.scrollLeft + boundingClientRect.left + elm.offsetWidth )+'px';
                    break;
                default:
                    menuContainer.style.top=( document.body.scrollTop + boundingClientRect.top + boundingClientRect.height - elm.offsetHeight/2)+'px';
                    menuContainer.style.left=(document.body.scrollLeft + boundingClientRect.left)+'px';
                    menuContainer.style.paddingTop=(elm.offsetHeight/2 + 3)+'px';
            }

            document.body.appendChild(menuContainer);
        },false);

        //移出事件
        elm.addEventListener('mouseout',function (e) {
            showFlag=false;
            setTimeout(function () {
                showFlag || removeEvent(menuContainer);
            },10);
        },false)
    }
    
});