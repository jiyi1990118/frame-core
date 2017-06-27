/**
 * Created by xujianwei on 2017/6/26.
 */
formLayout(function($app){


    /**
     * 构建布局
     * @param rowVal
     * @param key
     * @param config
     */
    function structureLayout(rowVal,key,config){
        var template='',
            innerConfig=rowVal.config,
            scope=rowVal.scope||{},
            filter=rowVal.filter||{},
            $value= innerConfig.$value?'$-value="'+innerConfig.$value+'"':'',
            $model=innerConfig.$model ?'$-model="'+innerConfig.$model+'"':'',
            value=innerConfig.value === undefined ?'':'value="'+innerConfig.value+'"';

        //注入作用域
        scope.$config=config;
        scope.$innerConfig=innerConfig;


        //元素组装
        switch (innerConfig.type){case 'time':
            case 'date':
            case 'datetime':
            case 'text':
            case 'color':
            case 'file':
            case 'password':

            case 'icons':
            case 'grid':
            case 'tree':
            case 'treeAndGrid':
            case 'organisation':
            case 'editor':
            case 'radios':
            case 'checkboxs':

                template='<input v-class="{readonly:$innerConfig.readOnly,disable:$innerConfig.disable}" type="'+innerConfig.type+'" '+$model+' v-attr:name="$innerConfig.name" config="$innerConfig.$config" '+value+' '+$value+' v-attr:placeholder="$innerConfig.placeholder" v-valid="$innerConfig.valid" v-events="$innerConfig.events">';
                break;
            //下拉选择
            case 'select':
                template='<select v-attr:name="$innerConfig.name" config="$innerConfig.$config" v-attr:placeholder="eleConf.config.placeholder" '+$model+' '+value+' '+$value+'  v-events="eleConf.config.events"></select>';
                break;
            //多行文本框
            case 'textarea':
                template='<textarea v-attr:name="$innerConfig.name"  '+$model+' '+value+' '+$value+'  v-attr:placeholder="$innerConfig.placeholder" v-events="$innerConfig.events">{{value}}</textarea>';
                break;
            case 'custom':
                template='<template config="$innerConfig"></template>';
                break;
        }

        return {
            scope:scope,
            filter:filter,
            template:template
        }
    }

    $app.component('form-layout', ['PLUGINS/form/chosen.jquery.js'], function ($) {
        return {
            props: {
                config: {
                    key:'config',
                    watch: function (layoutData) {
                    },
                    autoRender: true
                }
            },
            hook: {
                insert: function (newVnode) {

                },
                destroy: function (vnode) {

                }
            },
            isReplace: true,
            template:'<div class="form-layout" style="background-color: white;height:100%;"><ul>' +
            '<li v-for="(key,rowVal) in config.list"><label>{{rowVal.title}}</label><ins><template config="rowVal|:insTemplate($,key,config)"></template></ins></li>' +
            '</ul></div>',
            filter:{
                insTemplate:structureLayout
            }
        }
    })

})