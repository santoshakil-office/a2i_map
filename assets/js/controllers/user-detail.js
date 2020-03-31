(function () {
    'use strict';

    angular
        .module('barikoi')
        .controller('UserDetailController', UserDetailController);

    UserDetailController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$window', '$location', '$state', 'urls', 'Auth'];

    function UserDetailController($rootScope, $scope, $http, $stateParams, $window, $location, $state, urls, Auth) {

        $scope.filteredTodos = [];
        $scope.currentPage = 1;
        $scope.numPerPage = 5;
        $scope.maxSize = 5;
        console.log("id ", $stateParams.id)


        $scope.data2 = [200, 200, 400]

        var init = function () {

            $http({
                    method: 'GET',
                    url: urls.USER_INFO + $stateParams.id + '/places',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .success(function (res) {
                    $scope.userplaces = res.data;
                    $scope.$watch('currentPage + numPerPage', function () {
                        var begin = (($scope.currentPage - 1) * $scope.numPerPage),
                            end = begin + $scope.numPerPage;

                        $scope.filtereduserplc = $scope.userplaces.slice(begin, end);
                    });

                    $scope.numPages = function () {
                        return Math.ceil($scope.userplaces.length / $scope.numPerPage);
                    };
                }).error(function (err) {
                    console.log("err")
                });

            $rootScope.navone = true;

            $http({
                method: 'GET',
                url: urls.USER_INFO + $stateParams.id
                // headers: {
                //     'Content-Type': 'application/x-www-form-urlencoded'
                // }
            }).success(function (res) {
                $scope.userinfo = res.data[0];
                $scope.userJoinDate = moment(res.data[0].created_at).format('lll');
                if (res.data[0].key) {
                    // console.log('userinfo', res);
                    $scope.keyGenerated = true
                    userUsage(res.data[0].key)
                } else {
                    $scope.keyGenerated = false
                }
            }).error(function () {});

        };

        init();

        function userUsage(key) {

            $scope.userUsageToday = [0, 0, 0, 0, 0, 0, 0, 0, 0]
            $scope.userUsageThisWeeks = [0, 0, 0, 0, 0, 0, 0, 0, 0]
            $scope.userUsageThisMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0]

            // Usage
            Auth.TOTAL_API_ANALYTICS_BY_USER(urls.API_USAGE_COUNT_BY_KEY, key, 0, (res) => {

                // console.log('the response',res.data[0]);

                // $scope.userUsageToday = [res.data[0].reverse_geocode, res.data[0].geocode, res.data[0].autocomplete, res.data[0].nearby,
                //     res.data[0].distance, res.data[0].ward_zone, res.data[0].ward, res.data[0].zone, res.data[0].dncc
                // ]

                $scope.userUsageToday = processDaily(res.data)
            }, (e) => {
                // console.log(e + 'ddddd')
            })

            // // this week
            Auth.TOTAL_API_ANALYTICS_BY_USER(urls.API_USAGE_COUNT_BY_KEY, key, 6, (res) => {
                // $scope.userUsageThisWeeks = [res.data[0].reverse_geocode, res.data[0].geocode, res.data[0].autocomplete, res.data[0].nearby,
                //     res.data[0].distance, res.data[0].ward_zone, res.data[0].ward, res.data[0].zone, res.data[0].dncc
                // ]

                $scope.userUsageThisWeeks = processWeekly(res.data)
            }, (e) => {
                console.log(e)
            })

            // // thsi month 
            Auth.TOTAL_API_ANALYTICS_BY_USER(urls.API_USAGE_COUNT_BY_KEY, key, 29, (res) => {
                // $scope.userUsageThisMonth = [res.data[0].reverse_geocode, res.data[0].geocode, res.data[0].autocomplete, res.data[0].nearby,
                //     res.data[0].distance, res.data[0].ward_zone, res.data[0].ward, res.data[0].zone, res.data[0].dncc
                // ]                

                $scope.userUsageThisMonth = processMonthly(res.data)

            }, (e) => {
                console.log(e)
            })
        }


        // processing Data
        // daily data
        function processDaily(dailyResponse) {

            try {
                let dailyDataObject = dailyResponse.reduce((a, c) => (Object.keys(c).forEach(k => (a[k] += c[k])), a))
                let dailyData = []
                dailyData.push(dailyDataObject.autocomplete)
                dailyData.push(dailyDataObject.geocode)
                dailyData.push(dailyDataObject.reverse_geocode)
                dailyData.push(dailyDataObject.nearby)
                dailyData.push(dailyDataObject.distance)
                dailyData.push(dailyDataObject.rupantor_batchgeo)
                dailyData.push(dailyDataObject.ward_zone)
                dailyData.push(dailyDataObject.ward)
                dailyData.push(dailyDataObject.zone)
                dailyData.push(dailyDataObject.dncc)
                

                return dailyData
            } catch (e) {
                return [0, 0, 0, 0, 0]
            }

        }

        // weekly data
        function processWeekly(weeklyResponse) {

            try {
                let weekDataObject = weeklyResponse.reduce((a, c) => (Object.keys(c).forEach(k => (a[k] += c[k])), a))
                let weekData = []
                weekData.push(weekDataObject.autocomplete)
                weekData.push(weekDataObject.geocode)
                weekData.push(weekDataObject.reverse_geocode)
                weekData.push(weekDataObject.nearby)
                weekData.push(weekDataObject.distance)
                weekData.push(weekDataObject.rupantor_batchgeo)
                weekData.push(weekDataObject.ward_zone)
                weekData.push(weekDataObject.ward)
                weekData.push(weekDataObject.zone)
                weekData.push(weekDataObject.dncc)
                

                return weekData
            } catch (e) {
                return [0, 0, 0, 0, 0]
            }
        }

        // monthly data
        function processMonthly(monthlyResponse) {

            try {
                console.table(monthlyResponse);
                
                let monthlyDataObject = monthlyResponse.reduce((a, c) => (Object.keys(c).forEach(k => (a[k] += c[k])), a))
                let monthData = []
                monthData.push(monthlyDataObject.autocomplete)
                monthData.push(monthlyDataObject.geocode)
                monthData.push(monthlyDataObject.reverse_geocode)
                monthData.push(monthlyDataObject.nearby)
                monthData.push(monthlyDataObject.distance)
                monthData.push(monthlyDataObject.rupantor_batchgeo)
                monthData.push(monthlyDataObject.ward_zone)
                monthData.push(monthlyDataObject.ward)
                monthData.push(monthlyDataObject.zone)
                monthData.push(monthlyDataObject.dncc)

                console.log('ddfdd ',monthlyDataObject);
                

                return monthData
            } catch (e) {
                return [0, 0, 0, 0, 0]
            }

        }


        $scope.api = ['Autocomplete', 'Geocode', 'Reverse Geo', 'Nearby', 'Distance', 'Rupantor Batchgeo', 'Ward Zone', 'Ward', 'Zone', 'City Corp'];

        // chart options 
        $scope.pieChartOptions = {
            showTooltips: true,
            legend: {
                display: true,
                position: 'left'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        };
        $scope.doughnutOptions = {
            showTooltips: true,
            legend: {
                display: true,
                position: 'left'
            }
        }
        $scope.barChartOptions = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }


    }

}());