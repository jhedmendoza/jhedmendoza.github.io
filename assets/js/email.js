(function ($) {

    var xhr;

    function init() {

        const API_URL     = 'https://api.emailjs.com/api/v1.0/email/send';
        const SERVICE_ID  = 'service_ioeych3';
        const TEMPLATE_ID = 'jm_xftqc27';
        const USER_ID     = 'rke7kU1n5NYJuQ_vk';

        var contactForm = $('#contact-form');

        contactForm.validate({
            rules: {
                name: {
                    required: true,
                },
                email: {
                    required: true,
                    email: true
                },
                message: {
                    required: true,
                }
            },
            messages: {
                name: 'Please enter your name.',
                email: {
                    required: 'Please enter your email.',
                    email: 'Please enter a valid email address.',
                },
                message: 'Please write something for me.'
            }
        });

        $('.send-btn').on('click', function (e) {
            e.preventDefault();

            if (xhr && xhr.readyState != 4) xhr.abort();

            var data = {
                service_id: SERVICE_ID,
                template_id: TEMPLATE_ID,
                user_id: USER_ID,
                template_params: {
                    'from_name' : $('#name').val().trim(),
                    'from_email': $('#email').val().trim(),
                    'message'   : $('#message').val().trim()
                }
            };

            if ( contactForm.valid() ) {

                xhr = $.ajax({
                    url: API_URL,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    
                    beforeSend: function () {
                        $('.send-btn').prop('disabled', true);
                        $('.send-btn .spinner-border').show();
                        $('.send-btn .btn-msg').text('Sending...');
                    },
                    success: function (response) {
                        $('.sent-message').show().fadeOut(10000);
                        clearFields();
                    },
                    complete: function () {
                        $('.send-btn').removeAttr('disabled');
                        $('.send-btn .spinner-border').hide();
                        $('.send-btn .btn-msg').text('Send');
                    },
                    error: function (xhr) {
                        console.log(xhr);
                        alert("Something went wrong. Please try again later.");
                    }
                });
            }
            else {
            }

        })        
    }

    function clearFields() {
        $('#name').val('');
        $('#email').val('');
        $('#message').val('');
    }

    $(document).ready(init);
})(jQuery);