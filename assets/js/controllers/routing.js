(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('Routing', Routing);

    Routing.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'bsLoadingOverlayService'];

    function Routing($rootScope, $scope, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, bsLoadingOverlayService) {

        var id;
        var minLength = 1;
        $scope.loading = false;
        $scope.toggle = true;
        $scope.selected = {};
        var restore = [];

        leafletData.getMap().then(function(map) {
              $timeout(function() {
                map.invalidateSize();
                //create bounds
              }, 1000);
            });


        var addressPointsToMarkers = function(points) {

            return points.map(function(ap, i) {
                // var icon = './assets/img/' + i + '.png';

                var icon = {
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 35],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                  }
                if( ap.subType.toLowerCase() == 'water atm') {
                        icon.iconUrl = './assets/img/type/water-atm.png'
                        icon.iconSize =  [40, 46]
                        icon.popupAnchor = [6, -32]
                }                
                else if( $rootScope.availableIcons.includes(ap.pType.split(',')[0].toLowerCase())) {

                    icon.iconUrl = './assets/img/type/'+ap.pType.split(',')[0].toLowerCase()+'.png';

                } else {
                    icon.iconUrl = './assets/img/type/default.png'
                }

                
                return {
                    id: ap.address.location_id,
                    lat: ap.address.lat,
                    lng: ap.address.lon,
                    focus: false,
                    message: ap.address.name,
                    icon: icon
                };
                
            });
        };

        var id;
        var info;
        var addressPointsToMarker = function(points) {
            return points.map(function(ap) {
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
                if( ap.subType.toLowerCase() == 'water atm') {
                        icon.iconUrl = './assets/img/type/water-atm.png'
                        icon.iconSize =  [40, 46]
                        icon.popupAnchor = [6, -32]
                }                
                else if( $rootScope.availableIcons.includes(ap.pType.split(',')[0].toLowerCase())) {

                    icon.iconUrl = './assets/img/type/'+ap.pType.split(',')[0].toLowerCase()+'.png';

                } else {
                    icon.iconUrl = './assets/img/type/default.png'
                }


                // info = (ap.images[0] != null) ? '<img style="width:200px;height:200px" src=' + ap.images[0].imageLink + '><br><div><p>Address: ' + ap.Address + '<br></p><p>Subtype: ' + ap.subType + '<br></p><p>Code: ' + ap.uCode + '</p></div>' : '<div><p>Address: ' + ap.Address + '<br></p><p>Subtype: ' + ap.subType + '<br></p><p>Code: ' + ap.uCode + '</p></div>';
                return {
                    id: ap.id,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    focus: false,
                    message: info,
                    subType: ap.subType,
                    Address: ap.Address,
                    uCode: ap.uCode,
                    draggable: false,
                    icon: icon
                };
            });
        };


        angular.extend($scope, {
            center: {
                lat: 23.728783,
                lng: 90.393791,
                zoom: 12,

            },
            events: {
                map: {
                    enable: ['moveend', 'popupopen'],
                    logic: 'emit'
                },
                marker: {
                    enable: ['click', 'dblclick'],
                    logic: 'emit'
                }
            },
            layers: {
                baselayers: {
                    googleTerrain: {
                        name: 'Google Terrain',
                        layerType: 'TERRAIN',
                        type: 'google'
                    },

                    mapbox_light: {
                        name: 'Mapbox Light',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
                            mapid: 'mapbox.light'
                        }
                    },
                    osm: {
                        name: 'OpenStreetMap',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz'
                    }

                }
            }
        });

        var places = [];

        $scope.place_add = function(user) {
            places.push($scope.selected);
            $scope.markers = addressPointsToMarker(places);
            restore = $scope.markers;
        };

        $scope.unroute = function() {
            $scope.routed = false;
            $scope.markers = restore;
        };

        $scope.onSelect = function(user) {
            $scope.selected = user;

        };
        $scope.users = function(userName) {
            if (userName.length < minLength) {
                return [];
            }
            $scope.loading = true;
            return Auth.getUsers(userName).then(function(data) {
                $scope.loading = false;

                // console.log(data.places);
                return data.places;
            }, function(status) {
                $scope.loading = false;
                //$rootScope.error = 'Failed to fetch data';
                $timeout(function() {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
                    $scope.markers = [];
                }, 2000);
            });
        };

        $scope.openSlide = function() {
            $scope.toggle = !$scope.toggle;
        };


        $scope.optimize_rout = function() {
            var temp = [];
            places.map(function(plc) {
                temp.push({
                    'id': plc.id.toString(),
                    'name': plc.Address,
                    'address': {
                        'location_id': plc.id.toString(),
                        "name": plc.Address.toString(),
                        "lon": parseFloat(plc.longitude),
                        "lat": parseFloat(plc.latitude)
                    }
                });
            });



            var data = {
                "vehicles": [{
                    "vehicle_id": "my_vehicle",
                    "start_address": {
                        "location_id": places[0].id.toString(),
                        "name": places[0].Address.toString(),
                        "lon": parseFloat(places[0].longitude),
                        "lat": parseFloat(places[0].latitude)
                    }
                }],
                "services": temp,
                "configuration": {
                    "routing": {
                        "calc_points": true
                    }
                }

            };

            $http({
                method: 'POST',
                data: data,
                url: 'https://graphhopper.com/api/1/vrp/optimize?key=460523c3-e36f-4abd-9024-de283d6b3ffa',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log("Routing hoise");
                $http.get('https://graphhopper.com/api/1/vrp/solution/' + res.job_id + '?key=460523c3-e36f-4abd-9024-de283d6b3ffa')
                    .success(function(res) {
                        $scope.route_data = res.solution.routes[0].points;
                        console.log(res.solution.routes[0].activities);
                        $scope.opt_route = res.solution.routes[0].activities;
                        $scope.route_data.shift();
                        $scope.route_data.pop();
                        $scope.opt_route.shift();
                        $scope.opt_route.pop();
                        var features = [];
                        $scope.route_data.map(function(point) {
                            features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "LineString",
                                    "coordinates": point.coordinates
                                }
                            });
                        });
                        $scope.markers = addressPointsToMarkers($scope.opt_route);


                        angular.extend($scope, {
                            center: {
                                lat: $scope.route_data[0].coordinates[1],
                                lng: $scope.route_data[0].coordinates[0],
                                zoom: 13,

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

                                    mapbox_light: {
                                        name: 'Mapbox Light',
                                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                                        type: 'xyz',
                                        layerOptions: {
                                            apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
                                            mapid: 'mapbox.light'
                                        },
                                        layerParams: {
                                            showOnSelector: true
                                        }
                                    }
                                },
                                // overlays: {
                                //     draw: {
                                //         name: 'draw',
                                //         type: 'group',
                                //         visible: true,
                                //             showOnSelector: false
                                //         }
                                //     }
                                // }
                            },
                            geojson: {
                                data: {

                                    "type": "FeatureCollection",
                                    "features": features
                                }
                            }


                        });

                    })
                    .error(function() {

                    });
            }).error(function() {
                console.log('rouiting error')
            });
            $scope.routed = true;

        };


    }

}());