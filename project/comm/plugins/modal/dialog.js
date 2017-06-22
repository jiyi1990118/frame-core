/**
 * Created by xiyuan on 17-1-10.
 */

define(function () {

    var filter={
            btnLen:function (btns) {
                return btns.length;
            },
            trigger:function (btnInfo,interface,innerConf) {
                return function (eve) {
                    innerConf.__state && btnInfo.trigger(eve,interface);
                }
            },
            templateHandle:function (innerConf) {
                return {
                    scope:innerConf.scope,
                    filter:innerConf.filter,
                    template:innerConf.content
                }
            }
        },
        dialogTemplate='<div class="modal-dialog"><div class="modal-dialog-main center" v-class="{fullscreen:innerConf.zoom === \'max\'}" v-style="{height:innerConf.height,width:innerConf.width}">' +
            '<div class="dialog-header"><div class="header-conent">' +
            '<strong class="title-name">{{innerConf.title}}</strong>' +
            '<span class="title-btns"><i class="iconfont icon-fangda" v-if="innerConf.maxmin" v-on:click="interface.zoomToggle"></i><i class="iconfont icon-close" v-on:click="interface.close"></i></span>' +
            '</div></div>' +
            '<div class="dialog-body"><div class="body-content" v-style="{width:innerConf.width}">' +
                '<template config="innerConf|:templateHandle($,innerConf.content)"></template>' +
            '</div></div>' +
            '<div v-if="innerConf.btns|:btnLen"  class="dialog-footer">' +
            '<ul class="footer-content"><li v-for="btnInfo in innerConf.btns"><button type="button" v-attr:class="btnInfo.theme" v-style="btnInfo.style" v-on:click="btnInfo|:trigger($,interface,innerConf)">{{btnInfo.name}}</button></li></ul>' +
            '</div>' +
            '</div></div>';

    return function dialogRender(conf) {
        var innerConf={
                title:'模态框',
                height:'180px',
                width:'350px',
                zoom:'min',
                content:'',
                scope:{},
                filter:{},
                btns:[],
                __state:true
            }.extend(conf=conf||{}),
            transitionend=function (eve) {
                if(eve.propertyName === "transform"){
                    //移除dialog元素
                    dialogEle.parentNode && dialogEle.parentNode.removeChild(dialogEle);
                    //移除事件
                    dialogEle.removeEventListener('transitionend',transitionend);
                    innerConf.__state=true;
                    //销毁数据
                    dialogEle=innerConf=scope=scope.ele.dialogEle=openTransitionend=transitionend=null;
                }
            },
            openTransitionend=function (eve) {
                if(eve.propertyName === "transform"){
                    //传递模板内容
                    innerConf.content=conf.content||'';
                    //事件移除
                    dialogEle.removeEventListener('transitionend',openTransitionend);
                }
            };

        delete innerConf.content;

        var scope={
                innerConf:innerConf,
                interface:{
                    close:function () {
                        //阻止重复点击
                        innerConf.__state=false;

                        dialogEle.classList.remove('open');
                        dialogEle.addEventListener('transitionend',transitionend);
                    },
                    zoomToggle:function () {
                        dialogEle.classList.toggle('fullscreen');
                    },
                    min:function () {
                        dialogEle.classList.remove('fullscreen');
                    },
                    max:function () {
                        dialogEle.classList.add('fullscreen');
                    }

                },
                ele:{
                    dialogEle:null
                }
            },
            dialogEle=scope.ele.dialogEle=vf.renderView(dialogTemplate,scope,filter).elm;

        document.body.appendChild(dialogEle);

        //监听窗口打开过渡事件（主要处理内部渲染）
        dialogEle.addEventListener('transitionend',openTransitionend);

        requestAnimationFrame(function () {
            dialogEle.classList.add('open');
        });

    }


});
