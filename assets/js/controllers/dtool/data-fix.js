(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('DataFix', DataFix);

    DataFix.$inject = ['$rootScope', '$scope', '$http', '$location', 'urls', '$timeout', 'Auth', 'bsLoadingOverlayService'];

    function DataFix($rootScope, $scope, $http, $location, urls, $timeout, Auth, bsLoadingOverlayService) {

        $scope.fields = {
            availableOptions: [
                {id:0, ts: 'area'},
                {id:1, ts:'Address'}
            ],
           selectedOption: {id:0, ts: 'area'} //This sets the default value of the select in the ui
        };

        $scope.upfields = {
            availableOptions: [
                {id:0, ts: 'ward'},
                {id:1, ts:'zone'}
            ],
           selectedOption: {id:0, ts: 'ward'} //This sets the default value of the select in the ui
        };

        $scope.replace = function(referenceId) {
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });

            // $timeout(function(){
            //     bsLoadingOverlayService.stop({
            //         referenceId: 'first'
            //     });
            //     swal("Success", "Replaced")
            // }, 2000);


            Auth.replace(urls.REPLACE+"?x="+$scope.x+"&y="+$scope.y,
                function(res) {
                    $timeout(function(){
                        bsLoadingOverlayService.stop({
                            referenceId: 'first'
                        });
                        swal("Success", "Replaced")
                    }, 2000);
                },function(err) {
                    $timeout(function(){
                        bsLoadingOverlayService.stop({
                            referenceId: 'first'
                        });
                        swal("", "Server Error");
                    }, 2000);
                } 
            );


        };


        $scope.replace_word = function(referenceId) {
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });
            console.log($scope.fields.selectedOption.ts);

            // $timeout(function(){
            //     bsLoadingOverlayService.stop({
            //         referenceId: 'first'
            //     });
            //     swal("Success", "Replaced")
            // }, 3000);

             Auth.replace(urls.REPLACE_WORD+"?data="+$scope.data+"&ward="+$scope.ward+"&param="+$scope.fields.selectedOption.ts+"&updateField="+$scope.upfields.selectedOption.ts,
                function(res) {
                    $timeout(function(){
                        bsLoadingOverlayService.stop({
                            referenceId: 'first'
                        });
                        swal("Success", "Replaced")
                    }, 3000);
                },function(err) {
                    $timeout(function(){
                        bsLoadingOverlayService.stop({
                            referenceId: 'first'
                        });
                        swal("", "Server Error");
                    }, 3000);
                } 
            );
        };
    }

}());
