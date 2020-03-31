(function () {
    'use strict';

    angular
        .module('barikoi')
        .directive('sideInit', [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    // console.log(element)
                    $.noConflict();

                    jQuery(document).ready(function ($) {

                        [].slice.call(document.querySelectorAll('select.cs-select')).forEach(function (el) {
                            new SelectFx(el);
                        });

                        jQuery('.selectpicker').selectpicker;




                        $('.search-trigger').on('click', function (event) {
                            event.preventDefault();
                            event.stopPropagation();
                            $('.search-trigger').parent('.header-left').addClass('open');
                        });

                        $('.search-close').on('click', function (event) {
                            event.preventDefault();
                            event.stopPropagation();
                            $('.search-trigger').parent('.header-left').removeClass('open');
                        });

                        angular.element('.equal-height').matchHeight({
                            property: 'max-height'
                        });

                        var chartsheight = $('.flotRealtime2').height();
                        $('.traffic-chart').css('height', chartsheight - 122);


                        // Counter Number
                        $('.count').each(function () {
                            $(this).prop('Counter', 0).animate({
                                Counter: $(this).text()
                            }, {
                                duration: 3000,
                                easing: 'swing',
                                step: function (now) {
                                    $(this).text(Math.ceil(now));
                                }
                            });
                        });

                        // Load Resize 
                        $(window).on("load resize", function (event) {
                            // console.log(event);

                            var windowWidth = $(window).width();
                            if (windowWidth < 1010) {
                                $('body').addClass('small-device');
                            } else {
                                $('body').removeClass('small-device');
                            }

                        });


                    });
                }
            }
        }]);


}());