(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('LocalPolygonStdSupArea', LocalPolygonStdSupArea);

    LocalPolygonStdSupArea.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function LocalPolygonStdSupArea($scope, $modal, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
        // $scope.coordinates=[];
       
        var drawnItems = new L.FeatureGroup();
          var init = function() {
            Auth.getlocations(urls.POLYGON_SUBAREA, function(res) {
           $scope.subareas = res;
             
        },

         function() {
            
        });
          Auth.getlocations(urls.POLYGON_SUPAREA, function(res) {
           $scope.supareas = res;
             
        },
         function() {
            
        });
           
        };
        init();

         Auth.getlocations(urls.POLYGON_AREA+'?', function(res) {
           $scope.areas = res;
             
        },
         function() {
            
        });


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
            let baseSuperSubAreaDrawed = false


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
                            color: '#bada55'
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
                    templateUrl: '/../../views/local-admin/polygon-suparea-mod.html',
                    controller: 'LocalPolygonModal',
                    size: 'lg',
                    scope: $scope,
                    backdrop: 'static',
                    
                });

                drawnItems.addLayer(layer);
            });

            map.on('draw:edited', function(e) {
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
                        confirmButtonText: "Yes, update Super SubArea Poligon!",
                        closeOnConfirm: false
                    },
                    function() {
                        var data = {
                            area: $scope.coordinates.toString()
                        };
                        Auth.updateSomething(
                            urls.POLYGON_SUPAREA + "/" + $scope.superSubAreaId,
                            data,
                            function(res) {
                                swal("Done", "Super SubArea Polygon updated");
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

 
        function whenClicked(e) {
            // console.log(e)
            //console.log(e.target.feature.properties.key)
            swal('Super Sub Area Number: ' + e.target.feature.properties.name, '')
            // $scope.superSubArea = e.target.feature.properties.key
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
            layer.bindTooltip(feature.properties.name, {permanent:true,direction:'center',className: 'countryLabel'});
        }


        function getColor() {
            var o = Math.round,
                r = Math.random,
                s = 255;
            return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
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


  $scope.set_subarea = function(sub) {
      // console.log(zone);
      // var polyjson = JSON.parse(zone['ST_AsGeoJSON(ward_area)']);
      // console.log(polyjson);
      // $scope.superSubArea = sub['id'];

      
            var coordinates = [];
            var temp = [];
            $scope.Feature =[]
              var polyjson = JSON.parse(sub['ST_AsGeoJSON(subarea_area)']);
              
              $scope.Feature.push({
                "type": "Feature",
                "properties": {
                  "name": sub.subarea_name,
                },
                "geometry": {
                  "type": "Polygon",
                  "coordinates": polyjson.coordinates
                }
              });



             temp.push(polyjson.coordinates);
              // console.log(array.concat(polyjson.coordinates[0]));

            coordinates = temp;
          

            
            //$scope.areas.push({id: -1, name:"all", 'ST_AsGeoJSON(area)': JSON.stringify({'type': "Polygon", 'coordinates': coordinates})});
     
      angular.extend($scope, {
        center: {
          lat: coordinates[0][0][0][1],
          lng: coordinates[0][0][0][0],
          zoom: 14,

        },
                  geojson : {
                    data: {
                      "type": "FeatureCollection",
                      "features": $scope.Feature
                    },
                    style: {
                       
                            weight: 2,
                            opacity: 1,
                            color: 'red',
                            dashArray: '3',
                            fillOpacity: 0
                    },
                },

                selectedRoad : {},

                 events: {
                    geojson: {
                        enable: [ 'click', 'mouseover' ]
                    }
                },


            });
   
            
    
      
        // $scope.markers = {};
    };

    $scope.set_sup_area = function(supersubarea) {

        DataTunnel.set_data(supersubarea);
            console.log('supsubarea',supersubarea);

            var coordinates = [];
            var temp = []
            var polyjson = JSON.parse(supersubarea['ST_AsGeoJSON(supersubarea_area)']);
            var polyjsonLayer = JSON.parse(supersubarea['ST_AsGeoJSON(supersubarea_area)']);
            temp.push(polyjson.coordinates);
            coordinates = temp;
            console.log(polyjson.coordinates)


            if (baseSuperSubAreaDrawed == true) {

              console.log('editing ', $scope.superSubAreaId)


                $scope.Feature.push({
                  "type": "Feature",
                  "properties": {
                    "name": supersubarea.super_subarea_name,
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
        
              } else if (baseSuperSubAreaDrawed == false) {
        
                $scope.currentlyEdting = supersubarea.super_subarea_name
                $scope.superSubAreaId = supersubarea.id

                console.log('editing ', $scope.superSubAreaId)

                for (var i = polyjsonLayer.coordinates[0].length; i--;) {
                  var temp = polyjsonLayer.coordinates[0][i][0];
                  polyjsonLayer.coordinates[0][i][0] = polyjsonLayer.coordinates[0][i][1];
                  polyjsonLayer.coordinates[0][i][1] = temp;
                }
        
                var polyline1 = L.polygon(polyjsonLayer.coordinates).bindPopup(supersubarea.id);
        
                drawnItems.addLayer(polyline1);
                baseSuperSubAreaDrawed = true
        
                angular.extend($scope, {
                  center: {
                    lat: polyjsonLayer.coordinates[0][0][0],
                    lng: polyjsonLayer.coordinates[0][0][1],
                    zoom: 14,
        
                  }
        
                });
              }


            // ------------------------------


        };




            


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
              baseSuperSubAreaDrawed = false
              $scope.currentlyEdting = null
              init()
      });
  }

    
  }

}());