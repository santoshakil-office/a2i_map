(function () {
  'use strict';

  angular
    .module('barikoi')
    .controller('PolygonStdArea', PolygonStdArea);

  PolygonStdArea.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

  function PolygonStdArea($scope, $modal, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {

    $scope.coordinates;

    leafletData.getMap().then(function (map) {
      $timeout(function () {
        map.invalidateSize();
        //create bounds
      }, 1000);
    });


    var init = function () {
      Auth.getlocations(urls.POLYGON, function (res) {
          $scope.areas = res.area;

        },
        function () {

        });
      Auth.getlocations(urls.GET_SUBTYPES, function (res) {
          $scope.subcategories = res;
          $scope.subcategories.push({
            subtype: "all"
          });
          //console.log(res);
        },
        function () {

        });

    };
    init();

    var id;
    var info;
    var addressPointsToMarkers = function (points) {
      return points.map(function (ap) {
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

    leafletData.getMap().then(function (map) {
      leafletData.getLayers().then(function (baselayers) {
        var drawnItems = baselayers.overlays.draw;
        map.on('draw:created', function (e) {
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
            templateUrl: '../../views/polygon-area-mod.html',
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


    $scope.changeCenter = function (marker) {
      $rootScope.center.lat = marker.lat;
      $rootScope.center.lng = marker.lng;
    };



  }

}());