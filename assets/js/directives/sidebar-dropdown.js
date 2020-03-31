(function () {
    'use strict';

    angular
        .module('barikoi')
        .directive('sideDropdown', [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    // console.log(element)
                    // $.noConflict();

                    $(document).ready(function ($) {
                        let i, j, dropdownContent;

                        // Getting menu-title DOM
                        const dropdown = document.getElementsByClassName("menu-title")

                        // Looping through all the menu-title element
                        for (i = 0; i < dropdown.length; i++) {

                            dropdown[i].addEventListener("click", function (e) {

                                // Getting the next element of menu-title
                                dropdownContent = this.nextElementSibling

                                // Hiding the next element
                                if (dropdownContent.style.display === "inline-block") {
                                    dropdownContent.style.display = "none"
                                } else {
                                    dropdownContent.style.display = "inline-block"
                                }

                            });
                        }

                        // Menu Trigger
                        $('#menuToggle').on('click', function (event) {
                            // console.log(event);

                            // event.preventDefault();
                            // event.stopPropagation();
                            var windowWidth = $(window).width();
                            if (windowWidth < 1010) {
                                $('body').removeClass('open');
                                if (windowWidth < 760) {
                                    $('#left-panel').slideToggle();
                                } else {
                                    $('#left-panel').toggleClass('open-menu');
                                }
                            } else {
                                $('body').toggleClass('open');
                                $('#left-panel').removeClass('open-menu');
                            }

                            const hideDown = document.getElementsByClassName("sub-menu")
                            
                            const mapperSubMenu = document.getElementsByClassName("sub-menu-mapper")[0]
                            const mapperMenuHeader = mapperSubMenu.previousElementSibling ;

                            if (mapperSubMenu.style.display === 'none') {
                                mapperSubMenu.style.display = 'block'
                                mapperMenuHeader.style.display = 'block'
                            } else {
                                mapperSubMenu.style.display = 'none'
                                mapperMenuHeader.style.display = 'none'
                            }

                            // Main sidebar
                            for (j = 0; j < hideDown.length; j++) {

                                hideDown[j].style.display = "none"

                            }

                        });


                    });
                }
            }
        }]);


}());