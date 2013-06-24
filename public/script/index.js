
require(['jquery'], function($) {
    var highlight = function(image) {
        $.each($('img'), function(index, value) {
            $(value).removeClass('highlight');
        });
        $(image).addClass('highlight');
    };
    $(document).ready(function() {
        $($('img')[0]).addClass('highlight');
        $.each($('img'), function(index, value) {
            $(value).click(function() {
                highlight(value);
            });
        });
    });
});