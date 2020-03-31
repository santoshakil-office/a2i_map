(function () {
    'use strict';

    angular
        .module('barikoi')
        .controller('MainController', MainController);

    MainController.$inject = ['$rootScope', '$scope', '$http', '$location', 'urls', '$localStorage', '$state', 'Auth', '$timeout'];

    function MainController($rootScope, $scope, $http, $location, urls, $localStorage, $state, Auth, $timeout) {

        $scope.userType = {
            availableOptions: [{
                    id: 1,
                    url: urls.AUTH_URI,
                    name: 'Admin'
                },
                {
                    id: 2,
                    url: urls.AUTH_LOGI,
                    name: 'User'
                },
                {
                    id: 3,
                    url: urls.AUTH_BUS,
                    name: 'Business'
                },
                {
                    id: 4,
                    url: urls.AUTH_BUS,
                    name: 'Logistics'
                },
                {
                    id: 5,
                    url: urls.AUTH_BUS,
                    name: 'Delivery Man'
                }
            ],
            selectedOption: {
                id: 1,
                url: urls.AUTH_URI,
                name: 'Admin'
            } //This sets the default value of the select in the ui
        };

        $scope.$storage = $localStorage.$default({
            code: []
        });

        //user sign in, sign up, log-out...........................................................

        $scope.signin = function () {
            var formData = {
                email: $scope.email,
                password: $scope.password,
                userType: 1
            }

            Auth.signin(formData, function (res) {
                if (res.type == false) {
                    alert(res.data)
                } else {
                    $localStorage.token = res.data.token;
                    // console.log(res);
                    function urlBase64Decode(str) {
                        var output = str.replace('-', '+').replace('_', '/');
                        switch (output.length % 4) {
                            case 0:
                                break;
                            case 2:
                                output += '==';
                                break;
                            case 3:
                                output += '=';
                                break;
                            default:
                                throw 'Illegal base64url string!';
                        }
                        return window.atob(output);
                    }

                    function getUserFromToken() {
                        var token = $localStorage.token;
                        var user = {};
                        if (typeof token !== 'undefined') {
                            var encoded = token.split('.')[1];
                            user = JSON.parse(urlBase64Decode(encoded));
                        }
                        return user;
                    }

                    var currentUser = getUserFromToken();
                    // console.log(currentUser)
                    $http.get(urls.USER_PROF).success(function (res) {
                        $localStorage.userType = res.data.userType;
                        //    console.log($localStorage.userType)
                        if ($localStorage.userType == 1) {
                            $state.go('main.dashboard');
                        } else if ($localStorage.userType == 2) {
                            $state.go('mapper.taskList');
                        }
                    })
                    //swal("Success", "You Are Logged In :)");
                    // $state.go('main.dashboard');
                    // window.location = "/";    
                }
            }, function () {
                swal("Sorry", "Error Occured");
            })
        };

        $scope.signup = function () {
            var formData = {
                name: $scope.name,
                email: $scope.email,
                phone: $scope.phone,
                password: $scope.password,
                userType: $scope.userType.selectedOption.id
            }

            Auth.signup(formData, function (res) {
                // console.log(res)
                if (res.status === 200) {
                    swal('Success', 'Signup Completed!')
                    $scope.name, $scope.email, $scope.password, $scope.phone = ''
                    // window.location = "#/signin"
                    $state.go('signin');
                } else {
                    swal('Error', res.messages);
                }
            }, function () {
                $rootScope.error = 'Failed to signup';
            })
        };

        $scope.logout = function () {
            Auth.logout(function () {
                swal("Log out", "You are signing off");
                // window.location = "#/signin"
                $state.go('signin');
            }, function () {
                swal("Failed to logout!");
            });
        };

        $scope.token = $localStorage.token;
        
        

    }

}());