(function () {
    'use strict';

    angular
        .module('barikoi')
        .controller('DashController', DashController);

    DashController.$inject = ['$rootScope', '$scope', '$http', '$interval', '$location', '$timeout', '$modal', 'leafletData', 'urls', 'Auth', 'bsLoadingOverlayService', 'DataTunnel'];

    function DashController($rootScope, $scope, $http, $interval, $location, $timeout, $modal, leafletData, urls, Auth, bsLoadingOverlayService, DataTunnel) {

        // bsLoadingOverlayService.start({
        //         referenceId: 'first'
        // });

        //Route Initialize.............................................

        $scope.active = false

        $scope.pieChartLabels = ['Restaurant', 'Office', 'Bank', 'Hospital', 'School']
        $scope.pieChartData = [30, 55, 15, 8, 22]

        $scope.barChartLabels = ['Created', 'Updated', 'Deleted']
        $scope.barChartData = [30, 55, 15]

        $scope.cityCorpUsageToday = [0, 0, 0, 0]
        $scope.cityCorpUsageThisWeek = [0, 0, 0, 0]
        $scope.cityCorpUsageThisMonth = [0, 0, 0, 0]
        $scope.todaysUsage = [0, 0, 0, 0, 0]
        $scope.thisWeeksUsage = [0, 0, 0, 0, 0]
        $scope.thisMonthsUsage = [0, 0, 0, 0, 0]


        // api usage request and process rupantor_batchgeo
        function apiUsageDetails() {
            // Todays API Counts
            Auth.TOTAL_API_ANALYTICS(`${urls.API_USAGE_COUNT}=0`, (res) => { 
                $scope.todaysUsage = [res.data.reverse_geocode, res.data.geocode, res.data.autocomplete, res.data.nearby, res.data.distance, res.data.rupantor_batchgeo]

                $scope.cityCorpUsageToday = [res.data.ward_zone, res.data.ward, res.data.zone, res.data.dncc]
            }, (e) => {
                console.log(e)
            })

            // this week
            Auth.TOTAL_API_ANALYTICS(`${urls.API_USAGE_COUNT}=6`, (res) => {
                $scope.thisWeeksUsage = [res.data.reverse_geocode, res.data.geocode, res.data.autocomplete, res.data.nearby, res.data.distance, res.data.rupantor_batchgeo ]

                $scope.cityCorpUsageThisWeek = [res.data.ward_zone, res.data.ward, res.data.zone, res.data.dncc]

            }, (e) => {
                console.log(e)
            })

            // thsi month 
            Auth.TOTAL_API_ANALYTICS(`${urls.API_USAGE_COUNT}=29`, (res) => {
                $scope.thisMonthsUsage = [res.data.reverse_geocode, res.data.geocode, res.data.autocomplete, res.data.nearby, res.data.distance, res.data.rupantor_batchgeo ]

                $scope.cityCorpUsageThisMonth = [res.data.ward_zone, res.data.ward, res.data.zone, res.data.dncc]

            }, (e) => {
                console.log(e)
            })

            /*
                Max Users
            */
            Auth.TOTAL_API_ANALYTICS(`${urls.API_MAX_USERS_BY_KEY}=0`, (res) => {
                $scope.max_user_today_label = []
                $scope.max_user_today_score = []
                if(res.data.length > 0){
                    res.data.map(function(max_user) {
                        $scope.max_user_today_label.push(max_user.Name)
                        $scope.max_user_today_score.push(max_user.Api_Use)
                    });
                }
                
            }, (e) => {
                console.log(e)
            })

            Auth.TOTAL_API_ANALYTICS(`${urls.API_MAX_USERS_BY_KEY}=6`, (res) => {
                $scope.max_user_week_label = []
                $scope.max_user_week_score = []
                if(res.data.length > 0){
                    res.data.map(function(max_user) {
                        $scope.max_user_week_label.push(max_user.Name)
                        $scope.max_user_week_score.push(max_user.Api_Use)
                    });
                }
                
            }, (e) => {
                console.log(e)
            })
        }

        // initial function call
        function init() {

            apiUsageDetails()

            $http({
                method: 'GET',
                url: urls.ANALYTICS,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (res) {

                bsLoadingOverlayService.stop({
                    referenceId: 'first'
                });
                $scope.data = res;
                $scope.label1 = ['Today', 'Yesterday', '', ''];
                $scope.label2 = ['Last Week', 'Before Last', 'Two Week Before'];

                $scope.colors = [{
                    backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(255, 205, 86, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(201, 203, 207, 0.2)"],
                    pointBackgroundColor: "rgba(159,0,0, 1)",
                    pointHoverBackgroundColor: "rgba(159,0,0, 0.8)",
                    borderColor: ["rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"],
                    pointBorderColor: '#fff',
                    pointHoverBorderColor: "rgba(159,0,0, 1)"
                }, "rgba(250,0,33,0.5)", "#9a9a9a", "rgb(233,177,69)"];
                $scope.graph1 = [
                    [$scope.data['Todays'], $scope.data['Yesterday']],
                ];
                $scope.graph2 = [
                    [$scope.data['lastWeek'], $scope.data['weekBeforeLastWeek'], $scope.data['twoweeksago']],
                ];
                $scope.options = {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            }).error(function (err) {
                bsLoadingOverlayService.stop({
                    referenceId: 'first'
                });
            });

            $http({
                method: 'GET',
                url: urls.TOTAL_USER,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (res) {
                $scope.totaluser = res;

            }).error(function (err) {
                console.log(err);

            });



            // Areas
            Auth.getlocations(urls.POLYGON, function (res) {
                    $scope.areas = res.area;
                    var coordinates = [];
                    var temp = []
                    $scope.areas.map(function (area) {
                        var polyjson = JSON.parse(area['ST_AsGeoJSON(area)']);
                        //console.log(polyjson.coordinates[0]);
                        temp.push(polyjson.coordinates[0])
                        // console.log(array.concat(polyjson.coordinates[0]));
                    });
                    coordinates = temp;
                    // console.log(coordinates);
                    //             var array1 = [[1, 2, 3],[4, 5, 6]];
                    // var array2 = [[7, 8, 9],[10, 11, 12]]

                    // console.log(array1.concat(array2));

                    $scope.areas.push({
                        id: -1,
                        name: "all",
                        'ST_AsGeoJSON(area)': JSON.stringify({
                            'type': "Polygon",
                            'coordinates': coordinates
                        })
                    });

                },
                function () {

                });

            // sub areas
            Auth.getlocations(urls.GET_SUBTYPES, function (res) {
                    $scope.subcategories = res;
                    $scope.subcategories.push({
                        subtype: "all"
                    });
                    //console.log(res);
                },
                function () {

                });

            // Daily Usage Analytics
            // Auth.DAILY_ANALYTICS(urls.DAILY_ANALYTICS, (res) => {

            //     $scope.dailyAnalytics = res.data

            // }, (err) => console.log('error: ', err))

            // refreshApiAnalytics()

        };

        init()

        $interval(apiUsageDetails, 300000);


        var refreshApiAnalytics = function () {

            // Daily Usage Analytics
            Auth.DAILY_ANALYTICS(urls.DAILY_ANALYTICS, (res) => {

                $scope.dailyAnalytics = res.data
                // console.log('data-refreshed')

            }, (err) => console.log('error: ', err))


        }

        $scope.startTimer = function () {
            $scope.Timer = $interval(refreshApiAnalytics, 300000);
        };
        //API analytics continuous check


        $scope.$on("$destroy", function () {
            if (angular.isDefined($scope.Timer)) {
                $interval.cancel($scope.Timer);
            }
        });

        $scope.startTimer();


        var addressPointsToMarkers = function (points) {
            return points.map(function (ap, i) {

                var uc;
                try {
                    uc = ap.update_count.toString()
                } catch (e) {
                    uc = ''
                }

                var icon = {
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 35],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                }
                if (ap.subType.toLowerCase() == 'water atm') {
                    icon.iconUrl = './assets/img/type/water-atm.png'
                    icon.iconSize = [40, 46]
                    icon.popupAnchor = [6, -32]
                } else if ($rootScope.availableIcons.includes(ap.pType.split(',')[0].toLowerCase())) {

                    icon.iconUrl = './assets/img/type/' + ap.pType.split(',')[0].toLowerCase() + '.png';

                } else {
                    icon.iconUrl = './assets/img/type/default.png'
                }

                return {
                    id: ap.id,
                    idx: i,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    message: "<div ng-include src=\"'views/marker-popup.html'\"></div>",
                    ptype: ap.pType,
                    area: ap.area,
                    Address: ap.Address,
                    title: ap.Address,
                    update_count: uc,
                    subtype: ap.subType,
                    uCode: ap.uCode,
                    userID: ap.user_id,
                    updated_at: ap.updated_at,
                    icon: icon
                };
            });
        };

        var new_place_added_to_marker = function (points) {
            return points.map(function (ap, i) {
                if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                    // console.log(ap.latitude, ap.longitude);
                    ap.latitude = 23.2433323;
                    ap.longitude = 90.02433323;
                };
                return {
                    id: ap.id,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    Address: ap.Address,
                    icon: {
                        iconUrl: './assets/img/marker-add.svg',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 35],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                    }

                };
            });
        };


        angular.extend($scope, {
            center: {
                lat: 23.757087,
                lng: 90.390370,
                autoDiscover: false,
                zoom: 13
            },

            defaults: {
                doubleClickZoom: false,
                scrollWheelZoom: true,
                map: {
                    contextmenu: true,
                    contextmenuWidth: 140,
                    contextmenuItems: [{
                        text: 'Add Place Here',
                        callback: go_to_retool
                    }]
                }
            },
            events: {
                map: {
                    enable: ['moveend', 'popupopen', 'click', 'dblclick', 'contextmenu'],
                    logic: 'emit'
                },
                marker: {
                    enable: ['click', 'mouseover', 'mouseout'],
                    logic: 'emit'
                }
            },
            layers: {
                baselayers: {


                    barikoi: {
                        name: 'barikoi',
                        url: 'http://map.barikoi.xyz:8080/styles/osm-bright/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            attribution: 'Barikoi',
                            maxZoom: 23
                        },
                    },

                    bkoi: {
                        name: 'Barikoi',
                        type: 'wms',
                        url: 'http://13.229.51.147:8080/geoserver/barikoi/wms?',
                        visible: true,
                        layerOptions: {
                            layers: 'barikoi:bd_custom',
                            format: 'image/png',
                            // opacity: 0.25,
                            attribution: 'bkoi',
                            crs: L.CRS.EPSG3857,
                            maxZoom: 23
                        }
                    },

                    osm: {
                        name: 'OpenStreetMap',
                        type: 'xyz',
                        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    }
                }
            }
        });

        function go_to_retool(e, args) {
            // console.log(e);
            DataTunnel.set_data(e)

            var modalInstance = $modal.open({
                templateUrl: '../../views/dtool/retool-modal.html',
                controller: 'Retool',
                size: 'lg',
                resolve: {
                    loc: function () {
                        return $scope.place;
                    }
                }
            });

        }

        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                //create bounds
            }, 700);

        });


        $scope.onSelect = function (user) {
            console.log(user);
            $scope.center.lat = parseFloat(user.latitude);
            $scope.center.lng = parseFloat(user.longitude);
            $scope.active = false;
            leafletData.getMap().then(function (map) {
                $timeout(function () {
                    map.invalidateSize();
                    //create bounds
                }, 1000);
            });


            var tempary = []
            tempary.push(user)

            $scope.markers = addressPointsToMarkers(tempary);
        };



        $scope.users = function (userName) {
            // console.log(userName)
            if (userName.length < 0) {
                return [];
            }
            $scope.loading = true;
            return Auth.adminSearch(userName).then(function (data) {

                // console.log(data.places);
                $scope.markers = addressPointsToMarkers(data.places);
                $scope.center.lat = parseFloat(data.places[0].latitude);
                $scope.center.lng = parseFloat(data.places[0].longitude);
                $scope.center.zoom = 11;

                $scope.loading = false;
                return data.places;
            }, function (status) {
                $scope.loading = false;
            });
        };


        // HIDE MAP & SHOW MAP in DASHBOARD
        $scope.active = true
        $scope.mapVisibilityTitle = 'Hide Map'

        $scope.viewMapTitleChange = function () {
            if (!$scope.active) {
                $scope.active = true
                $scope.mapVisibilityTitle = 'Show Map'
            } else {
                $scope.active = false
                $scope.mapVisibilityTitle = 'Hide Map'
            }
        }


        $rootScope.$on("mk-del", function (event, data) {
            // console.log($scope.markers[data.idx])
            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-dlt.svg';
            // console.log('id ', $scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id));
            //  $scope.markers.splice($scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id), 1);
            //$scope.markers.splice(data.idx, 1);
        })

        $rootScope.$on("mk-upd", function (event, data) {

            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-upd.svg';
            // console.log('id ', $scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id));
            //  $scope.markers.splice($scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id), 1);
            //$scope.markers.splice(data.idx, 1);
        });

        $rootScope.$on("mk-muv", function (event, data) {
            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-muv.svg';
        });

        $rootScope.$on("mk-new", function (event, data) {
            var tempary = [];
            tempary.push(data)
            var temp = new_place_added_to_marker(tempary)
            // console.log(temp)
            $scope.markers.push(temp[0])


        })

        //$interval(init, 5000);

        $scope.$on("leafletDirectiveMarker.click", function (event, args) {
            DataTunnel.set_data(args.model)
        });


        $scope.$on("leafletDirectiveMap.dblclick", function (event, args) {


            let data = {
                params: {
                    longitude: args.leafletEvent.latlng.lng,
                    latitude: args.leafletEvent.latlng.lat
                }
            }

            $http.get(urls.REVERSE_GEO_NO_AUTH, data)
                .success(function (response) {

                    // console.log(response[0])

                    let reverseData = response[0]

                    if (typeof reverseData !== 'undefined') {
                        $scope.selecting = reverseData.Address
                    } else {
                        $scope.selecting = 'No data found!'
                    }

                    $scope.markers = addressPointsToMarkers(response)

                })

        });


        // CHART
        $scope.api = ['Reverse Geo', 'Geocode', 'Autocomplete', 'Nearby', 'Distance', 'Rupantor Batchgeo'];
        $scope.bkoiGovtApi = ['Ward Zone', 'Ward', 'Zone', 'City Corp']

        $scope.onClick = function (points, evt) {};

        $scope.datasetOverride = [{
            yAxisID: 'y-axis-1'
        }, {
            yAxisID: 'y-axis-2'
        }];

        // chart options 
        $scope.pieChartOptions = {
            showTooltips: true,
            legend: {
                display: true,
                position: 'left',
                align: 'center'
            }
        };
        $scope.barChartOptions = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
        $scope.doughnutChartOptions = {
            showTooltips: true,
            legend: {
                display: true,
                position: 'left',
                align: 'center'
            },
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