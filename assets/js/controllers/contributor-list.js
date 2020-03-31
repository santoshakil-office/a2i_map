(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('ContributorList', ContributorList)
        .filter('startFrom', function() {
            return function(input, start) {
                start = +start; //parse to int
                return input.slice(start);
            }
        });

    ContributorList.$inject = ['$rootScope', '$scope', '$http', '$window', '$location', '$state', '$filter', 'urls', 'DataTunnel', 'Auth'];

    function ContributorList($rootScope, $scope, $http, $window, $location, $state, $filter, urls, DataTunnel, Auth) {

    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.query = '';
    
    $scope.getData = function () {
      // needed for the pagination calc
      // https://docs.angularjs.org/api/ng/filter/filter
      return $filter('filter')($scope.userlist, $scope.query)
      
       // manual filter
       // if u used this, remove the filter from html, remove above line and replace data with getData()
       
        var arr = [];
        if($scope.query == '') {
            arr = $scope.userlist;
        } else {
            for(var ea in $scope.userlist) {
                if($scope.userlist[ea].indexOf($scope.query) > -1) {
                    arr.push( $scope.userlist[ea] );
                }
            }
        }
        return arr;
       
    }
    

     Auth.getlocations(urls.CONTRIBUTER_LIST+'all', function(res) {
            $scope.userlist = res;
            var arr = [];
            for(var ea in $scope.userlist) {
              
               arr.push($scope.userlist[ea].email);
            }
            console.log(arr);
            
        },
         function() {
            $rootScope.error = 'Failed to fetch details';
        });

      $scope.numberOfPages=function(){
                return Math.ceil($scope.getData().length/$scope.pageSize);                
            }
    
  // A watch to bring us back to the 
  // first pagination after each 
  // filtering
$scope.$watch('query', function(newValue,oldValue){             
    if(oldValue!=newValue){
      $scope.currentPage = 0;
  }
},true);

    //Getting All Locations..............

    $scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
 
  $scope.range = function (start) {
    var end = $scope.numberOfPages() - 1;
    console.log(end);
    var ret = [];
    for (var i = start; i < start+5 && i<end; i++) {
      ret.push(i);
    }
    return ret;
  };

  $scope.setPage = function(n) {
    $scope.currentPage = n;
  };


        $scope.user_detail = function(cont) {
            DataTunnel.set_data(cont);
             $location.path('/places/contributor/'+cont.id);  
        }

        $scope.gpx = function(cont) {
             $location.path('/gpx/contributor/'+cont.id);  
        }

        $scope.delete_user = function(id) {

            swal({  
                title: "Are you sure?",   
                // text: "You will not be able to recover this imaginary file!",   
                type: "warning",   
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Yes, delete it!",   
                closeOnConfirm: false }, 
                function(){   
                     $http.delete(urls.USER_INFO+id) 
                        .success(function(res) {
                            $state.go('main.userlog', {}, { reload: true });
                             swal("Deleted!", "User deleted.", "success"); 
                        })
                        .error(function(err) {
                            swal("Error Occured");
                        }); 

                });

        };


        $scope.loadMore = function (last, inview) {
            if (last && inview) {
                $scope.limit = 10
            }   
        }
  
    }

    
}());