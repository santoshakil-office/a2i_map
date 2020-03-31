(function() {
  'use strict';

   angular
        .module('barikoi')
        .directive('floatBtn', function() {
            return {
                restrict: 'A',
                scope: false,
                link: function(scope, element, attrs, tabsCtrl) {
                     console.log(scope.toggle);
                    element.on('click', function(e) {
                        //e.preventDefault();
                        console.log('clicked');
                        scope.$parent.toggle = !scope.$parent.toggle;
                        console.log(scope.toggle);
                    })
                },
                templateUrl: '../../../views/float-btn.html'
            };
        });
  
}());