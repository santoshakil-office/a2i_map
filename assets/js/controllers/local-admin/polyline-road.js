(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('LocalPolylineRoad', LocalPolylineRoad);

    LocalPolylineRoad.$inject = ['$scope', '$http', '$stateParams', '$window', '$location', '$timeout', '$modal', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function LocalPolylineRoad($scope, $http, $stateParams, $window, $location, $timeout, $modal, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {

        var modalInstance;
        var drawnItems = new L.FeatureGroup();

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

        $scope.set_area = function(area) {
            Auth.getlocations(urls.ROAD_BY_AREA + area.id + '?', function(res) {
                $scope.roads = res;
            }, function(err) {

            });
        };


        Auth.getlocations(urls.POLYGON_AREA, function(res) {
                $scope.areas = res;

            },
            function() {

            });

        $scope.onRoadSelect = function(selectedItem) {
            $scope.road_type = selectedItem;

        };


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

                    bkoi: {
                        name: 'barikoi',
                        url: 'http://map.barikoi.xyz:8080/styles/klokantech-basic/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            maxZoom: 23
                        },
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
                    // draw: {
                    //     name: 'draw',
                    //     type: 'group',
                    //     visible: true,
                    //     layerParams: {
                    //         showOnSelector: false
                    //     }
                    // }
                }
            }
        });

        leafletData.getMap().then(function(map) {
            $timeout(function() {
                map.invalidateSize();
                //create bounds
            }, 500);

            $scope.mapobj = map;

            // var drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);


            // Set the title to show on the polygon button
            L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a sexy polygon!';

            var drawControl = new L.Control.Draw({
                position: 'topleft',
                draw: {
                    polyline: {
                        metric: true
                    },
                    polygon: {
                        allowIntersection: false,
                        showArea: true,
                        drawError: {
                            color: '#b00b00',
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

            map.on('draw:created', function(e) {
                var type = e.layerType,
                    layer = e.layer;
                console.log(layer)
                if (type === 'marker') {
                    layer.bindPopup('A popup!');
                }

                drawnItems.addLayer(layer);
            });

            map.on('draw:edited', function(e) {
                var layers = e.layers;
                var array = [];

                layers.toGeoJSON().features[0].geometry.coordinates.map(function(ary) {

                    array.push(ary.join(' '));
                });
                var coordinates = array.reduce(
                    (accumulator, currentValue) => accumulator.concat(currentValue),
                    []
                );
                console.log(coordinates);
                var data = {
                    id: DataTunnel.get_data().id,
                    poly: coordinates
                }
                DataTunnel.set_data(data);


                modalInstance = $modal.open({
                    //templateUrl: '/local/views/local-admin/polyline-road-mod.html',
                    templateUrl: '/../../views/local-admin/polyline-road-up-mod.html',
                    controller: 'LocalPolygonModal',
                    size: 'lg',
                    scope: $scope,
                    backdrop: 'static'
                });

                // var countOfEditedLayers = 0;
                // layers.eachLayer(function(layer) {
                //   countOfEditedLayers++;
                // });
                // console.log("Edited " + countOfEditedLayers + " layers");
            });



            // L.DomUtil.get('changeColor').onclick = function () {
            //   drawControl.setDrawingOptions({ rectangle: { shapeOptions: { color: '#004a80' } } });
            // };
        });

        //  leafletData.getMap().then(function(map) {
        //     leafletData.getLayers().then(function(baselayers) {
        //        var drawnItems = baselayers.overlays.draw;
        //        map.on('draw:created', function (e) {
        //          var layer = e.layer;
        //          drawnItems.addLayer(layer);
        //           //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
        //            var array = [];
        //           layer.toGeoJSON().geometry.coordinates.map(function(ary) {

        //             array.push(ary.join(' '));
        //           });
        //           var coordinates = array.reduce(
        //            ( accumulator, currentValue ) => accumulator.concat(currentValue),
        //            []
        //          );

        //           var data = {
        //              id : DataTunnel.get_data().id,
        //              poly : coordinates
        //           }
        //            DataTunnel.set_data(data);


        //            modalInstance = $modal.open({
        //              //templateUrl: '/local/views/local-admin/polyline-road-mod.html',
        //              templateUrl: '/../../views/local-admin/polyline-road-up-mod.html',
        //              controller: 'PolygonModal',
        //              size: 'lg',
        //              scope: $scope
        //          });


        //        });
        //     });
        // });

        function onEachFeature(feature, layer) {
            //bind click
            layer.on({
                click: whenClicked
            });
        }

        function whenClicked(e) {
            // e = event
            // console.log(e.target.feature.properties.name)
            // swal(e.target.feature.properties.name, '')
            var data = {
                id: DataTunnel.get_data().id,
                name: e.target.feature.properties.name
            }
            DataTunnel.set_data(data);


            modalInstance = $modal.open({
                //templateUrl: '/local/views/local-admin/polyline-road-mod.html',
                templateUrl: '/../../views/local-admin/polyline-name-up-mod.html',
                controller: 'PolygonModal',
                size: 'lg',
                scope: $scope
            });
            // toaster.pop('success', e.target.feature.properties.name);
            // You can make your ajax call declaration here
            //$.ajax(... 
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



        function style(feature) {
            return {
                fillColor: getColor(feature),
                opacity: 2,
                weight: 3,
                color: getColor(feature),
                dashArray: '',
                fillOpacity: 0.7
            };
        }



        $scope.set_road = function(road) {

            DataTunnel.set_data(road);
            console.log(road);

            $scope.id = road['id'];

            $scope.Feature = []
            var coordinates = [];
            var temp = []
            var polyjson = JSON.parse(road['ST_AsGeoJSON(road_geometry)']);
            temp.push(polyjson.coordinates);
            coordinates = temp;
            console.log(polyjson.coordinates)
            var polyLayers = [];

            for (var i = polyjson.coordinates.length; i--;) {
                var temp = polyjson.coordinates[i][0];
                polyjson.coordinates[i][0] = polyjson.coordinates[i][1];
                polyjson.coordinates[i][1] = temp;
            }

            var polyline1 = L.polyline(polyjson.coordinates).bindPopup(road.road_name_number);
            // var polyline1 = L.polyline([
            //     [90.512642, 23.099993],
            //     [90.520387, 23.087633],
            //     [90.509116, 23.082483]
            // ]);
            // polyLayers.push(polyline1)
            drawnItems.addLayer(polyline1);

            // Add the layers to the drawnItems feature group 
            // for(var layer of polyLayers) {
            //   drawnItems.addLayer(layer); 
            // }


            // $scope.Feature.push({
            //     "type": "Feature",
            //     "properties": {
            //       "name": road.road_name_number,
            //       "number_of_lanes" : road.number_of_lanes,
            //       "road_condition" : road.road_condition,

            //     },
            //     "geometry": {
            //       "type": "LineString",
            //       "coordinates": polyjson.coordinates
            //     }
            //   });


            $scope.areas.push({ id: -1, name: "all", 'ST_AsGeoJSON(area)': JSON.stringify({ 'type': "Polygon", 'coordinates': coordinates }) });

            angular.extend($scope, {
                center: {
                    lat: polyjson.coordinates[0][0],
                    lng: polyjson.coordinates[0][1],
                    zoom: 14,

                },
                // geojson : {
                //     data: {
                //       "type": "FeatureCollection",
                //       "features": $scope.Feature
                //     },
                //     style: style,
                //     onEachFeature: onEachFeature 
                // },
                // selectedRoad : {},

                //  events: {
                //     geojson: {
                //         enable: [ 'click', 'mouseover' ]
                //     }
                // },


            });

        };






        $scope.openSlide = function() {
            $scope.toggle = !$scope.toggle;
        };

        $scope.changeCenter = function(marker) {
            $scope.center.lat = marker.lat;
            $scope.center.lng = marker.lng;
        };

    }

}());