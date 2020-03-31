(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('PolygonlineStdRoad', PolygonlineStdRoad);

    PolygonlineStdRoad.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function PolygonlineStdRoad($scope, $modal, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
        // $scope.coordinates=[];
        var modalInstance;

        $scope.roadtypes = [{
            key: '8',
            name: 'Asphalt'
        }, {
            key: '9',
            name: 'Concrete'
        }, {
            key: '10',
            name: 'Unpaved'
        }, {
            key: '11',
            name: 'Good'
        }, {
            key: '12',
            name: 'Bad'
        }, {
            key: '13',
            name: 'Disaster'
        }];

        Auth.getlocations(urls.POLYGON_AREA + '?', function(res) {
                $scope.areas = res;

            },
            function() {

            });





        Auth.getlocations(urls.POLYGON_SUBAREA + '?', function(res) {
                $scope.subareas = res;
                //console.log(res);
            },
            function() {

            });



        var init = function() {
            Auth.getlocations(urls.POLYLINE_ROAD + '?', function(res) {
                    $scope.roads = res;
                    var coordinates = [];
                    var temp = [];
                    $scope.Feature = []
                    $scope.roads.map(function(road, k) {
                        var polyjson = JSON.parse(road['ST_AsGeoJSON(road_geometry)']);

                        $scope.Feature.push({
                            "type": "Feature",
                            "properties": {
                                "name": road.road_name_number,
                                "number_of_lanes": road.number_of_lanes,
                                "road_condition": road.road_condition,

                            },
                            "geometry": {
                                "type": "LineString",
                                "coordinates": polyjson.coordinates
                            }
                        });



                        temp.push(polyjson.coordinates);
                        // console.log(array.concat(polyjson.coordinates[0]));
                    });

                    coordinates = temp;



                    //$scope.areas.push({id: -1, name:"all", 'ST_AsGeoJSON(area)': JSON.stringify({'type': "Polygon", 'coordinates': coordinates})});

                    angular.extend($scope, {
                        center: {
                            lat: coordinates[0][0][1],
                            lng: coordinates[0][0][0],
                            zoom: 14,

                        },

                        geojson: {
                            data: {
                                "type": "FeatureCollection",
                                "features": $scope.Feature
                            },
                            style: style,
                        },

                        selectedRoad: {},

                        events: {
                            geojson: {
                                enable: ['click', 'mouseover']
                            }
                        },


                    });

                },
                function() {

                });

        };
        init();


        $scope.$on("leafletDirectiveGeoJson.click", function(ev, leafletPayload) {
            countryClick(leafletPayload.leafletObject, leafletPayload.leafletEvent);
        });

        $scope.$on("leafletDirectiveGeoJson.mouseover", function(ev, leafletPayload) {
            countryMouseover(leafletPayload.leafletObject.feature, leafletPayload.leafletEvent);
        });

        function countryClick(country, event) {
            country = country.feature;
            console.log(country.properties.name);
        }

        function countryMouseover(feature, leafletEvent) {
            // var layer = leafletEvent.target;
            // layer.setStyle({
            //     weight: 2,
            //     color: '#666',
            //     fillColor: 'white'
            // });
            //layer.bringToFront();
            $scope.selectedRoad = feature.properties.name;
            console.log(feature);
        }







        function getColor(road) {
            if (road.properties.road_condition.includes('Good')) {
                return '#55AA55'
            } else if (road.properties.road_condition.includes('Bad')) {
                return '#D4A76A'
            } else if (road.properties.road_condition.includes('Disaster')) {
                return '#D46A6A'
            } else {
                return '#4F628E'
            }
        }

        function getfillColor(road) {
            if (road.properties.road_condition.includes('Good')) {
                return '#55AA55'
            } else if (road.properties.road_condition.includes('Bad')) {
                return '#D4A76A'
            } else if (road.properties.road_condition.includes('Disaster')) {
                return '#D46A6A'
            } else if (road.geometry.type == "Polygon") {
                return
            } else {
                return '#4F628E'
            }
        }

        function getWidth(road) {

            return road.properties.number_of_lanes;
        }

        function style(feature) {
            return {
                fillColor: getfillColor(feature),
                weight: getWidth(feature),
                opacity: 2,
                color: getColor(feature),
                dashArray: '',
                fillOpacity: 0.7
            };
        }


        angular.extend($scope, {
            center: {
                lat: 23.728783,
                lng: 90.393791,
                zoom: 12,

            },
            controls: {
                draw: {}
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

                    mapbox_light: {
                        name: 'Mapbox Streets',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
                            mapid: 'mapbox.streets',
                            maxZoom: 23

                        },
                        layerParams: {
                            showOnSelector: true
                        }
                    },
                    osm: {
                        name: 'OpenStreetMap',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            maxZoom: 23
                        },
                    }
                },
                overlays: {
                    draw: {
                        name: 'draw',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                }
            }
        });






        leafletData.getMap().then(function(map) {
            $timeout(function() {
                map.invalidateSize();
                //create bounds
            }, 500);
        });




        leafletData.getMap().then(function(map) {
            leafletData.getLayers().then(function(baselayers) {
                var drawnItems = baselayers.overlays.draw;
                map.on('draw:created', function(e) {
                    var layer = e.layer;
                    drawnItems.addLayer(layer);
                    //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                    var array = [];
                    // console.log(layer.toGeoJSON())
                    layer.toGeoJSON().geometry.coordinates.map(function(ary) {

                        array.push(ary.join(' '));
                    });

                    $scope.coordinates = array.reduce(
                        (accumulator, currentValue) => accumulator.concat(currentValue),
                        []
                    );

                    DataTunnel.set_data($scope.coordinates);

                    modalInstance = $modal.open({
                        //templateUrl: '/local/views/local-admin/polyline-road-mod.html',
                        templateUrl: '/../../views/local-admin/polyline-road-mod.html',
                        controller: 'PolygonModal',
                        size: 'lg',
                        scope: $scope,
                        backdrop: 'static'
                    });


                    // swal({
                    //     title: "Polygon Name?",
                    //     type: "input",
                    //     showCancelButton: true,   
                    //     closeOnConfirm: false,
                    //     inputPlaceholder: "Ex: Mirpur-2, Banani etc"
                    //   }, function (inputValue) {
                    //     if (inputValue === false) return false;
                    //     if (inputValue === "") {
                    //       swal.showInputError("Only tagging is real!");
                    //       return false
                    //     }
                    //       var data = {
                    //         area : coordinates.toString(),
                    //         name : inputValue
                    //       }
                    //       Auth.post_anything(urls.POLYGON_CREATE, data, function(res) {
                    //         console.log(res);
                    //          swal("Nice!", "New Polygon Inserted ", "success");
                    //       },function() {

                    //       })

                    //   });
                });
            });
        });


        $scope.onRoadSelect = function(selectedItem) {
            $scope.road_type = selectedItem;

        };


        $scope.set_area = function(area) {
            // console.log(zone);
            // var polyjson = JSON.parse(zone['ST_AsGeoJSON(ward_area)']);
            // console.log(polyjson);
            $scope.id = area['id'];

            Auth.getlocations(urls.ROAD_BY_AREA + $scope.id + '?', function(res) {
                    $scope.roads = res;
                    var coordinates = [];
                    var temp = [];
                    $scope.Feature = []
                    $scope.roads.map(function(road, k) {
                        var polyjson = JSON.parse(road['ST_AsGeoJSON(road_geometry)']);

                        $scope.Feature.push({
                            "type": "Feature",
                            "properties": {
                                "name": road.road_name_number,
                                "number_of_lanes": road.number_of_lanes,
                                "road_condition": road.road_condition,

                            },
                            "geometry": {
                                "type": "LineString",
                                "coordinates": polyjson.coordinates
                            }
                        });



                        temp.push(polyjson.coordinates);
                        // console.log(array.concat(polyjson.coordinates[0]));
                    });

                    coordinates = temp;
                    $scope.Feature.push({
                        "type": "Feature",
                        "properties": {
                            "name": '',
                            "number_of_lanes": '',
                            "road_condition": '',

                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": JSON.parse(area['ST_AsGeoJSON(area_area)']).coordinates
                        }
                    });



                    //$scope.areas.push({id: -1, name:"all", 'ST_AsGeoJSON(area)': JSON.stringify({'type': "Polygon", 'coordinates': coordinates})});

                    angular.extend($scope, {
                        center: {
                            lat: coordinates[0][0][1],
                            lng: coordinates[0][0][0],
                            zoom: 14,

                        },

                        geojson: {
                            data: {
                                "type": "FeatureCollection",
                                "features": $scope.Feature
                            },
                            style: style,
                        },

                        selectedRoad: {},

                        events: {
                            geojson: {
                                enable: ['click', 'mouseover']
                            }
                        },


                    });


                },
                function() {

                });


            // $scope.markers = {};
        };






        $scope.changeCenter = function(marker) {
            $rootScope.center.lat = marker.lat;
            $rootScope.center.lng = marker.lng;
        };

        $scope.openSlide = function() {
            $scope.toggle = !$scope.toggle;
        };

        $scope.$on("leafletDirectiveGeoJson.myMap.mouseover", function(ev, leafletPayload) {
            console.log(leafletPayload.leafletObject.feature);
        });


    }

}());