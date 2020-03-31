(function () {
    'use strict';

    angular
        .module('barikoi')
        .controller('LocalPolygonStdWard', LocalPolygonStdWard);

    LocalPolygonStdWard.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function LocalPolygonStdWard($scope, $modal, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
        // $scope.coordinates=[];

        var drawnItems = new L.FeatureGroup();


        var init = function () {
            Auth.getlocations(urls.POLYGON_ZONE + '?', function (res) {
                $scope.zones = res;

            },
            function () {

            });

        Auth.getlocations(urls.POLYGON_WARD + '?', function (res) {
                $scope.wards = res;

            },
            function () {

            });
        }

        init()




        angular.extend($scope, {
            center: {
                lat: 23.728783,
                lng: 90.393791,
                zoom: 12,

            },
            // controls: {
            //            draw: {}
            //        },
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
                        // url: 'http://13.229.51.147:8080/geoserver/barikoi/wms?',
                        url: 'http://geoserver.barikoi.com:8080/geoserver/barikoi/wms?',
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
                            attribution: 'barikoi',
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
                    },

                    googleTerrain: {
                        name: 'Google Terrain',
                        layerType: 'TERRAIN',
                        type: 'google',
                        layerOptions: {

                            attribution: 'barikoi',
                            maxZoom: 23
                        }
                    },




                },
                overlays: {

                }
            }
        });

        $scope.Feature = []
        let baseWardDrawed = false

        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                //create bounds
            }, 500);
            map.addLayer(drawnItems);


            // Set the title to show on the polygon button
            L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a polygon!';

            var drawControl = new L.Control.Draw({
                position: 'topleft',
                draw: {
                    // polyline: {
                    //     metric: true
                    // },
                    polygon: {
                        // allowIntersection: true,
                        // showArea: true,
                        drawError: {
                            color: '#bada55',
                            timeout: 1000
                        },
                        shapeOptions: {
                            color: '#662d91'
                        }
                    },
                    circle: {
                        shapeOptions: {
                            color: '#662d91'
                        }
                    },
                    marker: false
                },
                edit: {
                    featureGroup: drawnItems,
                    remove: false
                }
            });
            map.addControl(drawControl);

            map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;
                console.log(layer)
                var layer = e.layer;
                drawnItems.addLayer(layer);
                //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                var array = [];
                layer.toGeoJSON().geometry.coordinates[0].map(function (ary) {

                    array.push(ary.join(' '));
                });
                $scope.coordinates = array.reduce(
                    (accumulator, currentValue) => accumulator.concat(currentValue),
                    []
                );



                DataTunnel.set_data($scope.coordinates);

                var modalInstance = $modal.open({
                    //templateUrl: '/local/views/polygon-area-mod.html',
                    templateUrl: '/../../views/local-admin/polygon-ward-mod.html',
                    controller: 'LocalPolygonModal',
                    size: 'lg',
                    scope: $scope,
                    backdrop: 'static'
                });

                drawnItems.addLayer(layer);
            });

            map.on('draw:edited', function (e) {

                console.log('updating: ', $scope.wardId)


                var layer = e.layers;
                //drawnItems.addLayer(layer);
                //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                var array = [];
                console.log(layer.toGeoJSON())
                layer.toGeoJSON().features[0].geometry.coordinates[0].map(function (ary) {

                    array.push(ary.join(' '));
                });
                $scope.coordinates = array.reduce(
                    (accumulator, currentValue) => accumulator.concat(currentValue),
                    []
                );



                swal({
                        title: "Are you sure?",
                        // text: "You will not be able to recover this imaginary file!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, update Ward Poligon!",
                        closeOnConfirm: false
                    },
                    function () {
                        var data = {
                            ward_area: $scope.coordinates.toString()
                        };
                        Auth.updateSomething(
                            urls.POLYGON_WARD + "/" + $scope.wardId,
                            data,
                            function (res) {
                                swal("Done", "Ward Polygon updated");
                            },
                            function () {
                                swal("Error");
                            }
                        );
                    }
                );
                // var countOfEditedLayers = 0;
                // layers.eachLayer(function(layer) {
                //   countOfEditedLayers++;
                // });
                // console.log("Edited " + countOfEditedLayers + " layers");
            });

        });



        function getColor() {
            var o = Math.round,
                r = Math.random,
                s = 255;
            return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
        }

        function whenClicked(e) {
            // console.log(e)
            //console.log(e.target.feature.properties.key)
            swal('Ward Number: ' + e.target.feature.properties.name, '')
            // $scope.wardId = e.target.feature.properties.key
            // toaster.pop('success', e.target.feature.properties.name);
            // You can make your ajax call declaration here
            //$.ajax(... 
            var center = e.feature.getBounds().getCenter();
            console.log(center);

        }


        function onEachFeature(feature, layer) {
            //bind click
            // layer.on({
            //     click: whenClicked
            // });
            layer.bindTooltip('Ward : ' +feature.properties.name, {permanent:true,direction:'center',className: 'countryLabel'});
        }


        function style(feature) {
            return {
                fillColor: getColor(),
                opacity: 1,
                color: getColor(),
                dashArray: '3',
                fillOpacity: 0.4
            };
        }

        var polyline1

        // $scope.set_zone = function (zone) {
        //     // console.log(zone);
        //     // var polyjson = JSON.parse(zone['ST_AsGeoJSON(ward_area)']);
        //     // console.log(polyjson);
        //     // $scope.wardId = zone['id'];

        //     Auth.getlocations(urls.WARDS_BY_ZONE + $scope.wardId + '?', function (res) {
        //         console.log('haleluiahah');
                
        //             $scope.roads = res;
        //             var coordinates = [];
        //             var temp = [];
        //             $scope.roads.map(function (road, k) {
        //                 var polyjson = JSON.parse(road['ST_AsGeoJSON(ward_area)']);

        //                 $scope.Feature.push({
        //                     "type": "Feature",
        //                     "properties": {
        //                         "name": zone.zone_number,
        //                     },
        //                     "geometry": {
        //                         "type": "Polygon",
        //                         "coordinates": polyjson.coordinates
        //                     }
        //                 });
        //                 temp.push(polyjson.coordinates);

        //             });

        //             coordinates = temp;
        //             console.log(coordinates);

        //             angular.extend($scope, {
        //                 center: {
        //                     lat: coordinates[0][0][0][1],
        //                     lng: coordinates[0][0][0][0],
        //                     zoom: 14,

        //                 },

        //                 geojson: {
        //                     data: {
        //                         "type": "FeatureCollection",
        //                         "features": $scope.Feature
        //                     },
        //                     style: style,
        //                     onEachFeature: onEachFeature
        //                 },


        //             });




        //         },
        //         function () {

        //         });

        // };

        $scope.set_zone = function (zone) {
            // console.log(zone);
            // var polyjson = JSON.parse(zone['ST_AsGeoJSON(ward_area)']);
            // console.log(polyjson);
            // $scope.wardId = zone['id'];
            $scope.Feature = []
            

            Auth.getlocations(urls.WARDS_BY_ZONE + zone.id, function (res) {
                
                    $scope.roads = res;
                    // $scope.roads
                    var coordinates = [];
                    var temp = [];
                    $scope.roads.map(function (road, k) {
                        
                        var polyjson = JSON.parse(road['ST_AsGeoJSON(ward_area)']);

                        $scope.Feature.push({
                            "type": "Feature",
                            "properties": {
                                "name": road.ward_number,
                            },
                            "geometry": {
                                "type": "Polygon",
                                "coordinates": polyjson.coordinates
                            }
                        });
                        temp.push(polyjson.coordinates);

                    });

                    coordinates = temp;

                    //$scope.areas.push({id: -1, name:"all", 'ST_AsGeoJSON(area)': JSON.stringify({'type': "Polygon", 'coordinates': coordinates})});

                    angular.extend($scope, {
                        center: {
                            lat: coordinates[0][0][0][1],
                            lng: coordinates[0][0][0][0],
                            zoom: 14,

                        },

                        geojson: {
                            data: {
                                "type": "FeatureCollection",
                                "features": $scope.Feature
                            },
                            style: style,
                            onEachFeature: onEachFeature
                        },


                    });




                },
                function () {

                });

        };


        $scope.set_ward = function (ward) {

            DataTunnel.set_data(ward);

            // $scope.FeatureReady = []
            var coordinates = [];
            var temp = []
            var polyjsonLayer = JSON.parse(ward['ST_AsGeoJSON(ward_area)']);
            var polyjson = JSON.parse(ward['ST_AsGeoJSON(ward_area)']);

            temp.push(polyjson.coordinates);
            coordinates = temp;

            //AKhane problem may be
            // console.log(polyjson.coordinates[0])


            if (baseWardDrawed == true) {

                console.log('editing: ', $scope.wardId)


                $scope.Feature.push({
                    "type": "Feature",
                    "properties": {
                        "name": ward.ward_number,
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": polyjson.coordinates
                    }
                });

                angular.extend($scope, {
                    center: {
                        lat: coordinates[0][0][0][1],
                        lng: coordinates[0][0][0][0],
                        zoom: 14,

                    },

                    geojson: {
                        data: {
                            "type": "FeatureCollection",
                            "features": $scope.Feature
                        },
                        style: style,
                        onEachFeature: onEachFeature
                    },


                });

            } else if (baseWardDrawed == false) {

                $scope.currentlyEdting = ward.ward_number
                $scope.wardId = ward['id'];

                console.log('editing: ', $scope.wardId)

                for (var i = polyjsonLayer.coordinates[0].length; i--;) {
                    var temp = polyjsonLayer.coordinates[0][i][0];
                    polyjsonLayer.coordinates[0][i][0] = polyjsonLayer.coordinates[0][i][1];
                    polyjsonLayer.coordinates[0][i][1] = temp;
                }

                var polyline1 = L.polygon(polyjsonLayer.coordinates).bindPopup(ward.id);

                drawnItems.addLayer(polyline1);
                baseWardDrawed = true

                angular.extend($scope, {
                    center: {
                        lat: polyjsonLayer.coordinates[0][0][0],
                        lng: polyjsonLayer.coordinates[0][0][1],
                        zoom: 14,

                    }

                });
            }

        };

        $scope.changeCenter = function (marker) {
            $rootScope.center.lat = marker.lat;
            $rootScope.center.lng = marker.lng;
        };

        $scope.openSlide = function () {
            $scope.toggle = !$scope.toggle;
        };

        $scope.clearEditable = () => {
            leafletData.getMap().then(function (map) {
                    drawnItems.clearLayers();
                    baseWardDrawed = false
                    $scope.currentlyEdting = null
                    init()
            });
        }

        $scope.clearDrawing = () => {
            $scope.Feature = []
            $scope.clearEditable()
            
        }


    }

}());