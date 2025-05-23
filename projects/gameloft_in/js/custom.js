var BrowserDetect = {
  init: function () {
      this.browser = this.searchString(this.dataBrowser) || "Other";
      this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
  },
  searchString: function (data) {
      for (var i = 0; i < data.length; i++) {
          var dataString = data[i].string;
          this.versionSearchString = data[i].subString;

          if (dataString.indexOf(data[i].subString) !== -1) {
              return data[i].identity;
          }
      }
  },
  searchVersion: function (dataString) {
      var index = dataString.indexOf(this.versionSearchString);
      if (index === -1) {
          return;
      }

      var rv = dataString.indexOf("rv:");
      if (this.versionSearchString === "Trident" && rv !== -1) {
          return parseFloat(dataString.substring(rv + 3));
      } else {
          return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
      }
  },

  dataBrowser: [
      {string: navigator.userAgent, subString: "Edge", identity: "msedge"},
      {string: navigator.userAgent, subString: "MSIE", identity: "explorer"},
      {string: navigator.userAgent, subString: "Trident", identity: "explorer"},
      {string: navigator.userAgent, subString: "Firefox", identity: "firefox"},
      {string: navigator.userAgent, subString: "Opera", identity: "opera"},
      {string: navigator.userAgent, subString: "OPR", identity: "opera"},
      {string: navigator.userAgent, subString: "Chrome", identity: "chrome"},
      {string: navigator.userAgent, subString: "Safari", identity: "safari"}
  ]
};

BrowserDetect.init();
$('html').addClass(BrowserDetect.browser);
$('html').addClass('v' + Math.round(BrowserDetect.version));

//get all elements with class and get the biggest box
function get_biggest(elements){
	var biggest_height = 0;
	for ( var i = 0; i < elements.length ; i++ ){
		var element_height = $(elements[i]).height();
		//compare the height, if bigger, assign to variable
		if(element_height > biggest_height ) biggest_height = element_height;
	}
	return biggest_height;
}

function resize() {
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();

	// STICKY FOOTER
	var headerHeight = $('header').outerHeight();
	var footerHeight = $('footer').outerHeight();
	var footerTop = (footerHeight) * -1
	$('footer').css({marginTop: footerTop});
	$('#main-wrapper').css({paddingTop: headerHeight, paddingBottom: footerHeight});

	// for vertically middle content
	$('.bp-middle').each(function() {
		var bpMiddleHeight = $(this).outerHeight() / 2 * - 1;
		$(this).css({marginTop: bpMiddleHeight});
	});

  // for equalizer
	$('.a-c-set').css({minHeight: 0});
  var acSet = get_biggest($('.a-c-set'));
  $('.a-c-set').css({minHeight: acSet});

  // for main content
  var glinMain = windowHeight - (headerHeight + footerHeight);
  $('.gl-in-main').css({minHeight: glinMain});
}

// add animation delay for .anim-content children
if (!Modernizr.touch) {
	$('.anim-content').each(function() {
		$(this).children().each(function(index) {
			var element = $(this);
			var delayNum = 0.3 + (0.1 * index) + 's';
			$(element).addClass('inview');
			setTimeout(function() {
				$(element).css('-webkit-transition-delay', delayNum)
					.css('-moz-transition-delay', delayNum)
					.css('-ms-transition-delay', delayNum)
					.css('-o-transition-delay', delayNum)
				// lazy load
				$("img.lazy").lazyload();
			}, 100);
		});
	});
} else {
	$('.anim-content').removeClass('anim-content');
}

$(window).resize(function() {
	resize();
});

$(document).ready(function() {
	if (Modernizr.touch) {
		$('html').addClass('bp-touch');
	}
	if (!Modernizr.touch ) {
		$.each($('.inview,.animate'),function(){
			$(this).on('inview',function(event,visible){
				if (visible == true) {
					$(this).addClass('visible');
          bpCount();
				}
			});
		});
	} else {
		$('.inview').removeClass('inview');
    $.each($('.animate'),function(){
			$(this).on('inview',function(event,visible){
				if (visible == true) {
					$(this).addClass('visible');
          bpCount();
				}
			});
		});
	}

	// lazy load
	$("img.lazy").lazyload();

	// for language selector
	$('.ga-la-main').click(function() {
		$('.ga-la-select').slideToggle(250);
	});

	// for sliding menu
	$('.he-co-search').click(function() {
		$('.ga-search-content').toggleClass('active');
	});
	$('.ga-se-close').click(function() {
		$('.ga-search-content').removeClass('active');
	});

	// CUSTOM SELECT
  $('select.custom-select').each(function() {
		$(this).wrap('<div class="custom-select-wrapper" />');
		$(this).before('<div class="custom-select-display" />');
		$(this).change(function() {
			var selectedOpt = $(this).find('option:selected');
			var defValue = $(selectedOpt).attr('value');
			$(this).siblings('.custom-select-display').text($(selectedOpt).text());
			if(defValue == 'default') {
				$(this).siblings('.custom-select-display').addClass('default');
			} else {
				$(this).siblings('.custom-select-display').removeClass('default');
			}
		});
		$(this).keyup(function() {
			var selectedOpt = $(this).find('option:selected');
			var defValue = $(selectedOpt).attr('value');
			$(this).siblings('.custom-select-display').text($(selectedOpt).text());
			if(defValue == 'default') {
				$(this).siblings('.custom-select-display').addClass('default');
			} else {
				$(this).siblings('.custom-select-display').removeClass('default');
			}
		});
		$(this).change();
	});

  // for multitple select
  $('.c-p-select').each(function() {
    var element = $(this);
    $('.cp-se-top', element).click(function() {
      $('.c-p-dd', element).slideDown(150);
    });

    $(document).mouseup(function (e) {
      if (!element.is(e.target) && element.has(e.target).length === 0) {
        $('.c-p-dd', element).slideUp(150);
      }
    });
  });

  // for radio button
  $('.p-c-radio label').click(function() {
		var nameVal = $('#'+$(this).attr('for')).attr('name');
		$('.p-c-radio').each(function(){
			if ($('input[type="radio"]',this).attr('name') == nameVal) {
				$('label',this).removeClass('active');
			}
		});
		$(this).addClass('active');
	});

  // select the others radio button, once the user have click on the text field
	$('#gnothers-field').click(function() {
		$('.p-c-radio input[type="radio"]').prop('checked',false);
		$('.p-c-radio label').removeClass('active');
		$('.p-c-radio label[for="reasons10"]').addClass('active');
		$('#reasons10').prop('checked',true);
	});

  $('.c-p-dd li').click(function() {

    if($(this).hasClass('selected')) {
      $(this).removeClass('selected');
    } else {
      $(this).addClass('selected');
    }
  });

	// for video frame
  var currentVideo = 0;
  if (Modernizr.touch ) {
    // for mobile
    // start of big frame video
    $('.g-i-video-frame .gi-play-cover').each(function() {
      var giVideo = $(this).attr('data-video');
  		var giVideoTemplate = "<iframe class='gi-vi-frame' width='507' height='279' src='http://www.youtube.com/embed/"+giVideo+"?wmode=opaque&rel=0&autoplay=1' frameborder='0' allowfullscreen></iframe>"
  		$(this).hide();
  		$(this).parent().append(giVideoTemplate);
      currentVideo = giVideo;
    });
    // end of big frame video
    $('.video-collect').each(function() {
      var giVideo = $(this).attr('data-video');
      var giVideoHolder = $(this).attr('data-video-main');
      var giVideoTemplate = "<iframe class='gi-vi-frame' width='507' height='279' src='http://www.youtube.com/embed/"+giVideo+"?wmode=opaque&rel=0&autoplay=1' frameborder='0' allowfullscreen></iframe>"
      $(giVideoHolder).remove();
      $('.gi-vid-thumb .gi-play-cover',this).hide();
      $('.gi-vid-thumb .gi-vi-frame',this).remove();
      $('.gi-vid-thumb',this).append(giVideoTemplate);
      currentVideo = giVideo;
    });
  } else {
    // for desktop
    // start of big frame video
    $('.fancybox, .fanybox-video, .g-i-video-frame .gi-play-cover').click(function() {
  		$('.gi-play-cover').show();
  		$('.gi-vi-frame').remove();
  	});
  	$('.g-i-video-frame .gi-play-cover').click(function() {
  		var giVideo = $(this).attr('data-video');
  		var giVideoTemplate = "<iframe class='gi-vi-frame' width='507' height='279' src='http://www.youtube.com/embed/"+giVideo+"?wmode=opaque&rel=0&autoplay=1' frameborder='0' allowfullscreen></iframe>"
  		$(this).hide();
  		$(this).parent().append(giVideoTemplate);
      currentVideo = giVideo;
  	});
    // end of big frame video
  }
  $('.video-collect').click(function() {
    var giVideo = $(this).attr('data-video');
    var giVideoHolder = $(this).attr('data-video-main');
    var giVideoTemplate = "<iframe class='gi-vi-frame' width='507' height='279' src='http://www.youtube.com/embed/"+giVideo+"?wmode=opaque&rel=0&autoplay=1' frameborder='0' allowfullscreen></iframe>"
    var giVidCapt = $('.a-c-capt',this).html();
    if(currentVideo != giVideo) {
      $('.gi-play-cover',giVideoHolder).hide();
      $('.gi-vi-frame',giVideoHolder).remove();
      $('.g-i-video-frame',giVideoHolder).append(giVideoTemplate);
      $('.g-i-capt',giVideoHolder).html(giVidCapt);
      currentVideo = giVideo;
    }
  });

	// for Fancybox
	$('.fancybox').fancybox({
		openEffect 		: 'elastic',
		closeEffect		: 'elastic',
    margin        : 35,
		padding				: 6,
		autoScale 		: true,
		autoSize			: true,
		fixed					: false,
		scrolling			: 'hidden',
		autoCenter		: true
	});
	$('.fancybox-v2').fancybox({
		openEffect 		: 'elastic',
		closeEffect		: 'elastic',
		padding				: 0,
		autoScale 		: true,
		autoSize			: true,
		fixed					: false,
		scrolling			: 'hidden',
		autoCenter		: true,
    wrapCSS       : 'v2'
	});
	$('.fancybox-video').fancybox({
		openEffect 	: 'fade',
		closeEffect	: 'fade',
		openSpeed		: 100,
		closeSpeed	: 100,
		width				: 853,
		height			: 480,
    margin      : 35,
		padding			: 6,
		autoScale 	: true,
		autoSize		:true,
		type				: 'iframe',
		fixed				: false,
		autoCenter	: 0
	});

	// for owl carousel
	$('.g-i-ma-carousel .owl-carousel').owlCarousel({
		loop						: true,
		margin					: 16,
		responsiveClass	: true,
		nav							: true,
		navText					: ['',''],
		mouseDrag				: true,
		items						: 3,
		responsive:{
			0:{ items:1},
			450:{ items:1},
			451:{ items:2},
			640:{ items:2},
			641:{ items:3},
			1080:{ items:3}
		}
	});

  // for customize dropdowns
  $('.g-i-ma-menu .title').click(function() {
    $(this).next().slideToggle(150);
  });

  // for caption toggle
  $('.gi-c-toggle').click(function() {
    $(this).hide();
    $(this).prev().slideDown(150);
  });

	forMobile();
	resize();
});

$(window).load(function() {
	resize();
});

// preloader once done
Pace.on('done', function() {
	// totally hide the preloader especially for IE
	setTimeout(function() {
		$('.pace-inactive').hide();
	}, 500);
});

function forMobile() {
  // for menu bar
  $('.menu-bar').click(function() {
		$('body').addClass('menu-active');
		$(this).addClass('active');
		$('.menu-mobile').addClass('active');
		$('.menu-mobile.cover').fadeIn(200);
	});
	$('.menu-mobile.cover').click(function() {
		$('body').removeClass('menu-active');
		$('.menu-bar').removeClass('active');
		$('.menu-mobile').removeClass('active');
		$('.menu-mobile.cover').fadeOut(200);
	});
}

$('.bp-count').each(function(index) {
  $(this).attr('id', 'bpCount' + index);
});
function bpCount() {
  $('.bp-count').each(function() {
    if ($(this).hasClass('visible') && !($(this).hasClass('active'))) {
      var element = $(this);
      var countID = $(element).attr('id');
      var countNum = $(element).attr('data-number');
      var numAnim = new CountUp(countID, 0, countNum);
      numAnim.start();
      setTimeout(function() {
				$(element).addClass('active');
			}, 200);
    }
  });
}
