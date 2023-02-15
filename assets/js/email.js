(function ($) {

    var xhr;

    function init() {

        const API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

        $('.send-btn').on('click', function (e) {
            e.preventDefault();

            if (xhr && xhr.readyState != 4) xhr.abort();

            xhr = $.ajax({
                url: '',
                type: 'POST',
                data: {},
                beforeSend: function () {
                    $('.send-btn').prop('disabled', true);
                    $('.send-btn .spinner-border').show();
                    $('.send-btn .btn-msg').text('Sending...');
                },
                success: function (response) {
                },
                complete: function () {
                    $('.send-btn').removeAttr('disabled');
                    $('.send-btn .spinner-border').hide();
                    $('.send-btn .btn-msg').text('Send');
                },
                error: function (xhr) {
                    alert("There\'s something wrong. Please try again later.");
                }
            });
        })
    }

    $(document).ready(init);
})(jQuery);