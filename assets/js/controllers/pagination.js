(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('PaginationTable', PaginationTable);

    PaginationTable.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$window', '$location', '$state', '$filter', '$timeout', 'urls', 'Auth', 'bsLoadingOverlayService'];

    function PaginationTable($rootScope, $scope, $http, $stateParams, $window, $location, $state, $filter, $timeout, urls, Auth, bsLoadingOverlayService) {
        
        bsLoadingOverlayService.start({
                referenceId: 'first'
        });

        $scope.editable = [];
         var minLength = 1;
          $scope.loading = false;
          $scope.selected={};
        var init = function () {  
            $http.get(urls.DEMO_PAGI+$stateParams.page)
                .then(function (res) {  
                     $timeout(function(){
                   console.log($scope.bike);
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                   
            }, 2000);
                    $scope.locations = res.data.data;  
                    $scope.current_page = res.data.current_page;
                    $scope.next_page_url = res.data.next_page_url;
                    $scope.prev_page_url = res.data.prev_page_url;
                    $scope.total = res.data.total;
                    $scope.per_page = res.data.per_page;
                    $scope.last_page = res.data.last_page;
                },  
                function (err) {  
                    var error = err;
                     $rootScope.error = 'Failed to fetch data';
            $timeout(function(){
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
            }, 2000);  
                });  
        }  
        init();  
      
        //This method is calling from pagination number  
        $scope.pageChanged = function () {  
            $scope.init();  
        };  
      
        //This method is calling from dropDown  
        $scope.changePageSize = function () {  
            $scope.pageIndex = 1;  
            $scope.getEmployeeList();  
        };  
      

       
        //Remove Place from the List Permanenty..............................

        $scope.delete_location = function(uCode, index) {

            swal({  
                title: "Are you sure?",   
                // text: "You will not be able to recover this imaginary file!",   
                type: "warning",   
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Yes, delete it!",   
                closeOnConfirm: false }, 
                function(){   
                     Auth.delete_plc(urls.DELETE_PLACE, uCode, 
                        function(res) {
                             swal("Deleted!", "Address has been deleted.", "success"); 
                              $scope.locations.splice(index, 1);
                        },
                        function(err) {
                            swal("Error Occured");
                        });

                });

        };

        $scope.update = function(loc,id) {

            var data = {
                'latitude' :  loc.latitude,
                'longitude' : loc.longitude,
                'Address' :loc.Address,
                'city' : loc.city,
                'area' : loc.area,
                'postCode' : loc.postCode,
                'pType' : loc.pType,
                'subType' : loc.subType,
                'flag' : 1, 
                'route_description' : loc.route_description
               
            }
         
            //Send Data Through Auth Service.......
            //Auth Service IS Responsible for Handling Http Request and Authentication......................
            Auth.addaddress(urls.UPDATE_PLACE+loc.id, data, function(res) {
                swal("Done", "Place Updated");
                $scope.editable[id] = false;

            },function() {
                swal("Error")
            })
        };

        $scope.openWindow = function(uCode) {
            $window.open('https://dev.barikoi.com/#/code/' + uCode, 'BariKoi?', 'width=800,height=700');
        }

        $scope.update_place = function(id) {
             $location.path('/updateplace/'+id);  
        }

    $scope.onSelect = function(user){
      $scope.selected = user;
      console.log(user);
      $scope.markers.m1.lat = parseFloat($scope.selected.latitude);
      $scope.markers.m1.lng = parseFloat($scope.selected.longitude)
      $scope.center.lat = parseFloat($scope.selected.latitude);
      $scope.center.lng = parseFloat($scope.selected.longitude);
    };
    $scope.users = function(userName) {
      if (userName.length < minLength) {
        return [];
      }
      $scope.loading = true;
      return Auth.getUsers(userName).then(function(data){
        $scope.loading = false;
        $scope.locations = data.places;
       
      }, function(status){
        $scope.loading = false;
      });
    };
  

    }

}());