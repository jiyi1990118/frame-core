/**
 * Created by xiyuan on 17-6-5.
 */
directive(function ($app) {
    $app.include({
        vIf:'./comm/v-if.js',
        vFor:'./comm/v-for.js',
        vOn:'./comm/v-on.js',
        vClass:'./comm/v-class.js',
        vHref:'./comm/v-href.js',
        vAttr:'./comm/v-attr.js',
        vModel:'./form/v-model.js',
        vDate:'./form/date/v-date.js',
    })
})