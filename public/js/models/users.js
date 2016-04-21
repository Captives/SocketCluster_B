$(function () {
    var display = {};
    observe("bind", function () {
        display.tbody = $('#users-table');
    });

    observe("start", function () {

    });

    //当Users获得焦点的初始化数据
    observe("build-users", function () {
        //通知服务端
        notify('server',{
            route:'Users',
            resource:'index'
        });
     });

    observe('users-index', function (data) {
        console.log(data);
        var users = data.users;
        display.tbody.empty().html(templatizer['users']({
            users:users
        }));
        $('section[data-route="users"]').show();
        setTimeout(function () {
            notify('finish-loading');
        },200);
    });
});