(function () {
  'use strict';

  angular
    .module('barikoi')
    .controller('LocalPolygonStdZone', LocalPolygonStdZone);

  LocalPolygonStdZone.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

  function LocalPolygonStdZone($scope, $modal, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
    // $scope.coordinates=[];
    var drawnItems = new L.FeatureGroup();

    var init = function () {
      Auth.getlocations(urls.POLYGON_ZONE + '?', function (res) {
          $scope.zones = res;

        },
        function () {

        });

    };
    init();


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
          templateUrl: '/../../views/local-admin/polygon-zone-mod.html',
          controller: 'LocalPolygonModal',
          size: 'lg',
          scope: $scope,
          backdrop: 'static'
        });

        drawnItems.addLayer(layer);
      });

      map.on('draw:edited', function (e) {

        console.log('updating ', $scope.zoneId)

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
            confirmButtonText: "Yes, update Zone Poligon!",
            closeOnConfirm: false
          },
          function () {
            var data = {
              zone_area: $scope.coordinates.toString()
            };
            Auth.updateSomething(
              urls.POLYGON_ZONE + "/" + $scope.zoneId,
              data,
              function (res) {
                swal("Done", "Polygon updated");
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

    var id;
    var info;
    var addressPointsToMarkers = function (points) {
      return points.map(function (ap) {
        if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
          console.log(ap.latitude, ap.longitude);
          ap.latitude = 23.2433323;
          ap.longitude = 90.02433323;
        };
        info = '<div><p>Address: ' + ap.Address + '<br></p><p>Subtype: ' + ap.subType + '<br></p><p>Code: ' + ap.uCode + '</p></div>';
        return {
          id: ap.id,
          lat: parseFloat(ap.latitude),
          lng: parseFloat(ap.longitude),
          focus: false,
          message: info,
          userID: ap.user_id,
          updated_at: ap.updated_at,
          draggable: false,
          icon: {
            iconUrl: './assets/img/' + ap.pType + '.png',
            iconSize: [20, 20], // size of the icon
          }
        };
      });
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
    let baseZoneDrawed = false


    // leafletData.getMap().then(function(map) {
    //              leafletData.getLayers().then(function(baselayers) {
    //                 var drawnItems = baselayers.overlays.draw;
    //                 map.on('draw:created', function (e) {
    //                   var layer = e.layer;
    //                   drawnItems.addLayer(layer);
    //                    //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
    //                     var array = [];
    //                    layer.toGeoJSON().geometry.coordinates[0].map(function(ary) {

    //                      array.push(ary.join(' '));
    //                    });
    //                    $scope.coordinates = array.reduce(
    //                     ( accumulator, currentValue ) => accumulator.concat(currentValue),
    //                     []
    //                   );                                                                                                  




    //              DataTunnel.set_data($scope.coordinates);

    //                    var modalInstance = $modal.open({
    //               //templateUrl: '/local/views/polygon-area-mod.html',
    //               templateUrl: '/../../views/polygon-zone-mod.html',
    //               controller: 'PolygonModal',
    //               size: 'lg',
    //               scope: $scope
    //           });





    //                 });
    //              });
    //          });


    function getColor() {
      var o = Math.round,
          r = Math.random,
          s = 255;
      return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
  }

  function whenClicked(e) {
      // console.log(e)
      //console.log(e.target.feature.properties.key)
      swal('Zone Number: ' + e.target.feature.properties.name, '')
      // $scope.zoneId = e.target.feature.properties.key
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
      layer.bindTooltip('Zone : '+ feature.properties.name, {permanent:true,direction:'center',className: 'countryLabel'});
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


    $scope.set_zone = function (zone) {

      DataTunnel.set_data(zone);

      // $scope.FeatureReady = []
      var coordinates = [];
      var temp = []
      var polyjsonLayer = JSON.parse(zone['ST_AsGeoJSON(zone_area)']);
      var polyjson = JSON.parse(zone['ST_AsGeoJSON(zone_area)']);

      temp.push(polyjson.coordinates);
      coordinates = temp;

      //AKhane problem may be
      // console.log(polyjson.coordinates[0])


      if (baseZoneDrawed == true) {
        console.log('editing ', $scope.zoneId)

        $scope.Feature.push({
          "type": "Feature",
          "properties": {
            "name": zone.zone_number,
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

      } else if (baseZoneDrawed == false) {

        $scope.currentlyEdting = zone.zone_number
        $scope.zoneId = zone.id;

        console.log('editing ', $scope.zoneId)

        for (var i = polyjsonLayer.coordinates[0].length; i--;) {
          var temp = polyjsonLayer.coordinates[0][i][0];
          polyjsonLayer.coordinates[0][i][0] = polyjsonLayer.coordinates[0][i][1];
          polyjsonLayer.coordinates[0][i][1] = temp;
        }

        var polyline1 = L.polygon(polyjsonLayer.coordinates).bindPopup(zone.id);

        drawnItems.addLayer(polyline1);
        baseZoneDrawed = true

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
              baseZoneDrawed = false
              $scope.currentlyEdting = null
              init()

      });
  }



  }


}());