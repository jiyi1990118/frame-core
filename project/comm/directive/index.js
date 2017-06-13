/**
 * Created by xiyuan on 17-6-5.
 */
directive(function ($app) {
    $app.include({
        vIf:'./comm/v-if.js',
        vFor:'./comm/v-for.js',
        vOn:'./comm/v-on.js',
        vDate:'./form/date/v-date.js',
    })
})