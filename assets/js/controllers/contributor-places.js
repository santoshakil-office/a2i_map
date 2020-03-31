(function () {
    'use strict';

    angular
        .module('barikoi')
        .controller('ContributorPlaces', ContributorPlaces);

    ContributorPlaces.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$window', '$location', '$timeout', '$modal', 'urls', 'DataTunnel', 'Auth', 'bsLoadingOverlayService', 'leafletData'];

    function ContributorPlaces($rootScope, $scope, $http, $stateParams, $window, $location, $timeout, $modal, urls, DataTunnel, Auth, bsLoadingOverlayService, leafletData) {

        var id;
        var info;
        $scope.contributor = {};
        console.log('uId ', $stateParams.id)
        $scope.openSlide = function () {
            $scope.toggle = !$scope.toggle;
        };

        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                //create bounds
            }, 500);
        });


        id = $stateParams.id;
        $scope.contributor.name = DataTunnel.get_data().name;


        var init = function () {
            Auth.getlocations(urls.CONTRIBUTER_LIST + 'all', function (res) {
                    $scope.contributor_list = res;
                    console.log(res);
                },
                function () {
                    $rootScope.error = 'Failed to fetch details';
                });
        };
        console.log($scope.contributor.name);
        init();


        var addressPointsToMarkers = function (points) {
            return points.map(function (ap, i) {
                // var icon = './assets/img/type/' + ap.pType.split(',')[0].toLowerCase() + '.png';
                if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                    console.log(ap.latitude, ap.longitude);
                    ap.latitude = 23.2433323;
                    ap.longitude = 90.02433323;
                };

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




                try {
                    info = ap.images[0].imageLink;
                } catch (e) {
                    info = 'image'
                };


                return {
                    id: ap.id,
                    idx: i,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    Address: ap.Address,
                    title: ap.Address,
                    ptype: ap.pType,
                    subtype: ap.subType,
                    uCode: ap.uCode,
                    image: info,
                    flag: false,
                    focus: false,
                    message: "<div ng-include src=\"'views/marker-popup.html'\"></div>",
                    draggable: true,
                    icon: icon
                };
            });
        };

        var addressPointsToMarker = function (points) {
            return points.map(function (ap, i) {
                if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                    console.log(ap.latitude, ap.longitude);
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
                lat: 23.728783,
                lng: 90.393791,
                zoom: 11
            },
            events: {
                map: {
                    enable: ['moveend', 'popupopen', 'contextmenu'],
                    logic: 'emit'
                },
                marker: {
                    enable: ['click', 'dblclick', 'dragend'],
                    logic: 'emit'
                }
            },
            layers: {
                baselayers: {

                    bkoi: {
                        name: 'barikoi',
                        url: 'http://map.barikoi.xyz:8080/styles/osm-bright/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            attribution: 'Barikoi',
                            maxZoom: 23
                        },
                    },

                    googleTerrain: {
                        name: 'Google Terrain',
                        layerType: 'TERRAIN',
                        type: 'google'
                    },
                    googleHybrid: {
                        name: 'Google Hybrid',
                        layerType: 'HYBRID',
                        type: 'google'
                    },
                    googleRoadmap: {
                        name: 'Google Streets',
                        layerType: 'ROADMAP',
                        type: 'google'
                    }
                }
                // overlays: {
                //     realworld: {
                //         name: "Real world data",
                //         type: "markercluster",
                //         visible: true
                //     }
                // }
            }
        });


        $scope.$on("leafletDirectiveMarker.dragend", function (event, args) {
            var data = {
                'latitude': args.model.lat,
                'longitude': args.model.lng,
            }

            Auth.updateSomething(urls.DROP_MARKER + args.model.id, data, function (res) {
                swal("Done", "marker position has been updated");
                $scope.order = null;
            }, function () {
                swal("Error")
            })
        });

        $scope.$on("leafletDirectiveMarker.click", function (event, args) {
            DataTunnel.set_data(args.model)
        });

        $scope.$on("leafletDirectiveMap.contextmenu", function (event, args) {
            // event.preventDefault();
            console.log(args);

            DataTunnel.set_data(args.leafletEvent)

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


        });

        var onResponse = function (data, id) {
            id = id;
            $scope.markers = addressPointsToMarkers(data.Message);
            $scope.count_todays = data["Count Todays"];
            $scope.income_todays = data["Todays Income"];
            $scope.income_total = data["Total Income"];
            $scope.count_total = data["Total Added"];
        };

        var onError = function () {
            swal("Somthing Wrong...Server not responging")
        };

        $http.get(urls.CONTRIBUTER_PLACE + $stateParams.id).success(function (data) {
            id = $stateParams.id;


            const contributorId = id

            $scope.markers = addressPointsToMarkers(data.Message);
            console.log($scope.markers);
            $scope.count_todays = data["Count Todays"];
            $scope.income_todays = data["Todays Income"];
            $scope.income_total = data["Total Income"];
            $scope.count_total = data["Total Added"];

            $scope.contributorDate = `places/contributor/${contributorId}#contributorDate`
            $scope.contributorResults = `places/contributor/${contributorId}#contributorResults`
        });

        $scope.switch_contributor = function (contributor) {
            $scope.date1 = $scope.date2 = null;
            bsLoadingOverlayService.start({
                referenceId: 'first'
            });
            id = contributor.name.id;
            $scope.contributor.name = contributor.name.name.toString();
            $http.get(urls.CONTRIBUTER_PLACE + id).success(function (data) {
                $timeout(function () {
                    console.log($scope.bike);
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                }, 2000);
                console.log(data.Message);
                $scope.markers = addressPointsToMarkers(data.Message);
                $scope.count_todays = data["Count Todays"];
                $scope.income_todays = data["Todays Income"];
                $scope.income_total = data["Total Income"];
                $scope.count_total = data["Total Added"];
            }).error(function () {
                $rootScope.error = 'Failed to fetch data';
                $timeout(function () {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
                }, 2000);
            })
        };

        $scope.send_date = function () {
            bsLoadingOverlayService.start({
                referenceId: 'first'
            });


            $http({
                method: 'GET',
                url: urls.CONTRIBUTER_PLACE + id + "?date=" + moment($scope.date2).format('YYYY-MM-DD'),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (data) {
                $timeout(function () {
                    console.log($scope.bike);
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                }, 2000);
                $scope.markers = addressPointsToMarkers(data.Message);
                console.log($scope.markers);
                $scope.count_todays = data["Count Todays"];
                $scope.income_todays = data["Todays Income"];
                $scope.income_total = data["Total Income"];
                $scope.count_total = data["Total Added"];
            }).error(function (err) {
                $timeout(function () {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
                }, 2000);
            })

        };

        $scope.send_dateTo = function () {
            bsLoadingOverlayService.start({
                referenceId: 'first'
            });

            $http({
                method: 'GET',
                url: urls.CONTRIBUTER_PLACE + id + "?dateTo=" + moment($scope.date1).format('YYYY-MM-DD'),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (data) {
                $timeout(function () {
                    console.log($scope.bike);
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                }, 2000);
                $scope.markers = addressPointsToMarkers(data.Message);
                console.log($scope.markers);
                $scope.count_todays = data["Count Todays"];
                $scope.income_todays = data["Todays Income"];
                $scope.income_total = data["Total Income"];
                $scope.count_total = data["Total Added"];
            }).error(function (err) {
                $timeout(function () {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
                }, 2000);
            })

        };

        $scope.set_date_interval = function () {
            bsLoadingOverlayService.start({
                referenceId: 'first'
            });

            $http({
                method: 'GET',
                url: urls.CONTRIBUTER_PLACE + id + "?dateFrom=" + moment($scope.date2).format('YYYY-MM-DD') + "&dateTill=" + moment($scope.date1).format('YYYY-MM-DD'),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (data) {
                $timeout(function () {
                    console.log($scope.bike);
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                }, 2000);
                $scope.markers = addressPointsToMarkers(data.Message);
                console.log($scope.markers);
                $scope.total = $scope.markers.length;
                // $scope.income_todays = data["Todays Income"];
                // $scope.income_total = data["Total Income"];
                $scope.count_total = data["Total Added"];
            }).error(function (err) {
                $timeout(function () {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
                }, 2000);
            })

        };


        $rootScope.$on("mk-del", function (event, data) {
            console.log($scope.markers[data.idx])
            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-dlt.svg';
            // console.log('id ', $scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id));
            //  $scope.markers.splice($scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id), 1);
            //$scope.markers.splice(data.idx, 1);
        });

        $rootScope.$on("mk-upd", function (event, data) {

            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-upd.svg';
            $scope.markers[data.idx].lat = data.lat;
            $scope.markers[data.idx].lng = data.lng;
            // marker updated lat lon to set
        });


        // $rootScope.$on("flag-cng", function(event, data) {
        //     $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-dlt.svg';
        // })

        $rootScope.$on("mk-muv", function (event, data) {
            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-muv.svg';
        });

        $rootScope.$on("mk-new", function (event, data) {
            var tempary = [];
            tempary.push(data)
            var temp = addressPointsToMarker(tempary)
            console.log(temp)
            $scope.markers.push(temp[0])


        });

    }

}());