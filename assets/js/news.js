(function ($) {

    const WP_API_URL =  'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts?http_envelope=1';
   
    function init() {

        getBlog();

    }

    function getBlog() {
        $.ajax({
            url: WP_API_URL,
            type: 'GET',
            beforeSend: function () {},
            success: function (response) {
                console.log(response);
            },
            complete: function () {},
            error: function (xhr) {}
        });
    }


    $(document).ready(init);
})(jQuery);