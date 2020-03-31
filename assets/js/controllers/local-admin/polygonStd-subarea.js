(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('LocalPolygonStdSubArea', LocalPolygonStdSubArea);

    LocalPolygonStdSubArea.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function LocalPolygonStdSubArea($scope, $modal, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
        // $scope.coordinates=[];
        var drawnItems = new L.FeatureGroup();

        var init = function() {
            Auth.getlocations(urls.POLYGON_AREA, function(res) {
                    $scope.areas = res;

                },
                function() {

                });

            Auth.getlocations(urls.POLYGON_SUBAREA, function(res) {
                    $scope.subareas = res;

                },
                function() {

                });

        };
        init();




        angular.extend($scope, {
            center: {
                lat: 23.728783,
                lng: 90.393791,
                zoom: 12,

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

        $scope.Feature = []
        let baseSubAreaDrawed = false

        leafletData.getMap().then(function(map) {
            $timeout(function() {
                map.invalidateSize();
                //create bounds
            }, 500);
            map.addLayer(drawnItems);


            // Set the title to show on the polygon button
            L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a sexy polygon!';

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
                var layer = e.layer;
                drawnItems.addLayer(layer);
                //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                var array = [];
                layer.toGeoJSON().geometry.coordinates[0].map(function(ary) {

                    array.push(ary.join(' '));
                });
                $scope.coordinates = array.reduce(
                    (accumulator, currentValue) => accumulator.concat(currentValue),
                    []
                );



                DataTunnel.set_data($scope.coordinates);

                var modalInstance = $modal.open({
                    //templateUrl: '/local/views/polygon-area-mod.html',
                    templateUrl: '/../../views/local-admin/polygon-subarea-mod.html',
                    controller: 'LocalPolygonModal',
                    size: 'lg',
                    scope: $scope,
                    backdrop: 'static'
                });

                drawnItems.addLayer(layer);
            });

            map.on('draw:edited', function(e) {

                console.log('updating ', $scope.subAreaId)
                var layer = e.layers;
                //drawnItems.addLayer(layer);
                //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                var array = [];
                console.log(layer.toGeoJSON())
                layer.toGeoJSON().features[0].geometry.coordinates[0].map(function(ary) {

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
                        confirmButtonText: "Yes, update SubArea Poligon!",
                        closeOnConfirm: false
                    },
                    function() {
                        var data = {
                            area: $scope.coordinates.toString()
                        };
                        Auth.updateSomething(
                            urls.POLYGON_SUBAREA + "/" + $scope.subAreaId,
                            data,
                            function(res) {
                                swal("Done", "SubArea Polygon updated");
                            },
                            function() {
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


        


        function style(feature) {
            return {

                opacity: 2,
                color: '#D4A76A',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }


        $scope.set_area = function(area) {
            // console.log(zone);
            // var polyjson = JSON.parse(zone['ST_AsGeoJSON(ward_area)']);
            // console.log(polyjson);
            // $scope.subAreaId = area['id'];
            console.log('scopeid ', $scope.subAreaId)

            Auth.getlocations(urls.SUBAREA_BY_AREA + area.id + '?', function(res) {
                    $scope.roads = res;
                    var coordinates = [];
                    var temp = [];
                    $scope.Feature = []
                    $scope.roads.map(function(road, k) {
                        var polyjson = JSON.parse(road['ST_AsGeoJSON(subarea_area)']);

                        $scope.Feature.push({
                            "type": "Feature",
                            "properties": {
                                "name": road.area_name,
                            },
                            "geometry": {
                                "type": "Polygon",
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


        $scope.set_sub_area = function(subArea) {

            DataTunnel.set_data(subArea);
      
            // $scope.FeatureReady = []
            var coordinates = [];
            var temp = []
            var polyjsonLayer = JSON.parse(subArea['ST_AsGeoJSON(subarea_area)']);
            var polyjson = JSON.parse(subArea['ST_AsGeoJSON(subarea_area)']);
      
            temp.push(polyjson.coordinates);
            coordinates = temp;
      
            //AKhane problem may be
            // console.log(polyjson.coordinates[0])
      
      
            if (baseSubAreaDrawed == true) {

                console.log('scopeid ', $scope.subAreaId)

                $scope.Feature.push({
                  "type": "Feature",
                  "properties": {
                    "name": subArea.subarea_name,
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
        
              } else if (baseSubAreaDrawed == false) {
        
                $scope.currentlyEdting = subArea.subarea_name
                $scope.subAreaId = subArea.id;

                console.log('scopeid ', $scope.subAreaId)
        
                for (var i = polyjsonLayer.coordinates[0].length; i--;) {
                  var temp = polyjsonLayer.coordinates[0][i][0];
                  polyjsonLayer.coordinates[0][i][0] = polyjsonLayer.coordinates[0][i][1];
                  polyjsonLayer.coordinates[0][i][1] = temp;
                }
        
                var polyline1 = L.polygon(polyjsonLayer.coordinates).bindPopup(subArea.id);
        
                drawnItems.addLayer(polyline1);
                baseSubAreaDrawed = true
        
                angular.extend($scope, {
                  center: {
                    lat: polyjsonLayer.coordinates[0][0][0],
                    lng: polyjsonLayer.coordinates[0][0][1],
                    zoom: 14,
        
                  }
        
                });
              }

        };



        function getColor() {
            var o = Math.round,
                r = Math.random,
                s = 255;
            return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
            //return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';

        }


        function whenClicked(e) {
            // e = event
            console.log(e.target.feature.properties.name)
            swal(e.target.feature.properties.name, '')
            // toaster.pop('success', e.target.feature.properties.name);
            // You can make your ajax call declaration here
            //$.ajax(... 
        }


        function onEachFeature(feature, layer) {
            //bind click
            // layer.on({
            //     click: whenClicked
            // });
            layer.bindTooltip(feature.properties.name, {permanent:true,direction:'center',className: 'countryLabel'});
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



        $scope.changeCenter = function(marker) {
            $rootScope.center.lat = marker.lat;
            $rootScope.center.lng = marker.lng;
        };


        $scope.openSlide = function() {
            $scope.toggle = !$scope.toggle;
        };

        $scope.clearEditable = () => {
            leafletData.getMap().then(function (map) {
                    drawnItems.clearLayers();
                    baseSubAreaDrawed = false
                    $scope.currentlyEdting = null
                    init()
            });
        }


    }

}());