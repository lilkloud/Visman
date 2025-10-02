(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner(0);
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.nav-bar').addClass('sticky-top shadow-sm');
        } else {
            $('.nav-bar').removeClass('sticky-top shadow-sm');
        }
    });
    
    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 5,
        time: 2000
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });

    // Testimonial-carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 2000,
        center: false,
        dots: false,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            1200:{
                items:2
            }
        }
    });

    // Contact form submission (Contact page)
    $(function () {
        const $contactForm = $('.contact form');
        if ($contactForm.length) {
            // Feedback container
            const $feedback = $('<div class="alert mt-3" role="alert" style="display:none;"></div>');
            $contactForm.append($feedback);

            $contactForm.on('submit', async function (e) {
                e.preventDefault();

                const payload = {
                    name: $('#name').val() || '',
                    email: $('#email').val() || '',
                    phone: $('#phone').val() || '',
                    project: $('#project').val() || '',
                    subject: $('#subject').val() || '',
                    message: $('#message').val() || ''
                };

                // Basic validation
                if (!payload.name || !payload.email || !payload.message) {
                    $feedback.removeClass('alert-success').addClass('alert-danger').text('Please fill in your name, email and message.').show();
                    return;
                }

                try {
                    // Production API
                    const res = await fetch('https://vismann.onrender.com/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();

                    if (res.ok && data && data.ok) {
                        $feedback.removeClass('alert-danger').addClass('alert-success').text('Thank you! Your message has been sent.').show();
                        // Reset form
                        e.target.reset();
                    } else {
                        const errMsg = (data && data.error) ? data.error : 'Failed to send your message. Please try again later.';
                        $feedback.removeClass('alert-success').addClass('alert-danger').text(errMsg).show();
                    }
                } catch (err) {
                    $feedback.removeClass('alert-success').addClass('alert-danger').text('Network error. Please check your connection and try again.').show();
                }
            });
        }
    });
})(jQuery);
