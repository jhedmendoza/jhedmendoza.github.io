(function ($) {

    const WP_API_POST_URL =  'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts';

    function init() {

        var urlParams = new URLSearchParams(window.location.search);
        var postId = urlParams.get('postId');

        console.log(postId);

        getPostContent(postId);


    }

    function getPostContent(postId) {
        $.ajax({
            url: WP_API_POST_URL+'/'+postId,
            type: 'GET',
            async:false,
            beforeSend: function () {},
            success: function (response) {

                let date = new Date(response.date);
                let dateCreated = date.toISOString().split('T')[0].replace(/-/g, '-');

                $('.post-heading h1').html(response.title);
                $('.main-content').html(response.content);  
                $('.date-posted').html(dateCreated);
            },
            complete: function () {},
            error: function (xhr) {}
        });
    }

    $(document).ready(init);
})(jQuery);