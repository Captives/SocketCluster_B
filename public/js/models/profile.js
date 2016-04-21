/**
 * Created by Administrator on 2016/4/16.
 */
$(function () {
    observe("bind", function () {

    });

    observe("start", function () {

    });

    observe("build-profile", function () {
        $('section[data-route="profile"]').show();
        setTimeout(function () {
            notify('finish-loading');
        },200);
    });
});