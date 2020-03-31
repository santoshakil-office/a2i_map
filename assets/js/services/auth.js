(function() {


    'use strict';

    angular.module('barikoi')
        .factory('Auth', ['$http', '$q', '$localStorage', 'urls', function($http, $q, $localStorage, urls) {
            //Auth Service...............................................

            function changeUser(user) {
                angular.extend(currentUser, user);
            }

            //

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

            return {

                signup: function(data, success, error) {
                    $http.post(urls.AUTH_REG, data).success(success).error(error)
                },

                signin: function(data, success, error) {
                     $http.post(urls.AUTH_URI, data).success(success).error(error)
                },

                getlocations: function(urls ,success, error) {
                    $http.get(urls).success(success).error(error)
                },

                //old with param data
                // setcategory: function(url, data , success, error) {
                //     $http({
                //         method: 'POST',
                //         url: url,
                //         transformResponse: [function (data) {
                //             return data;
                //         }],
                //         data: $.param(data),
                //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                //     }).success(success).error(error)

                // },

                //new category with app/json
                setcategory: function(url, data , success, error) {
                    $http({
                        method: 'POST',
                        url: url,
                        transformResponse: [function (data) {
                            return data;
                        }],
                        data: data,
                        headers: {'Content-Type': 'application/json'}
                    }).success(success).error(error)

                },

                setSubCategory: function(url, data, success, error) {
                    $http({
                        method: 'POST',
                        url: url,
                        transformResponse: [function (data) {
                            return data;
                        }],
                        data: $.param(data),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
                    }).success(success).error(error)
                },

                //delete places.............................

                // delete_plc: function(url, data, success, error) {
                //     $http({
                //         method: 'GET',
                //         url: url+data,
                //         data: $.param(data),
                //         transformResponse: [function (data) {
                //             return data;
                //         }],
                //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                //     }).success(success).error(error)
                // },

                getPtypes: function ( url, success, error) {
                    $http({
                        method: 'GET',
                        url: url
                        // headers: {'Content-Type': 'application/json'}
                    }).success(success).error(error)
                },

                setSubCategory: function(url, data, success, error) {
                    $http({
                        method: 'POST',
                        url: url,
                        data: data,
                        transformResponse: [function (data) {
                            return data;
                        }],
                        headers: {'Content-Type': 'application/json;'}
                    }).success(success).error(error)
                },

                // content type : app/json
                delete_plc: function(url, data, success, error) {
                    $http({
                        method: 'GET',
                        url: url+data,
                        data: data,
                        transformResponse: [function (data) {
                            return data;
                        }],
                        headers: {'Content-Type': 'application/json'}
                    }).success(success).error(error)
                },

                delete_anything: function(url, data, success, error) {
                    $http({
                        method: 'DELETE',
                        url: url+data,
                        transformResponse: [function (data) {
                            return data;
                        }],
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(success).error(error)
                },

                delete_anything2: function(url, data, success, error) {
                    $http({
                        method: 'DELETE',
                        url: url,
                        data: $.param(data),
                        // transformResponse: [function (data) {
                        //     return data;
                        // }],
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(success).error(error)
                },

                delete_anything_json: function(url, data, success, error) {
                    $http({
                        method: 'DELETE',
                        url: url,
                        data: data,
                        headers: {'Content-Type': 'application/json'}
                    }).success(success).error(error)
                },

                delete_without_param: function(url, success, error) {
                    $http({
                        method: 'DELETE',
                        url: url,
                        // transformResponse: [function (data) {
                        //     return data;
                        // }],
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(success).error(error)
                },

                get_with_params: function(url, success, error) {
                    $http({
                        method: 'GET',
                        url: url,
                        // data: $.param(data),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(success).error(error)
                },

                get_with_params2: function(url, data, success, error) {
                    $http({
                        method: 'GET',
                        url: url,
                        data: $.param(data),
                        // transformResponse: [function (data) {
                        //     return data;
                        // }],
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(success).error(error)
                },

                replace: function(url, success, error) {
                    $http({
                        method: 'GET',
                        url: url,
                        // data: $.param(data),
                        transformResponse: [function (data) {
                            return data;
                        }],
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(success).error(error)
                },

                //add places................................

                // addaddress: function(url, data, success, error) {
                //     console.log('param data', data);
                    
                //     $http({
                //         method: 'POST',
                //         url: url,
                //         data: $.param(data),
                //         transformResponse: [function (data) {
                //             return data;
                //         }],
                //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                //     }).success(success).error(error)
                // },
                addaddress: function(url, data, success, error) {
                    console.log('param data', data);
                    
                    $http({
                        method: 'POST',
                        url: url,
                        data: data,
                        transformResponse: [function (data) {
                            return data;
                        }],
                        headers: {'Content-Type': 'application/json'}
                    }).success(success).error(error)
                },  

                // post_anything: function(url, data, success, error) {
                //     $http({
                //         method: 'POST',
                //         url: url,
                //         data: $.param(data),
                       
                //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                //     }).success(success).error(error)
                // },

                // content: json
                post_anything: function(url, data, success, error) {
                    $http({
                        method: 'POST',
                        url: url,
                        data: data,
                       
                        headers: {'Content-Type': 'application/json'}
                    }).success(success).error(error)
                },

                 // ADMIN SEARCH
                 adminSearch: function(query){
                    var deffered = $q.defer();
                    var data = {
                        'search' : query
                    }
                    $http.post(urls.ADMIN_SEARCH, data)
                        .success(function(data){
                            deffered.resolve(data); 
                        })
                        .error(function(data, status){
                            deffered.reject(status);
                        });
                    return deffered.promise;
                },

                put_something: function(url, data, success, error) {
                    $http({
                        method: 'PUT',
                        url: url,
                        // data: $.param(data),
                        transformResponse: [function (data) {
                            return data;
                        }],
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(success).error(error)
                },

                // updateSomething: function(url, data, success, error) {
                //     $http({
                //         method: 'PATCH',
                //         url: url,
                //         data: $.param(data),
                //         transformResponse: [function (data) {
                //             return data;
                //         }],
                //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                //     }).success(success).error(error)
                // },

                // app json
                updateSomething: function(url, data, success, error) {
                    $http({
                        method: 'PATCH',
                        url: url,
                        data: data,
                        transformResponse: [function (data) {
                            return data;
                        }],
                        headers: {'Content-Type': 'application/json'}
                    }).success(success).error(error)
                },

                updateSomething2: function(url, success, error) {
                    $http({
                        method: 'PATCH',
                        url: url,
                        transformResponse: [function (data) {
                            return data;
                        }],
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(success).error(error)
                },
              
                logout: function(success) {
                    changeUser({});
                    delete $localStorage.token;
                    delete $localStorage.userType;
                    success();
                },

                getUsers: function(query){
                    var deffered = $q.defer();
                    var data = {
                        'search' : query
                    }
                    $http.post(urls.TNT, data)
                        .success(function(data){
                            deffered.resolve(data); 
                        })
                        .error(function(data, status){
                            deffered.reject(status);
                        });
                    return deffered.promise;
                },

                // Get user info by id
                GetUserInfo: function(url, response) {
                    $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            // 'Authorization': `Bearer ${$localStorage.token}`
                        }
                    }).then(response)
                },

                /** MAPPER API FUNCTIONS **/

                // Get mapper tasks
                GetMapperTasks: function(url, response) {
                    $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            // 'Authorization': `Bearer ${$localStorage.token}`
                        }
                    }).then(response)
                },

                // Get a single task
                GetOneTask: function(url, response) {
                    $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            // 'Authorization': `Bearer ${$localStorage.token}`
                        }
                    }).then(response)
                },

                // Get actions by task id
                GetTaskActions: function(url, response) {
                    $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            // 'Authorization': `Bearer ${$localStorage.token}`
                        }
                    }).then(response)
                },

                // Get reports by task id
                GetTaskReports: function(url, response) {
                    $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            // 'Authorization': `Bearer ${$localStorage.token}`
                        }
                    }).then(response)
                },

                // Update task status or report
                // UpdateTaskOrReport: function(url, data, response) {
                //     $http({
                //         method: 'POST',
                //         url: url,
                //         data: $.param(data),
                //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                //     }).then(response)
                // },
                
                //contetn:json
                UpdateTaskOrReport: function(url, data, response) {
                    $http({
                        method: 'POST',
                        url: url,
                        data: data,
                        headers: {'Content-Type': 'application/json'}
                    }).then(response)
                },

                // EndTask: function(url, data, response) {
                //     $http({
                //         method: 'PATCH',
                //         url: url,
                //         data: $.param(data),
                //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                //     }).then(response)
                // },

                EndTask: function(url, data, response) {
                    $http({
                        method: 'PATCH',
                        url: url,
                        data: data,
                        headers: {'Content-Type': 'application/json'}
                    }).then(response)
                },


                // ReportAction: function(url, data, response) {
                //     $http({
                //         method: 'POST',
                //         url: url,
                //         data: $.param(data),
                //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                //     }).then(response)
                // },

                ReportAction: function(url, data, response) {
                    $http({
                        method: 'POST',
                        url: url,
                        data: data,
                        headers: {'Content-Type': 'application/json'}
                    }).then(response)
                },

                // Daily Analytics
                DAILY_ANALYTICS: function(url, response) {
                    $http({
                        method: 'Get',
                        url: url,
                        headers: {'Content-Type': 'application/json'}
                    }).then(response)
                },

                // Total API USage day/week/month
                TOTAL_API_ANALYTICS: function(url, response) {
                    $http({
                        method: 'Get',
                        url: url
                    }).then(response)
                },

                // https://admin.barikoi.xyz:8080/bkoi/logreader/CheckUsage?key=MTM0MjpTTzVSU0hCOFFO&day=0

                TOTAL_API_ANALYTICS_BY_USER: function(url, key, day, response) {
                    $http({
                        method: 'Get',
                        url: `${url}?key=${key}&day=${day}` 
                    }).then(response)
                },

                // https://admin.barikoi.xyz:8080/bkoi/tokai/?key=burger&ptype=burger&subtype=burger&call=1

                tokai_call: function(url) {

                    var deffered = $q.defer();
                    // var data = {
                    //     'search' : query
                    // }
                    $http.get(url)
                        .success(function(data){
                            deffered.resolve(data); 
                        })
                        .error(function(data, status){
                            deffered.reject(status);
                        });
                    return deffered.promise;

                    // var result
                    // $http.get(url).then(function(response){
                    //     result = response
                    // })
                    // return result
                },


                currentUser: currentUser
            };
        }]);

}());