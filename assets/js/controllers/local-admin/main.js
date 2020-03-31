(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('MainController', MainController);

    MainController.$inject = ['$rootScope', '$scope', '$http', '$location', 'urls', '$localStorage', '$state', 'Auth'];

    function MainController($rootScope, $scope, $http, $location, urls, $localStorage, $state, Auth) {

       var init = function() {
            $rootScope.navone = false;
       };
       init();

        $scope.userType = {
            availableOptions: [
                {id:1, url: urls.AUTH_URI, name: 'Admin'},
                {id:2, url: urls.AUTH_LOGI, name: 'User'},
                {id:3, url: urls.AUTH_BUS, name: 'Business'},
                {id:4, url: urls.AUTH_BUS, name: 'Logistics'},
                {id:5, url: urls.AUTH_BUS, name: 'Delivery Man'}
            ],
           selectedOption: {id:1, url: urls.AUTH_URI, name: 'Admin'} //This sets the default value of the select in the ui
        };
       
        $scope.$storage = $localStorage.$default({
            code: []
        });

        //user sign in, sign up, log-out...........................................................
        
        $scope.signin = function() {
            var formData = {
                email: $scope.email,
                password: $scope.password,
                userType : 1
            }

            Auth.signin(formData, function(res) {
                if (res.type == false) {
                    alert(res.data) 
                } else {
                    $localStorage.token = res.data.token;
                    swal("Success", "You Are Logged In :)");
                    $state.go('main.dashboard');
                    // window.location = "/";    
                }
            }, function() {
                swal("Sorry", "Error Occured");
            })
        };

        $scope.signup = function() {
            var formData = {
                name: $scope.name,
                email: $scope.email,
                phone: $scope.phone,
                password: $scope.password,
                userType : $scope.userType.selectedOption.id
            }

            Auth.signup(formData, function(res) {
                if (res.type == false) {
                    swal(res.data)
                } else {
                   swal(res.data);
                }
            }, function() {
                $rootScope.error = 'Failed to signup';
            })
        };

        $scope.logout = function() {
            Auth.logout(function() {
                    swal("Log out", "you are signing off");
                window.location = "#/signin"
            }, function() {
                swal("Failed to logout!");
            });
        };

        $scope.token = $localStorage.token;

    }

}());