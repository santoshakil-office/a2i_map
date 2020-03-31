(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('CategoyAddController', CategoyAddController);

    CategoyAddController.$inject = ['$rootScope', '$scope', '$http', '$location', 'urls', 'Auth'];

    function CategoyAddController($rootScope, $scope, $http, $location, urls, Auth) {

        //Route Initialize......................................
        var init = function() {
            //Getting All Category....................
            $http.get(urls.GET_CATEGORY)
                 .success(function(res) {
                    $scope.categories = res;
                    console.log(res);
                 })
                 .error(function(err) {
                    console.log(err);
                })

            $rootScope.navone = true;
        };

        init();
        
       //Add A new Category Type...............................

        $scope.set_category = function() {
            var data = {
                'pType' : $scope.new_category
            };
            console.log(data);
            
            Auth.setcategory(urls.ADD_CATEGORY, data, 
                function(res) {
                    swal("Done", "New Type Added");
                    init();
                },
                function(err) {
                    console.log(err);
                    
                    swal("Type Already Defined");
                }
            )
        };

        //Add a new Subcategory with correspondin Category.........................

        $scope.set_sub_category = function() {

            var data = {
                'pType' : $scope.address.category.type.toString(),
                'subType' : $scope.address.subcategory
            };

            // Auth.setcategory(urls.ADD_SUB_CATEGORY, data, function (response) {
                
            //     console.log(response.message)

            //     swal("Done", "New Subcategory Added");
            //     init()

            // }, function (error) {

            //     console.log('Error: ', error.message)
            //     swal("Error");

            // })

            // $http.post(urls.ADD_SUB_CATEGORY, data )
            // .success(function (data, status, headers, config, response) {
            //     console.log('s ',data, response);
                
            // })
            // .error(function (data, status, header, config) {
            //      console.log('e ',data);
                 
            // });

            // $http({
            //     method : "POST",
            //       url : urls.ADD_SUB_CATEGORY,
            //       data: data,
            //   }).then( (response) => {
            //     console.log('success: ',response);
                
            //     swal("Success", "New Subcategory Added");
            //   }, 
            //   (error) => {
            //     console.log(error);
                
            //     }
            // );

            let typeAdded = ''
            Auth.setcategory(urls.ADD_SUB_CATEGORY, data, 
                function(res) {
                    console.log('success: ', res);
                    
                    typeAdded = res
                    swal("Done", "New Subcategory Added");
                },
                function(err) {
                    console.log('error: ', err);

                    if (typeAdded == 'Added') {
                        swal('Success',  'New Subcategory Added')
                    }
                    
                }
            );
        };
    }

}());