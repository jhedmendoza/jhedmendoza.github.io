(function ($) {

    const WP_API_POST_URL =  'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts';

    function init() {

        var urlParams = new URLSearchParams(window.location.search);
        var postId = urlParams.get('postId');

        getPostContent(postId);

        document.querySelector('title').textContent = $('.post-heading h1').text();
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
                let excerpt = response.excerpt;

                $('.masthead').css('background-image', 'url(' + response.featured_image + ')');

                $('.post-heading h1').html(response.title);
                $('.main-content').html(response.content);  

                $('.date-posted').before('<i class="fa-regular fa-calendar-days me-2">');
                $('.date-posted').html(dateCreated);

                $('meta[name="title"]').attr('content', response.title);
                $('meta[name="description"]').attr('content', excerpt.replace('<p>', '').replace('</p>', '') );
                $('meta[name="image"]').attr('content', response.featured_image);
            },
            complete: function () {},
            error: function (xhr) {}
        });
    }

    $(document).ready(init);

})(jQuery);