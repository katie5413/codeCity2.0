(function ($) {
    var divs = {
        pacman: 5,
    };

    var addDivs = function (n) {
        var arr = [];
        for (i = 1; i <= n; i++) {
            arr.push('<div></div>');
        }
        return arr;
    };

    $.fn.loaders = function () {
        return this.each(function () {
            var elem = $(this);
            $.each(divs, function (key, value) {
                if (elem.hasClass(key)) elem.html(addDivs(value));
            });
        });
    };

    $(function () {
        $.each(divs, function (key, value) {
            $('.loader-inner.' + key).html(addDivs(value));
        });
    });
}.call(window, window.$ || window.jQuery || window.Zepto));
